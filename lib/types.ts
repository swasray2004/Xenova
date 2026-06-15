export type Channel = "whatsapp" | "sms" | "email" | "rcs";

export type CommunicationStatus =
  | "pending"
  | "sent"
  | "delivered"
  | "failed"
  | "opened"
  | "read"
  | "clicked"
  | "converted";

export interface Order {
  id: string;
  date: string;
  amount: number;
  items: string[];
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  channels: Channel[];
  totalSpend: number;
  orders: Order[];
  tags: string[];
  joinedAt: string;
}

export interface SegmentRule {
  field: string;
  operator: "gt" | "gte" | "lt" | "lte" | "eq" | "includes";
  value: number | string;
}

export interface Segment {
  id: string;
  name: string;
  description: string;
  color: string;
  rules: SegmentRule[];
  customerCount: number;
  createdAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  segmentId: string;
  channel: Channel;
  message: string;
  status: "draft" | "sending" | "sent" | "failed";
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  failedCount: number;
  ordersGenerated: number;
  createdAt: string;
  sentAt?: string;
}

export interface Communication {
  id: string;
  campaignId: string;
  customerId: string;
  customerName: string;
  channel: Channel;
  message: string;
  status: CommunicationStatus;
  sentAt: string;
  updatedAt: string;
}
