export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type PaymentMethod = "cod" | "gcash" | "card" | "bank_transfer";

export interface OrderItem {
  product_id: string;
  name: string;
  brand?: string;
  volume?: string;
  sku?: string;
  price: number;
  quantity: number;
  image_url: string;
}

export interface DeliveryLocation {
  lat: number;
  lng: number;
  address_text?: string;
  city?: string;
  barangay?: string;
  postal_code?: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  email?: string;
  delivery_address: string;
  landmark: string;
  delivery_location: DeliveryLocation;
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  discount_amount: number;
  total_amount: number;
  payment_method: PaymentMethod;
  notes?: string;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateOrderInput {
  customer_name: string;
  phone: string;
  email?: string;
  delivery_address: string;
  landmark: string;
  delivery_location: DeliveryLocation;
  items: OrderItem[];
  payment_method: PaymentMethod;
  notes?: string;
}

