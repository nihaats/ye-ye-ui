import { PLATFORM_ID, REQUEST } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SsrService } from './ssr.service';

describe('SsrService', () => {
  afterEach(() => (document.cookie = 'lang=; path=/; max-age=0'));

  it('should read and write cookies in the browser', () => {
    const ssr = TestBed.inject(SsrService);
    ssr.setCookie('lang', 'en', { maxAge: 60 });

    expect(ssr.isBrowser).toBe(true);
    expect(ssr.getHeader('cookie')).toBeNull();
    expect(ssr.getCookie('lang')).toBe('en');
  });

  it('should read the request on the server', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: REQUEST, useValue: new Request('https://example.com/tr', { headers: { cookie: 'a=1; lang=tr' } }) },
      ],
    });
    const ssr = TestBed.inject(SsrService);

    expect(ssr.isBrowser).toBe(false);
    expect(ssr.origin).toBe('https://example.com');
    expect(ssr.getCookie('lang')).toBe('tr');
  });
});
