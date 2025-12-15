"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Menu, X, Bell, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export default function Navigation() {
  const { data: session } = useSession();
  // @ts-ignore
  const userRole = session?.user?.role || "user";
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    // @ts-ignore
    if (session?.accessToken) {
      fetchUnreadNotifications();
    }
  }, [session?.accessToken]);

  const fetchUnreadNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      const notifications = Array.isArray(res) ? res : [];
      // Use is_read (database column name) instead of read
      const unreadCount = notifications.filter((n: any) => !n.is_read).length;
      setNotificationCount(unreadCount);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  const NavLink = ({ href, children, isActive }: { href: string; children: React.ReactNode; isActive?: boolean }) => (
    <Link
      href={href}
      className={`font-medium px-4 py-2 rounded-md transition-all duration-200 text-base ${isActive
        ? "bg-white/20 text-white"
        : "text-primary-foreground/90 hover:text-white hover:bg-white/10"
        }`}
    >
      {children}
    </Link>
  );

  const MobileNavLink = ({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) => (
    <Link
      href={href}
      onClick={onClick}
      className="block text-gray-700 hover:bg-gray-100 hover:text-primary px-3 py-2 rounded-md font-medium transition-colors"
    >
      {children}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 bg-primary shadow-lg border-b border-white/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-48 h-10">
              <Image
                src="/images/Logo.png"
                alt="Academy Space Logo"
                fill
                className="object-contain object-left"
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink href="/">Home</NavLink>

            {userRole === 'user' && (
              <>
                <NavLink href="/reservations">My Reservations</NavLink>
              </>
            )}

            {userRole === 'admin' && (
              <NavLink href="/admin/dashboard">Admin Panel</NavLink>
            )}

            <NavLink href="/guide">Guide</NavLink>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {session ? (
              <div className="flex items-center gap-4">
                {/* Show notification for all logged-in users */}
                <Link href="/notifications" className="relative p-2 text-primary-foreground/80 hover:text-white transition-colors">
                  <Bell className="w-5 h-5" />
                  {notificationCount > 0 && (
                    <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-destructive ring-2 ring-primary" />
                  )}
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-white/20 hover:ring-white/40">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={session.user?.image || undefined} alt={session.user?.name || ""} />
                        <AvatarFallback className="bg-primary-foreground text-primary font-bold">
                          {session.user?.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {session.user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white" asChild>
                  <Link href="/login">Log in</Link>
                </Button>
                <Button className="bg-white text-primary hover:bg-gray-100 font-bold" asChild>
                  <Link href="/register">Sign Up</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Button - Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <button
                  className="md:hidden p-2 text-white hover:bg-white/10 rounded-md"
                >
                  <Menu size={24} />
                </button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 mt-6">
                  <MobileNavLink href="/">Home</MobileNavLink>
                  {userRole === 'user' && (
                    <>
                      <MobileNavLink href="/reservations">My Reservations</MobileNavLink>
                    </>
                  )}
                  {userRole === 'admin' && (
                    <MobileNavLink href="/admin/dashboard">Admin Panel</MobileNavLink>
                  )}
                  <MobileNavLink href="/guide">Guide</MobileNavLink>

                  <div className="border-t pt-4 mt-2">
                    {session ? (
                      <Button
                        onClick={handleLogout}
                        variant="destructive"
                        className="w-full justify-start"
                      >
                        <LogOut className="mr-2 h-4 w-4" /> Log out
                      </Button>
                    ) : (
                      <div className="flex flex-col gap-3">
                        <Button variant="outline" className="w-full" asChild>
                          <Link href="/login">Log in</Link>
                        </Button>
                        <Button className="w-full" asChild>
                          <Link href="/register">Sign Up</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}