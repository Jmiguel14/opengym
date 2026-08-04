export type UserRole = "admin" | "manager" | "cashier";
export type PaymentMethod = "cash" | "card" | "transfer";
export type SessionStatus = "open" | "closed";
export type StockMovementType = "sale" | "adjustment" | "purchase" | "return";
export type CashMovementType = "in" | "out";

export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DomainError";
  }
}

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class NotFoundError extends Error {
  constructor(message = "Not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

export interface AuthContext {
  userId: string;
  email: string;
  gymId: string;
  gymName: string;
  organizationId: string;
  role: UserRole;
}

export interface Money {
  cents: number;
}

export function formatMoney(cents: number, currency = "USD", locale = "es-EC"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export function parseMoneyToCents(value: string | number): number {
  if (typeof value === "number") {
    return Math.round(value * 100);
  }
  const parsed = parseFloat(value.replace(/[^0-9.-]/g, ""));
  if (isNaN(parsed)) return 0;
  return Math.round(parsed * 100);
}
