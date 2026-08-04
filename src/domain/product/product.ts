import { DomainError } from "../shared/types";

export interface ProductProps {
  id: string;
  gymId: string;
  name: string;
  sku: string | null;
  description: string | null;
  priceCents: number;
  costCents: number | null;
  stockQuantity: number;
  minStock: number;
  active: boolean;
}

export class Product {
  constructor(private readonly props: ProductProps) {}

  get id() {
    return this.props.id;
  }

  get gymId() {
    return this.props.gymId;
  }

  get name() {
    return this.props.name;
  }

  get sku() {
    return this.props.sku;
  }

  get priceCents() {
    return this.props.priceCents;
  }

  get stockQuantity() {
    return this.props.stockQuantity;
  }

  get minStock() {
    return this.props.minStock;
  }

  get active() {
    return this.props.active;
  }

  get isLowStock(): boolean {
    return this.props.stockQuantity <= this.props.minStock;
  }

  canFulfill(quantity: number): boolean {
    return quantity > 0 && this.props.stockQuantity >= quantity;
  }

  static validateCreate(input: {
    name: string;
    priceCents: number;
    stockQuantity: number;
    minStock: number;
  }): void {
    if (!input.name.trim()) {
      throw new DomainError("Product name is required");
    }
    if (input.priceCents < 0) {
      throw new DomainError("Price cannot be negative");
    }
    if (input.stockQuantity < 0) {
      throw new DomainError("Stock cannot be negative");
    }
    if (input.minStock < 0) {
      throw new DomainError("Minimum stock cannot be negative");
    }
  }

  toProps(): ProductProps {
    return { ...this.props };
  }
}
