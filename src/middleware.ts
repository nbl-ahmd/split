import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
export function middleware(request: NextRequest) { const publicPath = ["/login", "/signup", "/_next", "/favicon.ico"].some(path => request.nextUrl.pathname.startsWith(path)); if (!publicPath && !request.cookies.has("tripsplit_session")) return NextResponse.redirect(new URL("/login", request.url)); return NextResponse.next(); }
export const config = { matcher: ["/((?!api).*)"] };
