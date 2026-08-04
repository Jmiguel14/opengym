import { DomainError } from "../shared/types";

export interface CashRegisterSessionProps {
  id: string;
  gymId: string;
  openedBy: string;
  openedAt: Date;
  openingCashCents: number;
  closedBy: string | null;
  closedAt: Date | null;
  expectedCashCents: number | null;
  countedCashCents: number | null;
  varianceCents: number | null;
  notes: string | null;
  status: "open" | "closed";
}

export interface SessionTotals {
  cashSalesCents: number;
  cardSalesCents: number;
  transferSalesCents: number;
  cashInCents: number;
  cashOutCents: number;
  totalSalesCents: number;
  saleCount: number;
}

export class CashRegisterSession {
  constructor(
    private readonly props: CashRegisterSessionProps,
    private readonly totals: SessionTotals = {
      cashSalesCents: 0,
      cardSalesCents: 0,
      transferSalesCents: 0,
      cashInCents: 0,
      cashOutCents: 0,
      totalSalesCents: 0,
      saleCount: 0,
    },
  ) {}

  get id() {
    return this.props.id;
  }

  get gymId() {
    return this.props.gymId;
  }

  get status() {
    return this.props.status;
  }

  get openingCashCents() {
    return this.props.openingCashCents;
  }

  get openedAt() {
    return this.props.openedAt;
  }

  get closedAt() {
    return this.props.closedAt;
  }

  get expectedCashCents() {
    return this.props.expectedCashCents;
  }

  get countedCashCents() {
    return this.props.countedCashCents;
  }

  get varianceCents() {
    return this.props.varianceCents;
  }

  get notes() {
    return this.props.notes;
  }

  get sessionTotals() {
    return this.totals;
  }

  isOpen(): boolean {
    return this.props.status === "open";
  }

  expectedCash(): number {
    return (
      this.props.openingCashCents +
      this.totals.cashSalesCents +
      this.totals.cashInCents -
      this.totals.cashOutCents
    );
  }

  static validateOpen(openingCashCents: number): void {
    if (openingCashCents < 0) {
      throw new DomainError("Opening cash cannot be negative");
    }
  }

  static validateClose(countedCashCents: number): void {
    if (countedCashCents < 0) {
      throw new DomainError("Counted cash cannot be negative");
    }
  }

  toProps(): CashRegisterSessionProps {
    return { ...this.props };
  }
}
