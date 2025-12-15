"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import api from "@/lib/api";

export default function NotificationsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = useCallback(async () => {
        try {
            // API client auto-unwraps response, so res is already the data array
            const notifications = await api.get("/notifications") as any;
            setNotifications(Array.isArray(notifications) ? notifications : []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (status === "authenticated") {
            fetchNotifications();
        } else if (status === "unauthenticated") {
            setLoading(false);
        }
    }, [status, fetchNotifications]);

    const markAsRead = async (id: number) => {
        try {
            await api.put("/notifications/read", { notificationId: id });

            // Update local state
            setNotifications(notifications.map(n =>
                n.notification_id === id ? { ...n, is_read: true } : n
            ));
        } catch (error) {
            console.error("Failed to mark notification as read", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put("/notifications/read-all", {});

            // Update local state
            setNotifications(notifications.map(n => ({ ...n, is_read: true })));
        } catch (error) {
            console.error("Failed to mark all notifications as read", error);
        }
    };

    if (!session) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p>Please login to view notifications.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navigation />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-16">
                <header className="mb-8 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                    <button
                        onClick={markAllAsRead}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Mark All as Read
                    </button>
                </header>

                {loading ? (
                    <div className="text-center py-12">Loading notifications...</div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">No notifications found.</div>
                ) : (
                    <div className="space-y-4">
                        {notifications.map((notification, index) => {
                            const isReservation = notification.message.toLowerCase().includes('reservation');
                            const isApproved = notification.message.toLowerCase().includes('approved');
                            const isRejected = notification.message.toLowerCase().includes('rejected');
                            const isPending = notification.message.toLowerCase().includes('pending');

                            let borderColor = "border-gray-100";
                            let iconColor = "text-blue-500";
                            let bgColor = "bg-white";

                            if (isApproved) {
                                borderColor = "border-green-200";
                                iconColor = "text-green-500";
                                bgColor = notification.is_read ? "bg-white" : "bg-green-50";
                            } else if (isRejected) {
                                borderColor = "border-red-200";
                                iconColor = "text-red-500";
                                bgColor = notification.is_read ? "bg-white" : "bg-red-50";
                            } else if (isPending) {
                                borderColor = "border-yellow-200";
                                iconColor = "text-yellow-500";
                                bgColor = notification.is_read ? "bg-white" : "bg-yellow-50";
                            } else if (!notification.is_read) {
                                bgColor = "bg-blue-50";
                            }

                            return (
                                <div
                                    key={notification.notification_id || index}
                                    onClick={() => {
                                        markAsRead(notification.notification_id);
                                        router.push('/reservations');
                                    }}
                                    className={`p-5 rounded-xl shadow-sm border ${borderColor} ${bgColor} cursor-pointer hover:shadow-md transition-all duration-200 group relative`}
                                >
                                    <div className="flex gap-4">
                                        <div className={`mt-1 p-2 rounded-full bg-white shadow-sm ${iconColor}`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                                                <line x1="16" y1="2" x2="16" y2="6" />
                                                <line x1="8" y1="2" x2="8" y2="6" />
                                                <line x1="3" y1="10" x2="21" y2="10" />
                                                <path d="M8 14h.01" />
                                                <path d="M12 14h.01" />
                                                <path d="M16 14h.01" />
                                                <path d="M8 18h.01" />
                                                <path d="M12 18h.01" />
                                                <path d="M16 18h.01" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                    {isReservation ? "Update Reservasi" : "Notifikasi Sistem"}
                                                </h3>
                                                <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                                    {new Date(notification.created_at).toLocaleString('id-ID', {
                                                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 mt-1 text-sm leading-relaxed">{notification.message}</p>

                                            <div className="mt-3 flex items-center gap-2 text-xs font-medium text-gray-400 group-hover:text-blue-500 transition-colors">
                                                <span>Klik untuk melihat detail reservasi</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M5 12h14" />
                                                    <path d="m12 5 7 7-7 7" />
                                                </svg>
                                            </div>
                                        </div>
                                        {!notification.is_read && (
                                            <span className="absolute top-5 right-5 h-2 w-2 rounded-full bg-blue-500"></span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}