import React from "react";
import { getNewsletterSubscribersAction } from "@/actions/newsletter.actions";
import { SubscriberTable } from "@/components/admin/newsletter/subscriber-table";

export default async function AdminNewsletterPage() {
  const { subscribers } = await getNewsletterSubscribersAction();

  return (
    <div className="space-y-8">
      <div className="border-b border-border pb-6">
        <h1 className="font-serif text-3xl text-foreground">
          Newsletter Subscribers
        </h1>
        <p className="text-xs text-muted-foreground">
          Manage subscribers to the SCENTS &amp; MISTS Private Letters and export
          mailing lists.
        </p>
      </div>

      <SubscriberTable initialSubscribers={subscribers} />
    </div>
  );
}

