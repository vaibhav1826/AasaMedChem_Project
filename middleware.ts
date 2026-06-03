import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isLoginPage = req.nextUrl.pathname === "/login";
    const isRegisterPage = req.nextUrl.pathname === "/register";
    const isAdminLoginPage = req.nextUrl.pathname === "/admin/login";
    const isAuthPage = isLoginPage || isRegisterPage || isAdminLoginPage;
    
    const isAdminRoute = req.nextUrl.pathname.startsWith("/admin") && !isAdminLoginPage;
    const isDashboardRoute = req.nextUrl.pathname.startsWith("/dashboard");

    // If user is already authenticated and tries to visit auth pages
    if (isAuthPage) {
      if (isAuth) {
        if (token.role === "admin") {
          return NextResponse.redirect(new URL("/admin", req.url));
        }
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      return null;
    }

    // Protection logic
    if (!isAuth) {
      let from = req.nextUrl.pathname;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }
      
      // If trying to access admin, bounce to admin login
      if (isAdminRoute) {
        return NextResponse.redirect(
          new URL(`/admin/login?from=${encodeURIComponent(from)}`, req.url)
        );
      }
      
      // If trying to access dashboard, bounce to seller login
      if (isDashboardRoute) {
        return NextResponse.redirect(
          new URL(`/login?from=${encodeURIComponent(from)}`, req.url)
        );
      }
    }

    // Role verification
    if (isAdminRoute && token?.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    
    // Admins shouldn't be browsing seller dashboard directly normally, 
    // but we can allow it for support, or we could redirect them back to admin.
    // We will allow admins to view dashboard.
  },
  {
    callbacks: {
      authorized: ({ token }) => true,
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/login", "/register", "/admin/login"],
};
