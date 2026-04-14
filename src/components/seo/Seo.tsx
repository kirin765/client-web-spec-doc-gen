import { useEffect } from 'react';
import { getCanonicalUrl, getSiteOrigin } from '@/lib/site';

type SeoProps = {
  title: string;
  description: string;
  noIndex?: boolean;
  keywords?: string[];
  type?: 'website' | 'article' | 'profile';
  imageAlt?: string;
  canonicalUrl?: string;
  structuredData?: Record<string, unknown> | Array<Record<string, unknown>>;
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

export function Seo({
  title,
  description,
  noIndex = false,
  keywords,
  type = 'website',
  imageAlt,
  canonicalUrl,
  structuredData,
}: SeoProps) {
  useEffect(() => {
    const previousTitle = document.title;
    const previousCanonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href;
    const descriptionMeta = getOrCreateMeta('meta[name="description"]', { name: 'description' });
    const keywordsMeta = getOrCreateMeta('meta[name="keywords"]', { name: 'keywords' });
    const robotsMeta = getOrCreateMeta('meta[name="robots"]', { name: 'robots' });
    const googlebotMeta = getOrCreateMeta('meta[name="googlebot"]', { name: 'googlebot' });
    const ogTitleMeta = getOrCreateMeta('meta[property="og:title"]', { property: 'og:title' });
    const ogTypeMeta = getOrCreateMeta('meta[property="og:type"]', { property: 'og:type' });
    const ogSiteNameMeta = getOrCreateMeta('meta[property="og:site_name"]', {
      property: 'og:site_name',
    });
    const ogLocaleMeta = getOrCreateMeta('meta[property="og:locale"]', { property: 'og:locale' });
    const ogDescriptionMeta = getOrCreateMeta('meta[property="og:description"]', {
      property: 'og:description',
    });
    const ogUrlMeta = getOrCreateMeta('meta[property="og:url"]', { property: 'og:url' });
    const ogImageMeta = getOrCreateMeta('meta[property="og:image"]', { property: 'og:image' });
    const ogImageAltMeta = getOrCreateMeta('meta[property="og:image:alt"]', {
      property: 'og:image:alt',
    });
    const twitterCardMeta = getOrCreateMeta('meta[name="twitter:card"]', { name: 'twitter:card' });
    const twitterTitleMeta = getOrCreateMeta('meta[name="twitter:title"]', { name: 'twitter:title' });
    const twitterDescriptionMeta = getOrCreateMeta('meta[name="twitter:description"]', {
      name: 'twitter:description',
    });
    const twitterImageMeta = getOrCreateMeta('meta[name="twitter:image"]', { name: 'twitter:image' });
    const canonicalLink = getOrCreateLink('canonical');
    const currentUrl = canonicalUrl || getCanonicalUrl();
    const siteOrigin = getSiteOrigin();
    const imageUrl = `${siteOrigin}/og-image.svg`;
    const schemaNodes = structuredData ? (Array.isArray(structuredData) ? structuredData : [structuredData]) : [];
    const schemaScripts = schemaNodes.map((node, index) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.dataset.seoManaged = 'true';
      script.dataset.seoIndex = String(index);
      script.textContent = JSON.stringify(node);
      document.head.appendChild(script);
      return script;
    });

    document.title = title;
    descriptionMeta.setAttribute('content', description);
    keywordsMeta.setAttribute('content', keywords?.join(', ') || '');
    robotsMeta.setAttribute('content', noIndex ? 'noindex,nofollow' : 'index,follow,max-image-preview:large');
    googlebotMeta.setAttribute('content', noIndex ? 'noindex,nofollow' : 'index,follow,max-image-preview:large');
    ogTitleMeta.setAttribute('content', title);
    ogTypeMeta.setAttribute('content', type || 'website');
    ogSiteNameMeta.setAttribute('content', '웹사이트 견적 자동 생성기');
    ogLocaleMeta.setAttribute('content', 'ko_KR');
    ogDescriptionMeta.setAttribute('content', description);
    ogUrlMeta.setAttribute('content', currentUrl);
    ogImageMeta.setAttribute('content', imageUrl);
    ogImageAltMeta.setAttribute('content', imageAlt || title);
    twitterCardMeta.setAttribute('content', 'summary_large_image');
    twitterTitleMeta.setAttribute('content', title);
    twitterDescriptionMeta.setAttribute('content', description);
    twitterImageMeta.setAttribute('content', imageUrl);
    canonicalLink.setAttribute('href', currentUrl);

    return () => {
      document.title = previousTitle;
      schemaScripts.forEach((script) => script.remove());
      if (previousCanonical) {
        canonicalLink.setAttribute('href', previousCanonical);
      } else if (canonicalLink.parentNode) {
        canonicalLink.remove();
      }
    };
  }, [canonicalUrl, description, imageAlt, keywords, noIndex, structuredData, title, type]);

  return null;
}
