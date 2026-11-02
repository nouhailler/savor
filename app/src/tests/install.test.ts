import { describe, expect, it } from 'vitest';
import { detectPlatform, INSTALL_STEPS } from '../services/install';

describe('explications d’installation', () => {
  it('reconnaît la plateforme', () => {
    expect(detectPlatform('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Safari/604.1', 5)).toBe('ios');
    expect(detectPlatform('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) Version/17.0 Safari/605.1', 5)).toBe('ios');
    expect(detectPlatform('Mozilla/5.0 (Linux; Android 14) Chrome/120.0 Mobile Safari/537.36', 5)).toBe('android');
    expect(detectPlatform('Mozilla/5.0 (X11; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0', 0)).toBe('firefox-desktop');
    expect(detectPlatform('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) Version/17.0 Safari/605.1', 0)).toBe('safari-desktop');
    expect(detectPlatform('Mozilla/5.0 (Windows NT 10.0) Chrome/120.0 Safari/537.36 Edg/120.0', 0)).toBe('other');
  });
  it('donne des étapes pour chaque plateforme', () => {
    for (const help of Object.values(INSTALL_STEPS)) expect(help.steps.length).toBeGreaterThanOrEqual(3);
  });
});
