import { NextRequest, NextResponse } from "next/server";
import { getCommunications, updateCommunication, updateCampaign, getCampaigns } from "@/lib/store";
import { CommunicationStatus } from "@/lib/types";

// This endpoint receives async callbacks from the stubbed channel service
// Modelling the real-world pattern: provider → webhook → CRM state update
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { communicationId, status, timestamp } = body as {
    communicationId: string;
    status: CommunicationStatus;
    timestamp: string;
  };

  const communications = getCommunications();
  const comm = communications.find((c) => c.id === communicationId);

  if (!comm) {
    return NextResponse.json({ error: "Communication not found" }, { status: 404 });
  }

  // Status progression guard — don't downgrade status
  const STATUS_RANK: Record<CommunicationStatus, number> = {
    pending: 0, sent: 1, delivered: 2, failed: 2,
    opened: 3, read: 4, clicked: 5, converted: 6,
  };

  if (STATUS_RANK[status] <= STATUS_RANK[comm.status]) {
    return NextResponse.json({ skipped: true });
  }

  updateCommunication(communicationId, { status, updatedAt: timestamp });

  // Roll up stats into the parent campaign
  const campaignId = comm.campaignId;
  const allComms = getCommunications().filter((c) => c.campaignId === campaignId);

  const stats = {
    deliveredCount: allComms.filter((c) => ["delivered", "opened", "read", "clicked", "converted"].includes(c.status)).length,
    openedCount: allComms.filter((c) => ["opened", "read", "clicked", "converted"].includes(c.status)).length,
    clickedCount: allComms.filter((c) => ["clicked", "converted"].includes(c.status)).length,
    failedCount: allComms.filter((c) => c.status === "failed").length,
    ordersGenerated: allComms.filter((c) => c.status === "converted").length,
  };

  updateCampaign(campaignId, stats);

  return NextResponse.json({ success: true });
}
