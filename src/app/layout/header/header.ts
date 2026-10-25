import { afterNextRender, Component, computed, DestroyRef, ElementRef, inject } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from "@angular/router";
import { TranslocoPipe, TranslocoService } from "@jsverse/transloco";
import { filter, map } from "rxjs";
import { Lang } from "../../core/models/lang";
import { SsrService } from "../../core/ssr.service";
import { LANGS, langUrl, savePreferredLang } from "../../i18n/i18n";
import { LocalizePipe } from "../../i18n/localize.pipe";

@Component({
  imports: [RouterLink, RouterLinkActive, TranslocoPipe, LocalizePipe],
  selector: "app-header",
  styleUrl: "./header.scss",
  templateUrl: "./header.html",
})
export class Header {
  private readonly router = inject(Router);
  private readonly transloco = inject(TranslocoService);
  private readonly ssr = inject(SsrService);

  protected readonly activeLang = toSignal(this.transloco.langChanges$, { initialValue: this.transloco.getActiveLang() });

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  /** Mevcut sayfanın diğer dillerdeki karşılıkları: /tr/cards?x=1 -> /en/cards?x=1 */
  protected readonly langLinks = computed(() =>
    LANGS.map((l) => ({ ...l, href: this.router.serializeUrl(langUrl(this.router, this.url(), l.code)) })),
  );

  /** Tercihi önce çereze yazar; yoksa guard kullanıcıyı eski tercihine geri yönlendirir. */
  protected switchLang(event: MouseEvent, lang: Lang) {
    savePreferredLang(this.ssr, lang);
    // Ctrl/Cmd/orta tık: tarayıcı yeni sekmede açsın, çerez zaten yazıldı.
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    this.router.navigateByUrl(langUrl(this.router, this.url(), lang));
  }

  constructor() {
    const host = inject(ElementRef<HTMLElement>).nativeElement;
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const observer = new ResizeObserver(() =>
        this.ssr.document.documentElement.style.setProperty("--header-height", `${host.offsetHeight}px`),
      );
      observer.observe(host);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
