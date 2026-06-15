// In-memory store (simulates a database for this demo)
// In production: replace with PostgreSQL/MongoDB

import { Customer, Campaign, Communication, Segment } from "./types";
import { generateCustomers } from "./seed";

// Singleton store
let _customers: Customer[] = [];
let _campaigns: Campaign[] = [];
let _communications: Communication[] = [];
let _segments: Segment[] = [];
let _initialized = false;

function initialize() {
  if (_initialized) return;
  _initialized = true;

  _customers = generateCustomers(120);

  _segments = [
    {
      id: "seg_1",
      name: "High-Value Loyalists",
      description: "Customers with LTV > ₹5000 and 3+ orders",
      color: "#7C3AED",
      rules: [{ field: "totalSpend", operator: "gt", value: 5000 }, { field: "orderCount", operator: "gte", value: 3 }],
      customerCount: 0,
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
    {
      id: "seg_2",
      name: "Win-Back Targets",
      description: "Customers inactive for 60+ days",
      color: "#F43F5E",
      rules: [{ field: "daysSinceLastOrder", operator: "gte", value: 60 }],
      customerCount: 0,
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    },
    {
      id: "seg_3",
      name: "First-Time Buyers",
      description: "Customers with exactly 1 order",
      color: "#34D399",
      rules: [{ field: "orderCount", operator: "eq", value: 1 }],
      customerCount: 0,
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    },
    {
      id: "seg_4",
      name: "SMS Opted-In",
      description: "All customers with SMS enabled",
      color: "#FB923C",
      rules: [{ field: "channel", operator: "includes", value: "sms" }],
      customerCount: 0,
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
  ];

  // Compute segment counts
  _segments = _segments.map((seg) => ({
    ...seg,
    customerCount: getSegmentCustomers(seg.id, _customers).length,
  }));

  // Seed some campaigns
  const now = Date.now();
  _campaigns = [
    {
      id: "camp_1",
      name: "Summer Revival",
      segmentId: "seg_2",
      channel: "whatsapp",
      message: "Hey {{name}}! We miss you. Here's 20% off your next order — just for you. Use code BACK20 🛍️",
      status: "sent",
      sentCount: 38,
      deliveredCount: 35,
      openedCount: 28,
      clickedCount: 14,
      failedCount: 3,
      ordersGenerated: 6,
      createdAt: new Date(now - 7 * 86400000).toISOString(),
      sentAt: new Date(now - 7 * 86400000 + 60000).toISOString(),
    },
    {
      id: "camp_2",
      name: "Loyalty Exclusive Drop",
      segmentId: "seg_1",
      channel: "email",
      message: "Dear {{name}}, as one of our most valued members, you get early access to our new collection. Shop now 👑",
      status: "sent",
      sentCount: 22,
      deliveredCount: 22,
      openedCount: 18,
      clickedCount: 11,
      failedCount: 0,
      ordersGenerated: 9,
      createdAt: new Date(now - 3 * 86400000).toISOString(),
      sentAt: new Date(now - 3 * 86400000 + 30000).toISOString(),
    },
    {
      id: "camp_3",
      name: "New Arrival Nudge",
      segmentId: "seg_3",
      channel: "sms",
      message: "Hi {{name}}, loved your first purchase! Our newest arrivals are here. Tap to explore 🆕",
      status: "draft",
      sentCount: 0,
      deliveredCount: 0,
      openedCount: 0,
      clickedCount: 0,
      failedCount: 0,
      ordersGenerated: 0,
      createdAt: new Date(now - 1 * 86400000).toISOString(),
    },
  ];
}

export function getCustomers(): Customer[] {
  initialize();
  return _customers;
}

export function getCampaigns(): Campaign[] {
  initialize();
  return _campaigns;
}

export function getSegments(): Segment[] {
  initialize();
  return _segments;
}

export function getCommunications(): Communication[] {
  initialize();
  return _communications;
}

export function addCampaign(campaign: Campaign) {
  initialize();
  _campaigns.unshift(campaign);
}

export function updateCampaign(id: string, updates: Partial<Campaign>) {
  initialize();
  _campaigns = _campaigns.map((c) => (c.id === id ? { ...c, ...updates } : c));
}

export function addCommunications(comms: Communication[]) {
  initialize();
  _communications.push(...comms);
}

export function updateCommunication(id: string, updates: Partial<Communication>) {
  initialize();
  _communications = _communications.map((c) => (c.id === id ? { ...c, ...updates } : c));
}

export function addSegment(segment: Segment) {
  initialize();
  _segments.unshift(segment);
}

export function getSegmentCustomers(segmentId: string, customers?: Customer[]): Customer[] {
  initialize();
  const allCustomers = customers || _customers;
  const segment = _segments.find((s) => s.id === segmentId);
  if (!segment) return [];

  return allCustomers.filter((customer) => {
    return segment.rules.every((rule) => {
      const val = getCustomerField(customer, rule.field);
      switch (rule.operator) {
        case "gt": return val > rule.value;
        case "gte": return val >= rule.value;
        case "lt": return val < rule.value;
        case "lte": return val <= rule.value;
        case "eq": return val === rule.value;
        case "includes": return Array.isArray(val) ? val.includes(String(rule.value)) : String(val).includes(String(rule.value));
        default: return false;
      }
    });
  });
}

function getCustomerField(customer: Customer, field: string): number | string | string[] {
  const now = Date.now();
  switch (field) {
    case "totalSpend": return customer.totalSpend;
    case "orderCount": return customer.orders.length;
    case "daysSinceLastOrder":
      if (customer.orders.length === 0) return 999;
      const lastOrder = Math.max(...customer.orders.map((o) => new Date(o.date).getTime()));
      return Math.floor((now - lastOrder) / 86400000);
    case "channel": return customer.channels;
    default: return "";
  }
}
