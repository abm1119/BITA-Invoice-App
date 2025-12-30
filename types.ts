
export enum PaymentStatus {
  UNPAID = 'Unpaid',
  PARTIAL = 'Partial',
  PAID = 'Paid'
}

export interface LineItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  vendorId: string;
  invoiceNumber: string;
  issueDate: string;
  paymentDate?: string;
  totalAmount: number;
  paidAmount: number;
  status: PaymentStatus;
  lineItems: LineItem[];
}

export interface Vendor {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
}

export interface PriceHistoryPoint {
  date: string;
  price: number;
  vendorName: string;
}

export interface AppState {
  vendors: Vendor[];
  invoices: Invoice[];
}
