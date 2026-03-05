"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, Legend
} from "recharts";
import { Activity, Users, FileText, Search } from "lucide-react";

export default function Dashboard() {
    const [stats, setStats] = useState<any>({
        totalDocs: 0,
        clientData: [],
        typeData: [],
        timelineData: [],
        history: []
    });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

    useEffect(() => {
        async function loadData() {
            if (!supabase) return;

            try {
                // Fetch All Completions
                const { data: docs, error } = await supabase
                    .from("document_conversions")
                    .select("*")
                    .order("created_at", { ascending: false });

                if (error) throw error;
                if (!docs) return;

                // Processamento para Gráfico de Clientes (Bar)
                const clientCount: any = {};
                // Processamento para Gráfico de Tipos (Pie)
                const typeCount: any = {};
                // Processamento para Linha do Tempo (Line)
                const timelineCount: any = {};

                docs.forEach(doc => {
                    // Cliente
                    clientCount[doc.client] = (clientCount[doc.client] || 0) + 1;

                    // Tipo
                    typeCount[doc.document_type] = (typeCount[doc.document_type] || 0) + 1;

                    // Timeline (Agrupado por Dia YYYY-MM-DD)
                    const date = new Date(doc.created_at).toISOString().split('T')[0];
                    timelineCount[date] = (timelineCount[date] || 0) + 1;
                });

                // Formatação Arrays para Recharts
                const clientData = Object.keys(clientCount).map(k => ({ name: k, total: clientCount[k] }));
                const typeData = Object.keys(typeCount).map(k => ({ name: k, value: typeCount[k] }));

                // Ordenando timeline
                const timelineData = Object.keys(timelineCount).sort().map(k => ({
                    date: k.split('-').reverse().slice(0, 2).join('/'), // DD/MM
                    processamentos: timelineCount[k]
                }));

                setStats({
                    totalDocs: docs.length,
                    clientData,
                    typeData,
                    timelineData,
                    history: docs
                });

            } catch (err) {
                console.error("Erro ao carregar dashboard", err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    // Filtro histórico
    const filteredHistory = stats.history.filter((doc: any) =>
        doc.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
            <div className="animate-pulse flex flex-col items-center">
                <Activity className="w-12 h-12 text-purple-500 mb-4 animate-bounce" />
                <p className="text-slate-500 font-medium">Carregando painel analítico...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-950 dark:to-slate-900 p-8 pt-12">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">Dashboard Analítico</h1>
                        <p className="text-slate-500 mt-1">Acompanhamento e KPIs do motor de conversão PDF para DOCX.</p>
                    </div>

                    <div className="glass px-6 py-4 rounded-2xl flex items-center gap-4">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/40 rounded-xl text-purple-600 dark:text-purple-400">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Convertido</p>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.totalDocs}</p>
                        </div>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">

                    {/* Timeline Chart */}
                    <div className="glass p-6 rounded-3xl lg:col-span-2">
                        <div className="flex items-center gap-2 mb-6">
                            <Activity className="w-5 h-5 text-indigo-500" />
                            <h3 className="font-bold text-slate-700 dark:text-slate-200">Evolução de Processamento</h3>
                        </div>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={stats.timelineData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} vertical={false} />
                                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    />
                                    <Line type="monotone" dataKey="processamentos" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Type Distribution Chart */}
                    <div className="glass p-6 rounded-3xl">
                        <div className="flex items-center gap-2 mb-6">
                            <FileText className="w-5 h-5 text-indigo-500" />
                            <h3 className="font-bold text-slate-700 dark:text-slate-200">Tipos de Documento</h3>
                        </div>
                        <div className="h-64 w-full flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.typeData}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {stats.typeData.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Client Bar Chart */}
                    <div className="glass p-6 rounded-3xl lg:col-span-3">
                        <div className="flex items-center gap-2 mb-6">
                            <Users className="w-5 h-5 text-indigo-500" />
                            <h3 className="font-bold text-slate-700 dark:text-slate-200">Conversões por Cliente</h3>
                        </div>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.clientData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} vertical={false} />
                                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                    <Bar dataKey="total" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>

                {/* History Table */}
                <div className="glass rounded-3xl overflow-hidden mt-8 border border-slate-200/50 dark:border-slate-800">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/40 dark:bg-black/20">
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white">Histórico de Processamento</h3>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar cliente ou título..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-2 w-full md:w-64 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 focus:ring-2 focus:ring-purple-500 outline-none text-sm transition-all"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                            <thead className="text-xs uppercase bg-slate-50/50 dark:bg-slate-900/50 text-slate-500">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Data</th>
                                    <th className="px-6 py-4 font-semibold">Cliente</th>
                                    <th className="px-6 py-4 font-semibold">Documento</th>
                                    <th className="px-6 py-4 font-semibold">Layout/Tipo</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                    <th className="px-6 py-4 font-semibold text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                {filteredHistory.map((doc: any) => (
                                    <tr key={doc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {new Date(doc.created_at).toLocaleDateString()} <span className="text-xs text-slate-400">{new Date(doc.created_at).toLocaleTimeString().slice(0, 5)}</span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">{doc.client}</td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[200px]" title={doc.title}>{doc.title}</p>
                                            <p className="text-xs text-slate-400 mt-0.5">{doc.reference || '--'}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 text-xs font-medium bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-full">
                                                {doc.document_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${doc.status === 'COMPLETED' ? 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                                                    doc.status === 'FAILED' ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                                                        'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                }`}>
                                                {doc.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {/* Opcional: Adicionar Link para download do arquivo s3/supabase storage ou do próprio backend */}
                                            <a href={`http://localhost:8000/api/v1/documents/download/${doc.id}`} download className="text-purple-600 hover:text-purple-700 font-medium">Baixar Docx</a>
                                        </td>
                                    </tr>
                                ))}

                                {filteredHistory.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                            Nenhum registro encontrado.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}
