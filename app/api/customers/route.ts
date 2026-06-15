import { NextRequest, NextResponse } from "next/server";
import { getCustomers } from "@/lib/store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.toLowerCase() || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  let customers = getCustomers();

  if (search) {
    customers = customers.filter(
      (c) =>
        c.name.toLowerCase().includes(search) ||
        c.email.toLowerCase().includes(search) ||
        c.city.toLowerCase().includes(search)
    );
  }

  const total = customers.length;
  const paginated = customers.slice((page - 1) * limit, page * limit);

  return NextResponse.json({ customers: paginated, total, page, limit });
}
