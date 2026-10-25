import { DOCUMENT, isPlatformBrowser, PlatformLocation } from "@angular/common";
import { inject, Injectable, PLATFORM_ID, REQUEST } from "@angular/core";
import { CookieOptions } from "./models/cookie-options";

@Injectable({ providedIn: "root" })
export class SsrService {
  private readonly location = inject(PlatformLocation);
  private readonly request = inject(REQUEST, { optional: true });

  readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  readonly document = inject(DOCUMENT);

  get origin(): string {
    return this.isBrowser ? this.document.location.origin : new URL(this.request?.url ?? "http://localhost").origin;
  }

  get pathname(): string {
    return this.location.pathname;
  }

  getHeader(name: string): string | null {
    return this.request?.headers.get(name) ?? null;
  }

  getCookie(name: string): string | undefined {
    const cookies = this.isBrowser ? this.document.cookie : this.getHeader("cookie");
    for (const part of cookies?.split(";") ?? []) {
      const [key, ...value] = part.trim().split("=");
      if (key === name) return decodeURIComponent(value.join("="));
    }
    return undefined;
  }

  setCookie(name: string, value: string, { maxAge }: CookieOptions = {}) {
    if (!this.isBrowser) return;
    let cookie = `${name}=${encodeURIComponent(value)}; path=/; samesite=lax`;
    if (maxAge !== undefined) cookie += `; max-age=${maxAge}`;
    this.document.cookie = cookie;
  }
}
