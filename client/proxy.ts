import { NextResponse } from "next/server";
import { auth } from "./auth";

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const user = req.auth?.user;
    const role = (user as any)?.role;
    const { pathname } = req.nextUrl;

    // Define route types (using actual PascalCase route paths)
    const isAuthRoute = pathname === "/LoginPage" || pathname === "/RegisterPage";
    const isAdminRoute = pathname.startsWith("/AdminDashboard");
    const isUserRoute =
        pathname.startsWith("/FacilityDetailPage") ||
        pathname.startsWith("/MyReservationsPage") ||
        pathname.startsWith("/EditReservationPage") ||
        pathname === "/ProfilePage" ||
        pathname === "/NotificationsPage";

    const isPublicRoute =
        pathname === "/" ||
        pathname === "/GuidePage";

    // 1. Handling Authentication Routes (Login/Register)
    if (isAuthRoute) {
        if (isLoggedIn) {
            if (role === 'admin') {
                return NextResponse.redirect(new URL('/AdminDashboard', req.url));
            }
            return NextResponse.redirect(new URL('/', req.url));
        }
        return NextResponse.next();
    }

    // 2. Protected Routes Check
    if (!isLoggedIn && (isAdminRoute || isUserRoute)) {
        return NextResponse.redirect(new URL('/LoginPage', req.url));
    }

    // 3. Admin Routes Protection
    if (isAdminRoute) {
        if (role !== 'admin') {
            return NextResponse.redirect(new URL('/', req.url));
        }
        return NextResponse.next();
    }

    // 4. User Routes Protection
    if (isUserRoute) {
        if (role !== 'user') {
            // If admin tries to access user routes, redirect to admin dashboard
            // If authenticated but no role (weird), redirect home
            if (role === 'admin') {
                return NextResponse.redirect(new URL('/AdminDashboard', req.url));
            }
            return NextResponse.next();
        }
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - images (public images)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|images|favicon.ico).*)',
    ],
};
