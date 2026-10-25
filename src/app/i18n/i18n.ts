import { DOCUMENT, isPlatformBrowser, PlatformLocation } from "@angular/common";
import { inject, Injectable, PLATFORM_ID, REQUEST } from "@angular/core";
import { CanActivateFn, CanMatchFn, NavigationEnd, RedirectFunction, Router, RouterStateSnapshot, TitleStrategy } from "@angular/router";
import { Title } from "@angular/platform-browser";
import { provideTransloco, Translation, TranslocoLoader, TranslocoService } from "@jsverse/transloco";
import { filter, firstValueFrom } from "rxjs";

export const LANGS = [
  { code: "tr", label: "Türkçe" },
  { code: "en", label: "English" },
] as const;

export type Lang = (typeof LANGS)[number]["code"];

export const DEFAULT_LANG: Lang = "tr";

const LANG_COOKIE = "lang";

// JSON dosyaları ayrı chunk olarak paketlenir; sunucu ve tarayıcı aynı yükleyiciyi kullanır, HTTP gerekmez.
const translations: Record<Lang, () => Promise<{ default: Translation }>> = {
  tr: () => import("./tr.json"),
  en: () => import("./en.json"),
};

export function isLang(value: unknown): value is Lang {
  return LANGS.some((l) => l.code === value);
}

@Injectable({ providedIn: "root" })
class JsonLoader implements TranslocoLoader {
  async getTranslation(lang: string) {
    return (await translations[isLang(lang) ? lang : DEFAULT_LANG]()).default;
  }
}

@Injectable({ providedIn: "root" })
class TranslatedTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly transloco = inject(TranslocoService);

  override updateTitle(snapshot: RouterStateSnapshot) {
    const app = this.transloco.translate("app.name");
    const key = this.buildTitle(snapshot);
    this.title.setTitle(key ? `${this.transloco.translate(key)} | ${app}` : app);
  }
}

