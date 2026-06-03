import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const path = req.nextUrl.pathname;

    const isLoginPage = path === "/login";
    const isAdminLoginPage = path === "/admin/login";
    const isAuthPage = isLoginPage || isAdminLoginPage;
    
    const isAdminRoute = path.startsWith("/admin") && !isAdminLoginPage;
    const isSellerRoute = path.startsWith("/dashboard/seller");
    const isBuyerRoute = path.startsWith("/dashboard/buyer");
    const isRootRoute = path === "/";

    // Handle root route
    if (isRootRoute) {
      if (!isAuth) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
      if (token.role === "admin") return NextResponse.redirect(new URL("/admin", req.url));
      if (token.role === "seller") return NextResponse.redirect(new URL("/dashboard/seller", req.url));
      if (token.role === "buyer") return NextResponse.redirect(new URL("/dashboard/buyer", req.url));
    }

    // If user is already authenticated and tries to visit auth pages
    if (isAuthPage && isAuth) {
      if (token.role === "admin") return NextResponse.redirect(new URL("/admin", req.url));
      if (token.role === "seller") return NextResponse.redirect(new URL("/dashboard/seller", req.url));
      if (token.role === "buyer") return NextResponse.redirect(new URL("/dashboard/buyer", req.url));
    }

    // Protection logic
    if (!isAuth) {
      if (isAdminRoute) {
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }
      if (isSellerRoute || isBuyerRoute) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    // Role verification
    if (isAdminRoute && token?.role !== "admin") {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    
    if (isSellerRoute && token?.role !== "seller") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    
    if (isBuyerRoute && token?.role !== "buyer") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => true,
    },
  }
);

export const config = {
  matcher: [
    "/",
    "/admin/:path*", 
    "/dashboard/seller/:path*", 
    "/dashboard/buyer/:path*", 
    "/login", 
    "/admin/login"
  ],
};
