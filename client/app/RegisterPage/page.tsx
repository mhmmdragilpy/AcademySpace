// USE CASE #1: Membuat atau Masuk Akun - [View]
"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// Schema
const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm Password must be at least 6 characters"),
    admin_token: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [role, setRole] = useState<"user" | "admin">("user");

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            username: "",
            password: "",
            confirmPassword: "",
            admin_token: "",
        },
    });

    // [USE CASE #1] Membuat atau Masuk Akun - Handle Submit Form Registrasi
    const onSubmit = async (data: RegisterFormValues) => {
        if (role === 'admin' && !data.admin_token) {
            toast.error("Admin Token is required for Admin registration");
            return;
        }

        setIsLoading(true);
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"}/auth/register`, {
                name: data.name,
                username: data.username,
                password: data.password,
                confirmPassword: data.confirmPassword,
                role,
                admin_token: role === 'admin' ? data.admin_token : undefined
            });
            toast.success("Account created successfully! Please log in.");
            router.push("/LoginPage?registered=true");
        } catch (error: any) {
            console.error("Registration error:", error);
            console.error("Response data:", error.response?.data);

            // Extract detailed error message
            let message = "Something went wrong";
            if (error.response?.data?.message) {
                message = error.response.data.message;
            } else if (error.response?.data?.error) {
                message = error.response.data.error;
            } else if (error.message) {
                message = error.message;
            }

            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left Side - Visual */}
            <div className="hidden lg:flex flex-col justify-between bg-primary p-10 text-primary-foreground">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="relative w-[500px] h-[150px]">
                            <Image
                                src="/images/Logo.png"
                                alt="Academy Space"
                                fill
                                className="object-contain object-left"
                            />
                        </div>
                    </div>
                </div>
                <div>
                    <h1 className="text-4xl font-bold mb-4">Join our community today.</h1>
                    <p className="text-primary-foreground/80">Create an account to start booking premium spaces.</p>
                </div>
                <div className="text-sm opacity-50">
                    &copy; 2025 Academy Space. All rights reserved.
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex items-center justify-center p-8 bg-background">
                <Card className="w-full max-w-md border-none shadow-none lg:border lg:shadow-sm">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
                        <CardDescription>
                            Enter your details to register
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Role Toggle */}
                        <div className="flex p-1 bg-muted rounded-lg mb-6">
                            <button
                                type="button"
                                onClick={() => setRole("user")}
                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${role === "user"
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                User
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole("admin")}
                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${role === "admin"
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                Admin
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    placeholder="John Doe"
                                    {...register("name")}
                                    disabled={isLoading}
                                    className={errors.name ? "border-destructive focus-visible:ring-destructive" : ""}
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">{errors.name.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="username">Username</Label>
                                <Input
                                    id="username"
                                    placeholder="johndoe123"
                                    {...register("username")}
                                    disabled={isLoading}
                                    className={errors.username ? "border-destructive focus-visible:ring-destructive" : ""}
                                />
                                {errors.username && (
                                    <p className="text-sm text-destructive">{errors.username.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    {...register("password")}
                                    disabled={isLoading}
                                    className={errors.password ? "border-destructive focus-visible:ring-destructive" : ""}
                                />
                                {errors.password && (
                                    <p className="text-sm text-destructive">{errors.password.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    {...register("confirmPassword")}
                                    disabled={isLoading}
                                    className={errors.confirmPassword ? "border-destructive focus-visible:ring-destructive" : ""}
                                />
                                {errors.confirmPassword && (
                                    <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                                )}
                            </div>

                            {role === 'admin' && (
                                <div className="space-y-2 bg-yellow-50 p-4 rounded-md border border-yellow-200">
                                    <Label htmlFor="admin_token" className="text-yellow-800 font-semibold">Admin Registration Token</Label>
                                    <Input
                                        id="admin_token"
                                        placeholder="Enter secret token"
                                        {...register("admin_token")}
                                        disabled={isLoading}
                                        className={errors.admin_token ? "border-destructive focus-visible:ring-destructive" : "border-yellow-300 focus-visible:ring-yellow-400"}
                                    />
                                    <p className="text-xs text-yellow-700">Required for admin verification.</p>
                                    {errors.admin_token && (
                                        <p className="text-sm text-destructive">{errors.admin_token.message}</p>
                                    )}
                                </div>
                            )}

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating account...
                                    </>
                                ) : (
                                    "Sign Up"
                                )}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                        <p className="text-sm text-muted-foreground">
                            Already have an account?{" "}
                            <Link href="/LoginPage" className="text-primary font-medium hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}

