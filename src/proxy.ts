import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SIGNIN_PATH = "/auth/signin";
const SETUP_PATH = "/setup";
const PUBLIC_PATHS = [SIGNIN_PATH, SETUP_PATH];
const PUBLIC_API_PREFIXES = ["/api/auth", "/api/setup", "/api/system/status"];
const STATIC_PATHS = ["/_next", "/favicon.ico", "/images", "/icon.svg"];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function isPublicApi(pathname: string): boolean {
  return PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p));
}

function isStaticPath(pathname: string): boolean {
  return STATIC_PATHS.some((p) => pathname.startsWith(p));
}

function hasSession(request: NextRequest): boolean {
  return !!(
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isStaticPath(pathname)) {
    return NextResponse.next();
  }

  if (isPublicPath(pathname) || isPublicApi(pathname)) {
    return NextResponse.next();
  }

  if (!hasSession(request)) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = request.nextUrl.clone();
    url.pathname = SIGNIN_PATH;
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|icon.svg).*)",
  ],
};
