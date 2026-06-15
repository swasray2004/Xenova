import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const apiKey = process.env.GOOGLE_AI_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Mock campaign data for different types of goals
const generateMockCampaign = (goal: string) => {
  const lowerGoal = goal.toLowerCase();
  
  // Determine campaign type and generate appropriate data
  let segment, channels, ctr, message, reasoning;

  if (
    lowerGoal.includes("inactive") ||
    lowerGoal.includes("lapsed") ||
    lowerGoal.includes("churn") ||
    lowerGoal.includes("win back")
  ) {
    segment = {
      count: 1248,
      description:
        "Customers who haven't made a purchase in 45+ days but have high historical engagement",
    };
    channels = ["WhatsApp", "Email"];
    ctr = 12.4;
    message =
      "Hey there! We've missed you and have something special. Come back and enjoy 15% off your next order—valid for 7 days only. We'd love to see you again!";
    reasoning =
      "WhatsApp drives highest re-engagement rates for lapsed customers. Email provides secondary touchpoint for broader reach.";
  } else if (
    lowerGoal.includes("birthday") ||
    lowerGoal.includes("anniversary")
  ) {
    segment = {
      count: 287,
      description:
        "Customers with birthdays this month, primarily ages 25-55 with high repeat purchase history",
    };
    channels = ["Email", "SMS"];
    ctr = 18.3;
    message =
      "Happy Birthday! 🎉 It's your special day—celebrate with us and enjoy 25% off everything. Use code BIRTHDAY25 at checkout. Valid for your birthday month.";
    reasoning =
      "Birthday campaigns have highest engagement. SMS ensures immediate notification, Email provides detailed offer showcase.";
  } else if (
    lowerGoal.includes("vip") ||
    lowerGoal.includes("exclusive") ||
    lowerGoal.includes("top")
  ) {
    segment = {
      count: 49,
      description:
        "Top 1% customers by lifetime value ($5000+), early adopters with highest engagement",
    };
    channels = ["WhatsApp", "Email"];
    ctr = 24.1;
    message =
      "Exclusive Access Alert! You're part of our VIP inner circle. First access to our new collection launches tomorrow with special VIP pricing. Use code VIP30 for 30% off all new items.";
    reasoning =
      "VIP audiences respond best to WhatsApp for personalized, premium experience. Email for comprehensive collection details.";
  } else if (
    lowerGoal.includes("new") ||
    lowerGoal.includes("launch") ||
    lowerGoal.includes("product")
  ) {
    segment = {
      count: 3847,
      description:
        "Customers who purchased similar categories in past 6 months, demonstrating clear interest",
    };
    channels = ["Email", "Push Notification"];
    ctr = 15.2;
    message =
      "Introducing [Product]! We spent months perfecting this, and we think you'll love it. Be among the first to experience it. Shop now and get 20% off with code NEW20.";
    reasoning =
      "Email allows detailed product storytelling. Push notification captures app users for immediate awareness and urgency.";
  } else if (
    lowerGoal.includes("seasonal") ||
    lowerGoal.includes("sale") ||
    lowerGoal.includes("flash")
  ) {
    segment = {
      count: 5234,
      description:
        "All customers who made a purchase in the last 90 days, sorted by recent activity",
    };
    channels = ["SMS", "Push Notification"];
    ctr = 14.7;
    message =
      "⚡ FLASH SALE: 40% off everything for the next 48 hours! Spring collection must go before summer arrives. Shop now before it's gone!";
    reasoning =
      "Time-sensitive offers need SMS for immediate mobile notification and Push for app-active users. Both drive urgency.";
  } else if (lowerGoal.includes("nurture") || lowerGoal.includes("first")) {
    segment = {
      count: 892,
      description:
        "First-time buyers from last 30 days, high potential for repeat purchase",
    };
    channels = ["Email", "In-App"];
    ctr = 16.5;
    message =
      "Welcome! Thank you for your first purchase. We want to make sure you love it. Here's 20% off your next order to explore more. Plus, check out these items other customers loved!";
    reasoning =
      "New customers benefit from educational email sequences. In-app messaging reinforces engagement while browsing.";
  } else {
    // Default campaign
    segment = {
      count: 2156,
      description:
        "Target audience matching your campaign goal characteristics and behavior patterns",
    };
    channels = ["Email", "WhatsApp"];
    ctr = 13.8;
    message = `Based on your goal: "${goal.substring(0, 50)}...", we recommend a personalized message highlighting your unique value proposition. Craft a message that speaks directly to customer needs.`;
    reasoning =
      "Email provides broad reach with detailed messaging. WhatsApp adds personal touch for higher engagement.";
  }

  return {
    segment,
    channels,
    ctr,
    message,
    reasoning,
  };
};

export async function POST(req: NextRequest) {
  try {
    const { goal } = await req.json();

    if (!goal || goal.trim().length === 0) {
      return NextResponse.json(
        { error: "Campaign goal is required" },
        { status: 400 }
      );
    }

    // Try to use real API, fallback to mock
    try {
      if (!genAI) {
        throw new Error("GOOGLE_AI_KEY environment variable is not configured");
      }
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

      const prompt = `You are an expert marketing strategist for an e-commerce CRM. Analyze this campaign goal and provide a structured JSON response:

Goal: "${goal}"

Respond ONLY with valid JSON (no markdown, no explanation) in this exact format:
{
  "segment": {
    "count": <number between 100-50000>,
    "description": "<brief 1-2 sentence description of who these customers are>"
  },
  "channels": ["<channel1>", "<channel2>"],
  "ctr": <estimated click-through rate as number between 2-30>,
  "message": "<personalized message template for customers, 2-3 sentences>",
  "reasoning": "<1-2 sentences explaining why you chose these channels and messaging>"
}

Guidelines:
- Make segment counts realistic (100-50000)
- Channels should be from: Email, SMS, WhatsApp, Push Notification, In-App
- CTR should be realistic (2-30%)
- Message should be friendly, action-oriented, and personalized
- Keep reasoning concise
- Do NOT include any markdown formatting, backticks, or explanation`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      // Parse JSON response
      let jsonStart = text.indexOf("{");
      let jsonEnd = text.lastIndexOf("}") + 1;

      if (jsonStart === -1 || jsonEnd === 0) {
        throw new Error("No valid JSON found in response");
      }

      let jsonStr = text.substring(jsonStart, jsonEnd);
      const campaignData = JSON.parse(jsonStr);

      // Validate response structure
      if (
        !campaignData.segment ||
        !campaignData.channels ||
        !campaignData.ctr ||
        !campaignData.message ||
        !campaignData.reasoning
      ) {
        throw new Error("Invalid campaign data structure");
      }

      return NextResponse.json(campaignData);
    } catch (apiError) {
      console.log("Using mock data due to API error:", apiError);
      // Fallback to mock data
      const mockData = generateMockCampaign(goal);
      return NextResponse.json(mockData);
    }
  } catch (error) {
    console.error("Campaign generation error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to generate campaign",
      },
      { status: 500 }
    );
  }
}
