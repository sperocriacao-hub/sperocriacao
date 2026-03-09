"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, User, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

export default function Navigation() {
    const [isOpen, setIsOpen] = useState(false);
    const { user, signOut } = useAuth();

    return (
        <nav className="fixed top-0 w-full z-50 bg-white border-b border-gray-200 shadow-sm transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">

                    {/* Logo Section */}
                    <div className="flex shrink-0 items-center">
                        <Link href="/" className="flex items-center gap-3 focus:outline-none">
                            {/* O logo preenche o espaco mas mantem proporcoes */}
                            <img src="/logo.png" alt="Spero Systems" className="h-10 sm:h-12 w-auto max-w-[200px] object-contain" />
                            <span className="font-semibold text-gray-400 text-sm hidden sm:block border-l border-gray-200 pl-3">
                                Conversor
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex justify-center flex-1 mx-8 gap-8">
                        <Link href="/" className="text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors">
                            Nova Conversão
                        </Link>
                        <Link href="/dashboard" className="text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors">
                            Histórico
                        </Link>
                    </div>

                    {/* Desktop Right (Auth/Settings) */}
                    <div className="hidden md:flex items-center gap-4 shrink-0">
                        {user ? (
                            <div className="flex items-center gap-4">
                                <Link href="/settings" className="text-sm text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-2">
                                    <Settings className="w-4 h-4" /> Definições
                                </Link>
                                <button onClick={signOut} className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors flex items-center gap-2">
                                    Sair
                                </button>
                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm" title={user.email || ""}>
                                    {user.email?.charAt(0).toUpperCase()}
                                </div>
                            </div>
                        ) : (
                            <Link href="/login" className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-blue-50">
                                Entrar
                            </Link>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex md:hidden items-center shrink-0">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg p-2 transition-colors focus:outline-none"
                            aria-label="Menu"
                        >
                            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>

                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 shadow-xl absolute w-full animate-in slide-in-from-top-2 duration-200">
                    <div className="px-4 pt-4 pb-6 space-y-2">
                        <Link
                            href="/"
                            onClick={() => setIsOpen(false)}
                            className="block px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                            Nova Conversão
                        </Link>
                        <Link
                            href="/dashboard"
                            onClick={() => setIsOpen(false)}
                            className="block px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                            Histórico
                        </Link>
                        <div className="border-t border-gray-100 mt-4 pt-4 space-y-2">
                            {user ? (
                                <>
                                    <Link
                                        href="/settings"
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-2 px-4 py-3 rounded-xl text-base font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors"
                                    >
                                        <Settings className="w-4 h-4" /> Definições
                                    </Link>
                                    <button
                                        onClick={() => {
                                            setIsOpen(false);
                                            signOut();
                                        }}
                                        className="flex items-center gap-2 w-full text-left px-4 py-3 rounded-xl text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" /> Terminar Sessão
                                    </button>
                                </>
                            ) : (
                                <Link
                                    href="/login"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-2 px-4 py-3 rounded-xl text-base font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                                >
                                    <User className="w-4 h-4" /> Entrar na Conta
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
