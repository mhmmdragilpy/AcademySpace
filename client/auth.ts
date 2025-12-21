import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import axios from "axios";

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            authorize: async (credentials) => {
                try {
                    const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"}/auth/login`, {
                        username: credentials.username,
                        password: credentials.password
                    });

                    // Backend returns standard response: { status: 'success', data: { token: '...', user: { ... } } }
                    const data = res.data.data;
                    const user = data.user;
                    const token = data.token;

                    if (user && token) {
                        return { ...user, accessToken: token, id: user.user_id?.toString() || user.id?.toString() };
                    }
                    return null;
                } catch (error) {
                    console.error("Auth error:", error);
                    return null;
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = (user as any).id;
                token.role = (user as any).role;
                token.accessToken = (user as any).accessToken;
                // Store profile picture from initial login
                token.picture = (user as any).profile_picture_url || null;
                token.name = (user as any).full_name || (user as any).name;
            }
            // Handle session update (e.g., when user changes avatar)
            if (trigger === "update" && session?.user) {
                if (session.user.image !== undefined) token.picture = session.user.image;
                if (session.user.name) token.name = session.user.name;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id;
                (session.user as any).role = token.role;
                // Sync image from token to session
                session.user.image = (token.picture as string) || undefined;
                session.user.name = token.name as string;
                (session as any).accessToken = token.accessToken;
            }
            return session;
        }
    },
    pages: {
        signIn: "/login",
        error: "/login" // Redirect to login page on error
    }
});
