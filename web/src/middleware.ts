import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const roleRouteConfig = [
  {
    prefix: "/doctor",
    roles: ["DOCTOR"],
  },
  {
    prefix: "/admin",
    roles: ["ADMIN"],
  },
];

function getRequiredRoles(pathname: string): string[] | null {
  for (const item of roleRouteConfig) {
    if (pathname === item.prefix || pathname.startsWith(item.prefix + "/")) {
      return item.roles;
    }
  }
  return null;
}

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const requiredRoles = getRequiredRoles(pathname);

  if (!requiredRoles) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  let role: string | undefined;

  if (token && typeof (token as { role?: unknown }).role === "string") {
    role = (token as { role?: string }).role;
  }

  if (!role || !requiredRoles.includes(role)) {
    const url = new URL("/login", req.url);
    url.searchParams.set(
      "callbackUrl",
      req.nextUrl.pathname + req.nextUrl.search
    );
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/doctor/:path*", "/admin/:path*"],
};
