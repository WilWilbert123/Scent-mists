import React from "react";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ScrollProgress } from "@/components/layout/scroll-progress";
import { VisitorTracker } from "@/components/layout/visitor-tracker";
import { MobileBottomBar } from "@/components/layout/mobile-bottom-bar";
import { getHomepageContentAction } from "@/actions/content.actions";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const homepageContent = await getHomepageContentAction();

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <a
        href="#main-content"
        className="visually-hidden focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-primary focus:px-4 focus:py-2 focus:text-xs focus:uppercase focus:tracking-widest focus:text-primary-foreground"
      >
        Skip to main content
      </a>
      <ScrollProgress />
      <VisitorTracker />
      <AnnouncementBar
        enabled={homepageContent.announcementEnabled}
        text={homepageContent.announcementText}
        linkText={homepageContent.announcementLinkText}
        linkHref={homepageContent.announcementLinkHref}
      />
      <Navbar
        logoUrl={homepageContent.headerLogoUrl}
        brandName={homepageContent.headerBrandName}
      />
      <main id="main-content" tabIndex={-1} className="flex-1 pb-14 md:pb-0 overflow-x-hidden w-full max-w-full">
        {children}
      </main>
      <Footer
        logoUrl={homepageContent.footerLogoUrl || homepageContent.headerLogoUrl}
        brandName={homepageContent.headerBrandName}
        description={homepageContent.footerDescription}
      />
      <MobileBottomBar />
    </div>
  );
}

