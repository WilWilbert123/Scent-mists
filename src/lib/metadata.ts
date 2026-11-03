import type { Metadata } from "next";
import { BRAND_NAME, SITE_DESCRIPTION } from "./constants";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export function constructMetadata({
  title,
  description = SITE_DESCRIPTION,
  path = "/",
  image = "/images/hero/himalayan-cherry-blossom-bg.webp",
  noIndex = false,
}: {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
} = {}): Metadata {
  const fullTitle = title
    ? `${title} | ${BRAND_NAME}`
    : `${BRAND_NAME} — Haute Parfumerie`;
  const canonicalUrl = new URL(path, SITE_URL).toString();

  return {
    title: fullTitle,
    description,
    metadataBase: new URL(SITE_URL),
    icons: {
      icon: [
        { url: "/images/logo/scentmistslogo.png", type: "image/png" },
        { url: "/favicon.ico", sizes: "any" },
      ],
      shortcut: "/images/logo/scentmistslogo.png",
      apple: "/images/logo/scentmistslogo.png",
    },
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalUrl,
      siteName: BRAND_NAME,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          nocache: true,
          googleBot: {
            index: false,
            follow: false,
            noimageindex: true,
          },
        }
      : {
          index: true,
          follow: true,
        },
  };
}
