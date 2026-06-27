import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

const SITE_URL = "https://raahcomcenter.lovable.app";
const SITE_NAME = "Raahtech Command Center";
const OG_IMAGE = `${SITE_URL}/favicon.jpeg`;

interface SEOProps {
  title: string;
  description: string;
}

export default function SEO({ title, description }: SEOProps) {
  const { pathname } = useLocation();
  const canonical = `${SITE_URL}${pathname}`;
  const fullTitle = `${title} | ${SITE_NAME}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={OG_IMAGE} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={OG_IMAGE} />
    </Helmet>
  );
}
