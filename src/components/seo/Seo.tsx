import { useEffect } from 'react';

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
    const ogDescriptionMeta = getOrCreateMeta('meta[property="og:description"]', {
      property: 'og:description',
    });
    const ogUrlMeta = getOrCreateMeta('meta[property="og:url"]', { property: 'og:url' });
    const twitterTitleMeta = getOrCreateMeta('meta[name="twitter:title"]', { name: 'twitter:title' });
    const twitterDescriptionMeta = getOrCreateMeta('meta[name="twitter:description"]', {
      name: 'twitter:description',
    });
    const canonicalLink = getOrCreateLink('canonical');
    const currentUrl = window.location.href;

    document.title = title;
    descriptionMeta.setAttribute('content', description);
    robotsMeta.setAttribute('content', noIndex ? 'noindex,nofollow' : 'index,follow');
    ogTitleMeta.setAttribute('content', title);
    ogDescriptionMeta.setAttribute('content', description);
    ogUrlMeta.setAttribute('content', currentUrl);
    twitterTitleMeta.setAttribute('content', title);
    twitterDescriptionMeta.setAttribute('content', description);
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