function readCookie(cookies: string | null | undefined, name: string) {
  return cookies?.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`))?.[1];
}

function fromAcceptLanguage(header: string | null | undefined) {
  return header
    ?.split(",")
    .map((l) => l.trim().split(/[-;]/)[0].toLowerCase())
    .find(isLang);
}

/** Kullanıcının dil seçicide yaptığı son tercih; sunucuda istek başlığından, tarayıcıda document.cookie'den okunur. */
function preferredLang(): Lang | undefined {
  const cookies = isPlatformBrowser(inject(PLATFORM_ID))
    ? inject(DOCUMENT).cookie
    : inject(REQUEST, { optional: true })?.headers.get("cookie");
  const lang = readCookie(cookies, LANG_COOKIE);
  return isLang(lang) ? lang : undefined;
}

/** Yalnızca dil seçiciden çağrılır; bir linke tıklayıp başka dilde sayfa açmak tercihi değiştirmez. */
export function savePreferredLang(document: Document, lang: Lang) {
  document.cookie = `${LANG_COOKIE}=${lang}; path=/; max-age=31536000; samesite=lax`;
}

/** Aynı sayfanın başka dildeki adresi: /tr/cards?x=1 -> /en/cards?x=1 */
export function langUrl(router: Router, url: string, lang: Lang) {
  const tree = router.parseUrl(url);
  const rest = (tree.root.children["primary"]?.segments ?? []).slice(1).map((s) => s.path);
  return router.createUrlTree(["/", lang, ...rest], { queryParams: tree.queryParams, fragment: tree.fragment ?? undefined });
}

/**
 * Açılıştaki dil. Öncelik: çerez > URL ön eki > Accept-Language > varsayılan.
 * Accept-Language yalnızca ön eksiz adreslerde (/, /cards) devreye girer; ön ekli adres botlar için daima kendi dilindedir.
 * Tarayıcıda çerez yoksa sunucunun bastığı <html lang> kullanılır ki hidrasyon aynı dille yapılsın.
 */
function detectLang(): Lang {
  const cookie = preferredLang();
  if (cookie) return cookie;

  const segment = inject(PlatformLocation).pathname.split("/")[1];
  if (isLang(segment)) return segment;

  if (isPlatformBrowser(inject(PLATFORM_ID))) {
    const htmlLang = inject(DOCUMENT).documentElement.lang;
    return isLang(htmlLang) ? htmlLang : DEFAULT_LANG;
  }

  return fromAcceptLanguage(inject(REQUEST, { optional: true })?.headers.get("accept-language")) ?? DEFAULT_LANG;
}

/** Arama motorları için her dilin adresini ve sayfanın kanonik adresini <head> içine yazar. */
function updateAlternateLinks(document: Document, router: Router, origin: string) {
  document.head.querySelectorAll("link[data-i18n]").forEach((el) => el.remove());

  const add = (rel: string, href: string, hreflang?: string) => {
    const link = document.createElement("link");
    link.setAttribute("rel", rel);
    link.setAttribute("href", origin + href);
    if (hreflang) link.setAttribute("hreflang", hreflang);
    link.setAttribute("data-i18n", "");
    document.head.appendChild(link);
  };

  const [active, ...rest] = (router.parseUrl(router.url).root.children["primary"]?.segments ?? []).map((s) => s.path);
  for (const { code } of LANGS) {
    const href = router.serializeUrl(router.createUrlTree(["/", code, ...rest]));
    add("alternate", href, code);
    if (code === active) add("canonical", href);
  }
  // x-default ön eksiz adrese gider; orada dil, çerez ya da Accept-Language ile seçilir.
  add("alternate", router.serializeUrl(router.createUrlTree(["/", ...rest])), "x-default");
}

/** Uygulama açılmadan önce dili belirleyip çevirileri yükler; böylece SSR ve hidrasyon aynı metni üretir. */
export async function initI18n() {
  const transloco = inject(TranslocoService);
  const document = inject(DOCUMENT);
  const router = inject(Router);
  const origin = isPlatformBrowser(inject(PLATFORM_ID))
    ? document.location.origin
    : new URL(inject(REQUEST, { optional: true })?.url ?? "http://localhost").origin;

  transloco.langChanges$.subscribe((lang) => (document.documentElement.lang = lang));
  router.events
    .pipe(filter((e) => e instanceof NavigationEnd))
    .subscribe(() => updateAlternateLinks(document, router, origin));

  const lang = detectLang();
  await firstValueFrom(transloco.load(lang));
  transloco.setActiveLang(lang);
}

export const matchLang: CanMatchFn = (_route, segments) => isLang(segments[0]?.path);

/** URL'deki dil, kullanıcının kayıtlı tercihinden farklıysa aynı sayfanın tercih edilen dildeki adresine yönlendirir (SSR'da 302). */
export const activateLang: CanActivateFn = async (route, state) => {
  const preferred = preferredLang();
  if (preferred && preferred !== route.params["lang"]) {
    return langUrl(inject(Router), state.url, preferred);
  }

  const transloco = inject(TranslocoService);
  const lang = route.params["lang"];
  await firstValueFrom(transloco.load(lang));
  transloco.setActiveLang(lang);
  return true;
};

/** Dil ön eki olmayan adresleri aktif dile yönlendirir: /cards -> /tr/cards */
export const redirectToLang: RedirectFunction = ({ url }) =>
  inject(Router).createUrlTree(["/", inject(TranslocoService).getActiveLang(), ...url.map((s) => s.path)]);

export function provideI18n() {
  return [
    provideTransloco({
      config: {
        availableLangs: LANGS.map((l) => l.code),
        defaultLang: DEFAULT_LANG,
        fallbackLang: DEFAULT_LANG,
        reRenderOnLangChange: true,
        missingHandler: { useFallbackTranslation: true, allowEmpty: true },
      },
      loader: JsonLoader,
    }),
    { provide: TitleStrategy, useClass: TranslatedTitleStrategy },
  ];
}
