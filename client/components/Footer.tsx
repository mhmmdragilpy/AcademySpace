"use client";

import Link from "next/link";
import Image from "next/image";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-[#08294B] text-gray-300 pt-16 pb-8 border-t border-white/5">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand Column */}
                    <div className="space-y-4">
                        <Link href="/" className="relative w-56 h-14 block group">
                            <Image
                                src="/images/Logo.png"
                                alt="Academy Space Logo"
                                fill
                                className="object-contain object-left"
                            />
                        </Link>
                        <p className="text-sm leading-relaxed text-gray-400">
                            Transforming how you book and manage campus facilities. Fast, reliable, and smart reservations for students and faculty.
                        </p>
                        <div className="flex gap-4 pt-2">
                            <a href="#" className="hover:text-white hover:scale-110 transition-all duration-200"><Facebook size={20} /></a>
                            <a href="#" className="hover:text-white hover:scale-110 transition-all duration-200"><Twitter size={20} /></a>
                            <a href="#" className="hover:text-white hover:scale-110 transition-all duration-200"><Instagram size={20} /></a>
                            <a href="#" className="hover:text-white hover:scale-110 transition-all duration-200"><Linkedin size={20} /></a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-semibold text-lg mb-4">Quick Links</h3>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
                            <li><Link href="/CheckAvailabilityPage" className="hover:text-primary transition-colors">Check Availability</Link></li>
                            <li><Link href="/GuidePage" className="hover:text-primary transition-colors">User Guide</Link></li>
                            <li><Link href="/LoginPage" className="hover:text-primary transition-colors">Login</Link></li>
                            <li><Link href="/RegisterPage" className="hover:text-primary transition-colors">Sign Up</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-white font-semibold text-lg mb-4">Support</h3>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
                            <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Support</Link></li>
                            <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                            <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-white font-semibold text-lg mb-4">Contact Us</h3>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-start gap-3 group">
                                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5 group-hover:text-white transition-colors" />
                                <span className="group-hover:text-white transition-colors">Jl. Telekomunikasi No. 1, Terusan Buahbatu - Bojongsoang, Bandung</span>
                            </li>
                            <li className="flex items-center gap-3 group">
                                <Phone className="w-5 h-5 text-primary shrink-0 group-hover:text-white transition-colors" />
                                <span className="group-hover:text-white transition-colors">+62 22 7564108</span>
                            </li>
                            <li className="flex items-center gap-3 group">
                                <Mail className="w-5 h-5 text-primary shrink-0 group-hover:text-white transition-colors" />
                                <span className="group-hover:text-white transition-colors">info@telkomuniversity.ac.id</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
                    <p>&copy; {new Date().getFullYear()} Academy Space. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                        <Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
