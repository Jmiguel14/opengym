export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "admin" | "manager" | "cashier";
export type PaymentMethod = "cash" | "card" | "transfer";
export type SessionStatus = "open" | "closed";
export type StockMovementType = "sale" | "adjustment" | "purchase" | "return";
export type CashMovementType = "in" | "out";

export type OrganizationRow = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type GymRow = {
  id: string;
  organization_id: string;
  name: string;
  address: string | null;
  timezone: string;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type MembershipRow = {
  id: string;
  user_id: string;
  gym_id: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

export type ProductRow = {
  id: string;
  gym_id: string;
  name: string;
  sku: string | null;
  description: string | null;
  price_cents: number;
  cost_cents: number | null;
  stock_quantity: number;
  min_stock: number;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type StockMovementRow = {
  id: string;
  gym_id: string;
  product_id: string;
  quantity: number;
  movement_type: StockMovementType;
  reason: string | null;
  reference_id: string | null;
  created_by: string | null;
  created_at: string;
};

export type SessionRow = {
  id: string;
  gym_id: string;
  opened_by: string;
  opened_at: string;
  opening_cash_cents: number;
  closed_by: string | null;
  closed_at: string | null;
  expected_cash_cents: number | null;
  counted_cash_cents: number | null;
  variance_cents: number | null;
  notes: string | null;
  status: SessionStatus;
  created_at: string;
  updated_at: string;
};

export type SaleRow = {
  id: string;
  gym_id: string;
  session_id: string;
  total_cents: number;
  payment_method: PaymentMethod;
  sold_by: string;
  created_at: string;
};

export type SaleItemRow = {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price_cents: number;
  subtotal_cents: number;
  created_at: string;
};

export type CashMovementRow = {
  id: string;
  gym_id: string;
  session_id: string;
  amount_cents: number;
  movement_type: CashMovementType;
  reason: string;
  created_by: string;
  created_at: string;
};

// Regenerate with: npx supabase gen types typescript --project-id YOUR_REF
export type Database = {
  public: {
    Tables: {
      products: { Row: ProductRow; Insert: Partial<ProductRow>; Update: Partial<ProductRow> };
      sales: { Row: SaleRow; Insert: Partial<SaleRow>; Update: Partial<SaleRow> };
      cash_register_sessions: { Row: SessionRow; Insert: Partial<SessionRow>; Update: Partial<SessionRow> };
      user_gym_memberships: { Row: MembershipRow; Insert: Partial<MembershipRow>; Update: Partial<MembershipRow> };
      gyms: { Row: GymRow; Insert: Partial<GymRow>; Update: Partial<GymRow> };
    };
  };
};
