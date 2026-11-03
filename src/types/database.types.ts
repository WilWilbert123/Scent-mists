export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type EnquiryStatus = "NEW" | "PENDING" | "CONTACTED" | "RESOLVED" | "ARCHIVED";

export interface Database {
  public: {
    Tables: {
      admin_profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: "ADMIN";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          role?: "ADMIN";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          role?: "ADMIN";
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string;
          fragrance_family: string;
          top_notes: string[];
          heart_notes: string[];
          base_notes: string[];
          image_url: string;
          gallery: string[];
          collection_id: string | null;
          is_featured: boolean;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description: string;
          fragrance_family: string;
          top_notes?: string[];
          heart_notes?: string[];
          base_notes?: string[];
          image_url: string;
          gallery?: string[];
          collection_id?: string | null;
          is_featured?: boolean;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string;
          fragrance_family?: string;
          top_notes?: string[];
          heart_notes?: string[];
          base_notes?: string[];
          image_url?: string;
          gallery?: string[];
          collection_id?: string | null;
          is_featured?: boolean;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      collections: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string;
          image_url: string;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description: string;
          image_url: string;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string;
          image_url?: string;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      enquiries: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          phone: string | null;
          subject: string;
          message: string;
          status: EnquiryStatus;
          internal_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          email: string;
          phone?: string | null;
          subject: string;
          message: string;
          status?: EnquiryStatus;
          internal_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          phone?: string | null;
          subject?: string;
          message?: string;
          status?: EnquiryStatus;
          internal_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      visitor_analytics: {
        Row: {
          id: string;
          anonymous_visitor_id: string;
          session_id: string;
          page_path: string;
          referrer_category: string;
          device_category: string;
          browser_category: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          anonymous_visitor_id: string;
          session_id: string;
          page_path: string;
          referrer_category: string;
          device_category: string;
          browser_category: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          anonymous_visitor_id?: string;
          session_id?: string;
          page_path?: string;
          referrer_category?: string;
          device_category?: string;
          browser_category?: string;
          created_at?: string;
        };
      };
      newsletter_subscribers: {
        Row: {
          id: string;
          email: string;
          is_subscribed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          is_subscribed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          is_subscribed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      site_content: {
        Row: {
          id: string;
          content_key: string;
          content_value: Json;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          content_key: string;
          content_value: Json;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          id?: string;
          content_key?: string;
          content_value?: Json;
          updated_at?: string;
          updated_by?: string | null;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          admin_user_id: string;
          action: string;
          resource_type: string;
          resource_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_user_id: string;
          action: string;
          resource_type: string;
          resource_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          admin_user_id?: string;
          action?: string;
          resource_type?: string;
          resource_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      enquiry_status: EnquiryStatus;
    };
  };
}

