import { effect, inject, Injectable, signal } from "@angular/core";
import { Theme, ThemeFont } from "./models/theme";
import { SsrService } from "./ssr.service";

@Injectable({ providedIn: "root" })
export class ThemeService {
  private readonly document = inject(SsrService).document;

  readonly theme = signal<Theme>({
    colors: {
      primary: "#d4a843",
      primaryLight: "#f3d98c",
      dark: "#08080c",
      surface: "#121218",
      light: "#f1f1f1",
    },
    fonts: {
      body: { family: "Roboto", fallback: "sans-serif", weights: [300, 400, 500] },
      heading: { family: "Oswald", fallback: "sans-serif", weights: [400, 500] },
      condensed: { family: "Barlow Condensed", fallback: "sans-serif", weights: [500, 600, 700, 800] },
      digital: { family: "Orbitron", fallback: "sans-serif", weights: [600, 700, 800, 900] },
      poster: { family: "Bebas Neue", fallback: "sans-serif" },
      serif: { family: "Cinzel", fallback: "serif", weights: [500, 600, 700] },
      script: { family: "Great Vibes", fallback: "cursive" },
      retro: { family: "Bungee", fallback: "sans-serif" },
    },
  });

  constructor() {
    effect(() => this.apply(this.theme()));
  }

  private apply({ colors, fonts }: Theme) {
    const style = this.document.documentElement.style;
    for (const [name, value] of Object.entries(colors)) {
      style.setProperty(`--ye-color-${this.kebab(name)}`, value);
    }
    for (const [name, font] of Object.entries(fonts) as [string, ThemeFont][]) {
      style.setProperty(`--ye-font-${this.kebab(name)}`, `"${font.family}", ${font.fallback}`);
    }
    this.fontsLink().href = this.fontsUrl(Object.values(fonts));
  }

  private fontsLink(): HTMLLinkElement {
    let link = this.document.head.querySelector<HTMLLinkElement>("link#theme-fonts");
    if (!link) {
      link = this.document.createElement("link");
      link.id = "theme-fonts";
      link.rel = "stylesheet";
      this.document.head.appendChild(link);
    }
    return link;
  }

  private fontsUrl(fonts: ThemeFont[]): string {
    const families = fonts.map(({ family, weights }) => {
      const name = family.replace(/ /g, "+");
      return weights?.length ? `family=${name}:wght@${weights.join(";")}` : `family=${name}`;
    });
    return `https://fonts.googleapis.com/css2?${families.join("&")}&display=swap`;
  }

  private kebab(value: string): string {
    return value.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
  }
}
