<p align="center">
  <img src="public/images/logo/scentmistslogo.png" alt="Scents & Mists Logo" width="120" />
</p>

# Scents & Mists

A modern fragrance showcase, customer order management, and administrative platform designed for luxury body mists, fine perfumes, and artisanal scents.

---

## Overview

Scents & Mists is a dedicated e-commerce and fragrance catalog platform that enables customers to explore scent profiles, review olfactory note pyramids, and place orders with pinpoint GPS delivery location selection. 

The application includes an executive administrative dashboard for catalog maintenance, real-time order processing, automated scheduled flash sale campaigns, customer concierge triage, and privacy-conscious visitor analytics.

---

## Core Capabilities

- **Fragrance Catalog & Scent Profiles**: Detailed fragrance dossiers featuring three-tier olfactory pyramids (top, heart, and base notes), concentration ratings, volume specifications (50ml Aroma Body Mists and 85ml Victoria's Secret Eau de Parfum collections), and live stock tracking.
- **Cart & Dynamic Checkout**: Cart management with configurable delivery fees, automated free delivery threshold verification, and cash-on-delivery order processing.
- **Interactive Delivery Mapping**: Precise delivery location pinning powered by Leaflet and OpenStreetMap coordinates.
- **Live Order Tracking**: Customer-facing order tracking portal with multi-stage fulfillment progress updates from order placement to final delivery.
- **Automated Scheduled Promotions**: Flash sale engine supporting scheduled start and end date windows, percentage or fixed-amount discounts, and automated price reversion upon campaign expiration.
- **Executive Administration Suite**: Role-based access control (RBAC), multi-order bulk workflow management, catalog image uploads, concierge enquiry triage, and system audit logs.

---

## Tech Stack

### Frontend & Core
- **Next.js 15**: App Router, React Server Components, and Server Actions
- **React 19**: Modern UI rendering and client components
- **TypeScript**: End-to-end static typing across catalog, orders, and admin models
- **Tailwind CSS**: Utility-first styling with integrated light and dark theme system
- **Radix UI**: Accessible UI component primitives
- **Lucide Icons**: Comprehensive interface iconography

### 3D Visualization & Animations
- **Three.js**: Real-time 3D graphics rendering
- **React Three Fiber & Drei**: Declarative 3D scene management for fragrance bottle interactions
- **Framer Motion**: Page transitions and interactive component animations

### Backend, Database & Infrastructure
- **Supabase**: PostgreSQL database, Supabase Auth, Storage buckets, and Row Level Security (RLS)
- **Leaflet & OpenStreetMap**: Interactive client-side map rendering and coordinate selection
- **React Hook Form & Zod**: Form management, runtime data validation, and input schema enforcement
- **Recharts**: Data visualization for administrative visitor analytics and store telemetry
