"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ReactNode, useState } from "react";
import { signOut } from "next-auth/react";
import {
    LayoutDashboard,
    Calendar,
    Building,
    Users,
    BarChart3,
    Home,
    LogOut,
    Menu,
    X,
    Key,
    User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetHeader,
    SheetTitle,
    SheetClose
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const sidebarNavItems = [
    {
        title: "Dashboard",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Reservations",
        href: "/admin/reservations",
        icon: Calendar,
    },
    {
        title: "Facilities",
        href: "/admin/facilities",
        icon: Building,
    },
    // Users item removed here
    {
        title: "Analytics",
        href: "/admin/analytics",
        icon: BarChart3,
    },
    {
        title: "System Tokens",
        href: "/admin/system-tokens",
        icon: Key,
    },
    {
        title: "Profile",
        href: "/admin/profile",
        icon: User,
    },
];

interface AdminLayoutContentProps {
    children: ReactNode;
}

export function AdminLayoutContent({ children }: AdminLayoutContentProps) {
    const pathname = usePathname();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-white border-r border-gray-200">
            <div className="h-16 flex items-center px-6 border-b border-gray-200">
                <span className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Building className="h-6 w-6 text-primary" />
                    Admin Panel
                </span>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
                <nav className="px-3 space-y-1">
                    {sidebarNavItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                )}
                                onClick={() => setIsMobileOpen(false)}
                            >
                                <Icon className={cn(
                                    "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                                    isActive ? "text-primary" : "text-gray-400 group-hover:text-gray-500"
                                )} />
                                {item.title}
                            </Link>
                        );
                    })}
                </nav>
            </div>
            <div className="p-4 border-t border-gray-200 space-y-2">
                <Link
                    href="/"
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                    <Home className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                    Back to Home
                </Link>
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => signOut({ callbackUrl: "/" })}
                >
                    <LogOut className="mr-3 h-5 w-5" />
                    Logout
                </Button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Desktop Sidebar */}
            <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-20">
                <SidebarContent />
            </div>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-10 bg-white border-b border-gray-200 h-16 flex items-center px-4 justify-between">
                <span className="text-lg font-bold text-gray-900">Admin Panel</span>
                <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Menu className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-72">
                        {/* Pass a close handler or just let Link clicks close it via state */}
                        <SidebarContent />
                    </SheetContent>
                </Sheet>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col md:pl-64 pt-16 md:pt-0 w-full transition-all duration-300 ease-in-out">
                <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}