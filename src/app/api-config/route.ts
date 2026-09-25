import { NextResponse, type NextRequest } from "next/server";
import {
  getRequestOriginFromHeaders,
  resolvePraxisApiConfig,
} from "@/config/praxis-api";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const requestOrigin = getRequestOriginFromHeaders(request.headers);
  return NextResponse.json(resolvePraxisApiConfig({ requestOrigin }), {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
