import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');

const env = globalThis.process?.env ?? {};
const siteUrl = (env.SITE_URL || env.VITE_SITE_URL || 'https://webbrief.co.kr').replace(/\/+$/, '');

const routes = ['/', '/experts'];
const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) => `  <url>
    <loc>${siteUrl}${route}</loc>
  </url>`,
  )
  .join('\n')}
</urlset>
`;

const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /developers/workspace
Disallow: /projects/
Disallow: /wizard
Disallow: /result

Sitemap: ${siteUrl}/sitemap.xml
`;

const logoSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="웹사이트 견적 자동 생성기">
  <rect width="512" height="512" rx="120" fill="#2563EB"/>
  <path d="M154 176C154 158.327 168.327 144 186 144H326C343.673 144 358 158.327 358 176V336C358 353.673 343.673 368 326 368H186C168.327 368 154 353.673 154 336V176Z" fill="white" fill-opacity="0.12"/>
  <path d="M186 184H326C329.314 184 332 186.686 332 190V206C332 209.314 329.314 212 326 212H186C182.686 212 180 209.314 180 206V190C180 186.686 182.686 184 186 184Z" fill="white"/>
  <path d="M186 236H290C293.314 236 296 238.686 296 242V258C296 261.314 293.314 264 290 264H186C182.686 264 180 261.314 180 258V242C180 238.686 182.686 236 186 236Z" fill="white" fill-opacity="0.9"/>
  <path d="M186 288H270C273.314 288 276 290.686 276 294V310C276 313.314 273.314 316 270 316H186C182.686 316 180 313.314 180 310V294C180 290.686 182.686 288 186 288Z" fill="white" fill-opacity="0.78"/>
  <circle cx="360" cy="176" r="28" fill="#DBEAFE"/>
  <path d="M360 160V192M344 176H376" stroke="#2563EB" stroke-width="8" stroke-linecap="round"/>
</svg>
`;

const ogImageSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="웹사이트 견적 자동 생성기">
  <defs>
    <linearGradient id="bg" x1="103" y1="57" x2="1097" y2="573" gradientUnits="userSpaceOnUse">
      <stop stop-color="#EFF6FF" />
      <stop offset="0.48" stop-color="#FFFFFF" />
      <stop offset="1" stop-color="#DBEAFE" />
    </linearGradient>
    <linearGradient id="accent" x1="762" y1="118" x2="1044" y2="500" gradientUnits="userSpaceOnUse">
      <stop stop-color="#2563EB" />
      <stop offset="1" stop-color="#1D4ED8" />
    </linearGradient>
  </defs>
  <rect width="1200" height="630" rx="48" fill="url(#bg)" />
  <circle cx="1014" cy="146" r="108" fill="#BFDBFE" fill-opacity="0.6" />
  <circle cx="1084" cy="468" r="152" fill="#93C5FD" fill-opacity="0.25" />
  <rect x="102" y="104" width="420" height="422" rx="36" fill="#FFFFFF" stroke="#DBEAFE" stroke-width="4" />
  <rect x="144" y="146" width="180" height="20" rx="10" fill="#93C5FD" />
  <rect x="144" y="186" width="300" height="16" rx="8" fill="#E5E7EB" />
  <rect x="144" y="218" width="260" height="16" rx="8" fill="#E5E7EB" />
  <rect x="144" y="282" width="332" height="100" rx="24" fill="#EFF6FF" />
  <rect x="144" y="402" width="140" height="52" rx="16" fill="#2563EB" />
  <rect x="300" y="402" width="176" height="52" rx="16" fill="#DBEAFE" />
  <path d="M186 314H302M186 346H250" stroke="#2563EB" stroke-width="14" stroke-linecap="round" />
  <rect x="618" y="152" width="390" height="326" rx="36" fill="url(#accent)" />
  <path d="M674 212H926C932.627 212 938 217.373 938 224V250C938 256.627 932.627 262 926 262H674C667.373 262 662 256.627 662 250V224C662 217.373 667.373 212 674 212Z" fill="white" fill-opacity="0.18" />
  <path d="M674 286H842C848.627 286 854 291.373 854 298V324C854 330.627 848.627 336 842 336H674C667.373 336 662 330.627 662 324V298C662 291.373 667.373 286 674 286Z" fill="white" fill-opacity="0.28" />
  <path d="M674 360H790C796.627 360 802 365.373 802 372V398C802 404.627 796.627 410 790 410H674C667.373 410 662 404.627 662 398V372C662 365.373 667.373 360 674 360Z" fill="white" fill-opacity="0.4" />
  <circle cx="936" cy="378" r="46" fill="#DBEAFE" />
  <path d="M936 352V404M910 378H962" stroke="#2563EB" stroke-width="12" stroke-linecap="round" />
  <text x="144" y="548" fill="#0F172A" font-family="Noto Sans KR, sans-serif" font-size="56" font-weight="700">웹사이트 견적 자동 생성기</text>
  <text x="144" y="596" fill="#334155" font-family="Noto Sans KR, sans-serif" font-size="24" font-weight="500">의뢰 생성 · 비용 계산 · 전문가 매칭을 한 번에</text>
</svg>
`;

await mkdir(publicDir, { recursive: true });
await Promise.all([
  writeFile(path.join(publicDir, 'robots.txt'), robotsTxt, 'utf8'),
  writeFile(path.join(publicDir, 'sitemap.xml'), sitemapXml, 'utf8'),
  writeFile(path.join(publicDir, 'logo.svg'), logoSvg, 'utf8'),
  writeFile(path.join(publicDir, 'og-image.svg'), ogImageSvg, 'utf8'),
]);
