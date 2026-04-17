import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://iplanalytics.app';

interface PageSEOProps {
  title: string;
  description: string;
  path: string;
}

export default function PageSEO({ title, description, path }: PageSEOProps) {
  const url = `${SITE_URL}${path}`;
  const fullTitle = `${title} — IPL Analytics Hub`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
}
