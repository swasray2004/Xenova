// Stubbed Channel Service
// Simulates a real messaging provider (WhatsApp Business API, SMS gateway, etc.)
// Asynchronously calls back into the CRM receipt endpoint with status updates
// This models the real-world pattern: send → channel delivers → webhook callbacks flow back

import { Channel, CommunicationStatus } from "./types";

interface ChannelSendPayload {
  communicationId: string;
  recipientName: string;
  recipientPhone: string;
  recipientEmail: string;
  channel: Channel;
  message: string;
}

interface ChannelCallback {
  communicationId: string;
  status: CommunicationStatus;
  timestamp: string;
}

// Simulate realistic delivery rates per channel
const CHANNEL_DELIVERY_RATES: Record<Channel, { delivered: number; opened: number; clicked: number; converted: number }> = {
  whatsapp: { delivered: 0.92, opened: 0.78, clicked: 0.35, converted: 0.12 },
  sms:      { delivered: 0.88, opened: 0.65, clicked: 0.22, converted: 0.08 },
  email:    { delivered: 0.95, opened: 0.42, clicked: 0.18, converted: 0.06 },
  rcs:      { delivered: 0.85, opened: 0.70, clicked: 0.30, converted: 0.10 },
};

async function postCallback(payload: ChannelCallback, baseUrl: string) {
  try {
    await fetch(`${baseUrl}/api/receipt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    // In production: retry queue with exponential backoff
  }
}

export async function simulateSend(payload: ChannelSendPayload, baseUrl: string): Promise<void> {
  const rates = CHANNEL_DELIVERY_RATES[payload.channel];

  // Schedule realistic async callbacks with delays (mimicking real provider behavior)
  const scheduleCallback = (status: CommunicationStatus, delayMs: number, probability: number) => {
    if (Math.random() > probability) return;
    setTimeout(() => {
      postCallback({
        communicationId: payload.communicationId,
        status,
        timestamp: new Date().toISOString(),
      }, baseUrl);
    }, delayMs);
  };

  const failed = Math.random() > rates.delivered;

  if (failed) {
    scheduleCallback("failed", randomDelay(500, 2000), 1);
    return;
  }

  // Cascade of realistic status updates with realistic timing gaps
  scheduleCallback("delivered", randomDelay(300, 1500), 1);
  scheduleCallback("opened",    randomDelay(2000, 8000),  rates.opened);
  scheduleCallback("read",      randomDelay(5000, 15000), rates.opened * 0.9);
  scheduleCallback("clicked",   randomDelay(8000, 25000), rates.clicked);
  scheduleCallback("converted", randomDelay(20000, 60000), rates.converted);
}

function randomDelay(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min)) + min;
}
