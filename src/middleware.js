import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req) {
  const { cookies } = req;
  const token = cookies.get("token"); 
  const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);

  const currentPath = req.nextUrl.pathname;

  if (!token) {
    if (!currentPath.startsWith("/component/signIn/register")) {
      return NextResponse.redirect(new URL("/component/signIn/register", req.url));
    }
    return NextResponse.next();
  }

  try {
    const { payload } = await jwtVerify(token.value, secretKey);
    const role = payload.role;

    if (role === "barber") {
      if (!currentPath.startsWith("/component/admin")) {
        return NextResponse.redirect(new URL("/component/admin", req.url));
      }
    } else if (role === "customer") {
      if (!currentPath.startsWith("/component/user")) {
        return NextResponse.redirect(new URL("/component/user", req.url));
      }
    } else {
      return NextResponse.redirect(new URL("/component/signIn/register", req.url));
    }
  } catch (error) {
    console.error("Invalid token:", error.message);
    if (!currentPath.startsWith("/component/signIn/register")) {
      return NextResponse.redirect(new URL("/component/signIn/register", req.url));
    }
  }

  return NextResponse.next(); 
}

export const config = {
  matcher: [
    "/", 
    "/component/user/:path*", 
    "/component/admin/:path*", 
    "/component/signIn/register",
  ],
};
