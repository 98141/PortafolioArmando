import { NextResponse } from "next/server";
export function proxy() {
  // The API owns host-only cookies. The frontend cannot infer a session from them.
  // ProtectedRoute checks /auth/me; every private API route authorizes on the server.
  const response = NextResponse.next();
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
