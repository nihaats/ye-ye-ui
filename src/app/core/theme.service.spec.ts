import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  it('should apply colors, fonts and the fonts stylesheet to the document', () => {
    const theme = TestBed.inject(ThemeService);
    TestBed.tick();

    const style = document.documentElement.style;
    expect(style.getPropertyValue('--ye-color-primary')).toBe(theme.theme().colors.primary);
    expect(style.getPropertyValue('--ye-font-heading')).toBe('"Oswald", sans-serif');
    expect(document.querySelector<HTMLLinkElement>('link#theme-fonts')?.href).toContain('family=Barlow+Condensed:wght@500;600;700;800');
  });

  it('should re-apply when the theme changes', () => {
    const theme = TestBed.inject(ThemeService);
    theme.theme.update((t) => ({ ...t, colors: { ...t.colors, primary: '#123456' } }));
    TestBed.tick();

    expect(document.documentElement.style.getPropertyValue('--ye-color-primary')).toBe('#123456');
    expect(document.querySelectorAll('link#theme-fonts').length).toBe(1);
  });
});
