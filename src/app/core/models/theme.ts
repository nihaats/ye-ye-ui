export interface ThemeFont {
  family: string;
  fallback: string;
  weights?: number[];
}

export interface ThemeColors {
  primary: string;
  primaryLight: string;
  dark: string;
  surface: string;
  light: string;
}

export interface ThemeFonts {
  body: ThemeFont;
  heading: ThemeFont;
  condensed: ThemeFont;
  digital: ThemeFont;
  poster: ThemeFont;
  serif: ThemeFont;
  script: ThemeFont;
  retro: ThemeFont;
}

export interface Theme {
  colors: ThemeColors;
  fonts: ThemeFonts;
}
