"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { User, Shield, Moon, Sun, Settings as SettingsIcon, LogOut } from "lucide-react";

export default function Settings() {
    const { user, signOut } = useAuth();
    const [theme, setTheme] = useState("light");

    // Dummy permissions list
    const permissions = [
        { module: "Conversão Documental PDF->DOCX", status: "Ativo" },
        { module: "Planeamento de Produção", status: "Em Breve" },
        { module: "Safety Cross Diário", status: "Em Breve" },
    ];

    const handleThemeToggle = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        // Para implementar num futuro próximo, basta injetar class 'dark' no html
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 pt-24 transition-colors">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                            <SettingsIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">Definições da Conta</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gira o seu perfil, segurança e esquema da interface Spero.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Coluna Esquerda - Perfis */}
                        <div className="md:col-span-1 space-y-6">

                            {/* Card Resumo do Perfil */}
                            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm overflow-hidden">
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold mb-4">
                                        {user?.email?.charAt(0).toUpperCase() || "U"}
                                    </div>
                                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                                        {user?.user_metadata?.full_name || "Utilizador Corporativo"}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{user?.email}</p>
                                    <span className="mt-4 px-3 py-1 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-semibold">Conta Verificada</span>
                                </div>
                            </div>

                            {/* Tema Visual */}
                            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
                                <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    {theme === "light" ? <Sun className="w-4 h-4 text-orange-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
                                    Aparência
                                </h4>
                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                        Modo Escuro (Beta)
                                    </span>
                                    <button
                                        onClick={handleThemeToggle}
                                        className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none ${theme === 'dark' ? 'bg-blue-600' : 'bg-gray-300'}`}
                                    >
                                        <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                    </button>
                                </div>
                            </div>

                        </div>

                        {/* Coluna Direita - Segurança e Permissões */}
                        <div className="md:col-span-2 space-y-6">

                            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-4 mb-4">
                                    <Shield className="w-5 h-5 text-gray-400" />
                                    Módulos Adquiridos & Permissões
                                </h3>

                                <div className="space-y-4">
                                    {permissions.map((perm, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                                            <span className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                                                {perm.module}
                                            </span>
                                            <span className={`px-2.5 py-1 text-xs font-medium rounded-md ${perm.status === 'Ativo'
                                                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
                                                    : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                                                }`}>
                                                {perm.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Botão Logout */}
                            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm overflow-hidden text-right">
                                <button
                                    onClick={signOut}
                                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 rounded-xl font-medium transition-colors focus:outline-none"
                                >
                                    <LogOut className="w-4 h-4" /> Terminar Sessão
                                </button>
                            </div>

                        </div>

                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
