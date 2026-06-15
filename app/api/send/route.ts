import { NextRequest, NextResponse } from "next/server";
import { getCampaigns, updateCampaign, addCommunications, getSegmentCustomers } from "@/lib/store";
import { Communication } from "@/lib/types";
import { simulateSend } from "@/lib/channelService";
import { personalizeMessage } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  const { campaignId } = await req.json();

  const campaigns = getCampaigns();
  const campaign = campaigns.find((c) => c.id === campaignId);

  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  if (campaign.status === "sent") {
    return NextResponse.json({ error: "Campaign already sent" }, { status: 400 });
  }

  // Mark as sending
  updateCampaign(campaignId, { status: "sending" });

  const recipients = getSegmentCustomers(campaign.segmentId);
  const communications: Communication[] = recipients.map((customer) => ({
    id: `comm_${uuidv4().slice(0, 8)}`,
    campaignId,
    customerId: customer.id,
    customerName: customer.name,
    channel: campaign.channel,
    message: personalizeMessage(campaign.message, customer.name),
    status: "sent",
    sentAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  addCommunications(communications);

  updateCampaign(campaignId, {
    status: "sent",
    sentCount: recipients.length,
    sentAt: new Date().toISOString(),
  });

  // Get base URL for callbacks
  const origin = req.headers.get("origin") || req.nextUrl.origin;

  // Fire-and-forget: channel service asynchronously sends callbacks
  for (const comm of communications) {
    const customer = recipients.find((c) => c.id === comm.customerId)!;
    simulateSend(
      {
        communicationId: comm.id,
        recipientName: customer.name,
        recipientPhone: customer.phone,
        recipientEmail: customer.email,
        channel: campaign.channel,
        message: comm.message,
      },
      origin
    );
  }

  return NextResponse.json({ success: true, sent: recipients.length });
}
