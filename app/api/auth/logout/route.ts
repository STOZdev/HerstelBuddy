import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/app/_server/auth/session";

export function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/mock-minddistrict", request.url));
  response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0, sameSite: "lax" });
  return response;
}
