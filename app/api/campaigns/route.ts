import { NextResponse } from "next/server";
import { getCampaigns, addCampaign, getSegments } from "@/lib/store";
import { Campaign } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  const campaigns = getCampaigns();
  const segments = getSegments();

  const enriched = campaigns.map((c) => ({
    ...c,
    segment: segments.find((s) => s.id === c.segmentId),
    openRate: c.deliveredCount > 0 ? Math.round((c.openedCount / c.deliveredCount) * 100) : 0,
    clickRate: c.deliveredCount > 0 ? Math.round((c.clickedCount / c.deliveredCount) * 100) : 0,
    deliveryRate: c.sentCount > 0 ? Math.round((c.deliveredCount / c.sentCount) * 100) : 0,
  }));

  return NextResponse.json(enriched);
}

export async function POST(req: Request) {
  const body = await req.json();

  const campaign: Campaign = {
    id: `camp_${uuidv4().slice(0, 8)}`,
    name: body.name,
    segmentId: body.segmentId,
    channel: body.channel,
    message: body.message,
    status: "draft",
    sentCount: 0,
    deliveredCount: 0,
    openedCount: 0,
    clickedCount: 0,
    failedCount: 0,
    ordersGenerated: 0,
    createdAt: new Date().toISOString(),
  };

  addCampaign(campaign);
  return NextResponse.json(campaign, { status: 201 });
}
