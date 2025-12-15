import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AdminLayoutContent } from "./admin-layout-client";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session || (session.user as any).role !== 'admin') {
        redirect("/login");
    }

    return <AdminLayoutContent>{children}</AdminLayoutContent>;
}