import { useEffect } from 'react';
import { getCanonicalUrl, getSiteOrigin } from '@/lib/site';

type SeoProps = {
  title: string;
  description: string;
  noIndex?: boolean;
};

function getOrCreateMeta(selector: string, attrs: Record<string, string>) {
  const existing = document.head.querySelector<HTMLMetaElement>(selector);
  if (existing) {
    return existing;
  }

  const meta = document.createElement('meta');
  Object.entries(attrs).forEach(([key, value]) => meta.setAttribute(key, value));
  document.head.appendChild(meta);
  return meta;
}

function getOrCreateLink(rel: string) {
  const existing = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (existing) {
    return existing;
  }

  const link = document.createElement('link');
  link.setAttribute('rel', rel);
  document.head.appendChild(link);
  return link;
}

export function Seo({ title, description, noIndex = false }: SeoProps) {
  useEffect(() => {
    const previousTitle = document.title;
    const previousCanonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href;
    const descriptionMeta = getOrCreateMeta('meta[name="description"]', { name: 'description' });
    const robotsMeta = getOrCreateMeta('meta[name="robots"]', { name: 'robots' });
    const ogTitleMeta = getOrCreateMeta('meta[property="og:title"]', { property: 'og:title' });
    const ogTypeMeta = getOrCreateMeta('meta[property="og:type"]', { property: 'og:type' });
    const ogSiteNameMeta = getOrCreateMeta('meta[property="og:site_name"]', {
      property: 'og:site_name',
    });
    const ogDescriptionMeta = getOrCreateMeta('meta[property="og:description"]', {
      property: 'og:description',
    });
    const ogUrlMeta = getOrCreateMeta('meta[property="og:url"]', { property: 'og:url' });
    const ogImageMeta = getOrCreateMeta('meta[property="og:image"]', { property: 'og:image' });
    const ogImageAltMeta = getOrCreateMeta('meta[property="og:image:alt"]', {
      property: 'og:image:alt',
    });
    const twitterTitleMeta = getOrCreateMeta('meta[name="twitter:title"]', { name: 'twitter:title' });
    const twitterDescriptionMeta = getOrCreateMeta('meta[name="twitter:description"]', {
      name: 'twitter:description',
    });
    const twitterImageMeta = getOrCreateMeta('meta[name="twitter:image"]', { name: 'twitter:image' });
    const canonicalLink = getOrCreateLink('canonical');
    const currentUrl = getCanonicalUrl();
    const siteOrigin = getSiteOrigin();
    const imageUrl = `${siteOrigin}/og-image.svg`;

    document.title = title;
    descriptionMeta.setAttribute('content', description);
    robotsMeta.setAttribute('content', noIndex ? 'noindex,nofollow' : 'index,follow');
    ogTitleMeta.setAttribute('content', title);
    ogTypeMeta.setAttribute('content', 'website');
    ogSiteNameMeta.setAttribute('content', '웹사이트 견적 자동 생성기');
    ogDescriptionMeta.setAttribute('content', description);
    ogUrlMeta.setAttribute('content', currentUrl);
    ogImageMeta.setAttribute('content', imageUrl);
    ogImageAltMeta.setAttribute('content', title);
    twitterTitleMeta.setAttribute('content', title);
    twitterDescriptionMeta.setAttribute('content', description);
    twitterImageMeta.setAttribute('content', imageUrl);
    canonicalLink.setAttribute('href', currentUrl);

    return () => {
      document.title = previousTitle;
      if (previousCanonical) {
        canonicalLink.setAttribute('href', previousCanonical);
      } else if (canonicalLink.parentNode) {
        canonicalLink.remove();
      }
    };
  }, [description, noIndex, title]);

  return null;
}
