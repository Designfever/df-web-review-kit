import { ExternalLink as ExternalLinkIcon } from 'lucide-react';
import type { ReviewExternalLink, ReviewItem } from '../../types';

const normalizeExternalLink = (
  link: ReviewExternalLink
): ReviewExternalLink | null => {
  const label = typeof link.label === 'string' ? link.label.trim() : '';
  const url = typeof link.url === 'string' ? link.url.trim() : '';

  if (!label || !url) return null;

  return {
    ...link,
    label,
    url,
    title: link.title?.trim() || undefined,
    icon: link.icon || 'external',
  };
};

const getExternalLinkIconClassName = (icon: ReviewExternalLink['icon']) => {
  const iconName = typeof icon === 'string' ? icon : 'external';
  const safeIcon = iconName.replace(/[^a-z0-9_-]/gi, '-');
  return safeIcon || 'external';
};

const getReviewItemExternalLinks = (item: ReviewItem) => {
  const links = (item.externalLinks ?? [])
    .map(normalizeExternalLink)
    .filter((link): link is ReviewExternalLink => Boolean(link));

  if (links.length > 0) return links;

  const url = item.externalIssueUrl?.trim();
  if (!url) return [];

  return [
    {
      icon: 'issue',
      label: 'Remote',
      title: 'Open remote QA',
      url,
    } satisfies ReviewExternalLink,
  ];
};

export const QaItemExternalLinks = ({ item }: { item: ReviewItem }) => {
  const links = getReviewItemExternalLinks(item);

  if (links.length === 0) return null;

  return (
    <div
      aria-label="External QA links"
      className="df-review-item-external-links"
      onClick={(event) => event.stopPropagation()}
    >
      {links.map((link, index) => {
        const title = link.title || `Open ${link.label}`;

        return (
          <a
            key={`${link.url}:${index}`}
            aria-label={title}
            className={`df-review-item-external-link is-icon-${getExternalLinkIconClassName(
              link.icon
            )}`}
            href={link.url}
            rel="noreferrer"
            target="_blank"
            title={title}
          >
            <ExternalLinkIcon aria-hidden="true" />
            <span>{link.label}</span>
          </a>
        );
      })}
    </div>
  );
};
