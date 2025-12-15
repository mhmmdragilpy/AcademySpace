"use client";

import { useState } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// Schema
const loginSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [role, setRole] = useState<"user" | "admin">("user");

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });

    const onSubmit = async (data: LoginFormValues) => {
        setIsLoading(true);
        try {
            const result = await signIn("credentials", {
                username: data.username,
                password: data.password,
                redirect: false,
            });

            if (result?.error) {
                toast.error("Invalid username or password");
                setIsLoading(false);
                return;
            }

            toast.success("Logged in successfully");
            router.refresh();

            // Smart redirect
            if (role === 'admin') {
                router.push("/admin/dashboard");
            } else {
                router.push("/");
            }

        } catch (error) {
            toast.error("Something went wrong");
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
                    <h1 className="text-4xl font-bold mb-4">Manage your facility reservations with ease.</h1>
                    <p className="text-primary-foreground/80">Premium spaces for your academic needs.</p>
                </div>
                <div className="text-sm opacity-50">
                    &copy; 2025 Academy Space. All rights reserved.
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex items-center justify-center p-8 bg-background">
                <Card className="w-full max-w-md border-none shadow-none lg:border lg:shadow-sm">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
                        <CardDescription>
                            Sign in to access your account
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
                                <Label htmlFor="username">Username</Label>
                                <Input
                                    id="username"
                                    placeholder="your_username"
                                    {...register("username")}
                                    disabled={isLoading}
                                    className={errors.username ? "border-destructive focus-visible:ring-destructive" : ""}
                                />
                                {errors.username && (
                                    <p className="text-sm text-destructive">{errors.username.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                    <Link
                                        href="/forgot-password"
                                        className="text-sm font-medium text-primary hover:underline hover:text-primary/80"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
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

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    "Sign In"
                                )}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                        <p className="text-sm text-muted-foreground">
                            Don't have an account?{" "}
                            <Link href="/register" className="text-primary font-medium hover:underline">
                                Sign up
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
