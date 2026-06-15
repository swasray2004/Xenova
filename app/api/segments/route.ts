import { NextResponse } from "next/server";
import { getSegments, addSegment, getSegmentCustomers } from "@/lib/store";
import { Segment } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  const segments = getSegments();
  const enriched = segments.map((s) => ({
    ...s,
    customerCount: getSegmentCustomers(s.id).length,
  }));
  return NextResponse.json(enriched);
}

export async function POST(req: Request) {
  const body = await req.json();

  const segment: Segment = {
    id: `seg_${uuidv4().slice(0, 8)}`,
    name: body.name,
    description: body.description || "",
    color: body.color || "#7C3AED",
    rules: body.rules || [],
    customerCount: 0,
    createdAt: new Date().toISOString(),
  };

  addSegment(segment);

  return NextResponse.json(
    { ...segment, customerCount: getSegmentCustomers(segment.id).length },
    { status: 201 }
  );
}
