export interface NewsletterSubscriber {
  id: string;
  email: string;
  is_subscribed: boolean;
  created_at: string;
  updated_at: string;
}

export interface NewsletterStats {
  totalSubscribers: number;
  activeSubscribers: number;
  unsubscribedCount: number;
  subscribedThisMonth: number;
}

