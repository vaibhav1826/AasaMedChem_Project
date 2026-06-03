import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/register");
    const isAdminPage = req.nextUrl.pathname.startsWith("/admin");
    const isDashboardPage = req.nextUrl.pathname.startsWith("/dashboard");

    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      return null;
    }

    if (!isAuth && (isAdminPage || isDashboardPage)) {
      let from = req.nextUrl.pathname;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }
      return NextResponse.redirect(
        new URL(`/login?from=${encodeURIComponent(from)}`, req.url)
      );
    }

    if (isAdminPage && token?.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => true,
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/login", "/register"],
};
