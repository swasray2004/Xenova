import { NextRequest, NextResponse } from "next/server";
import { getSegments } from "@/lib/store";

// AI-powered message suggestion using Claude
// In production: fine-tuned on brand voice + past campaign performance
export async function POST(req: NextRequest) {
  const { segmentId, channel, campaignGoal } = await req.json();

  const segments = getSegments();
  const segment = segments.find((s) => s.id === segmentId);
  if (!segment) {
    return NextResponse.json({ error: "Segment not found" }, { status: 404 });
  }

  const channelContext: Record<string, string> = {
    whatsapp: "conversational, uses 1-2 emojis, under 160 chars ideally",
    sms: "very concise, no emojis, under 120 chars, includes opt-out",
    email: "warm, can be 2-3 sentences, subject-line style opener",
    rcs: "rich and visual, can include CTA text, 1-2 emojis",
  };

  const prompt = `You are a senior CRM copywriter for a premium Indian D2C fashion/lifestyle brand.
Write 3 short, personalised campaign messages for a "${segment.name}" segment.
Segment description: ${segment.description}
Channel: ${channel} — style guide: ${channelContext[channel] || "concise and warm"}
Campaign goal: ${campaignGoal || "re-engage and drive a purchase"}

Rules:
- Use {{name}} as the personalisation placeholder (first name will be substituted)
- Sound warm and human, not robotic or generic
- Be specific to the segment's behaviour (e.g., win-back tone for lapsed, exclusive tone for VIPs)
- Each message on its own line, numbered 1. 2. 3.
- No explanations, just the 3 messages.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 400,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || "";

    const suggestions = text
      .split("\n")
      .filter((line: string) => /^\d+\./.test(line.trim()))
      .map((line: string) => line.replace(/^\d+\.\s*/, "").trim())
      .filter((line: string) => line.length > 0);

    return NextResponse.json({ suggestions });
  } catch {
    // Fallback suggestions if API is unavailable
    const fallbacks = [
      `Hey {{name}}! We thought of you — your next order is 20% off. Shop now 🛍️`,
      `{{name}}, something special is waiting for you. Don't miss our latest drop ✨`,
      `Hi {{name}}, it's been a while! Come back and discover what's new 🆕`,
    ];
    return NextResponse.json({ suggestions: fallbacks });
  }
}
