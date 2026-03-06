"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, Legend
} from "recharts";
import { Activity, Users, FileText, Search, Download, X } from "lucide-react";
import axios from "axios";

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

    // Modal state
    const [previewDoc, setPreviewDoc] = useState<any>(null);
    const [isPreviewModeLoading, setIsPreviewModeLoading] = useState(false);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    useEffect(() => {
        async function loadData() {
            if (!supabase) return;

            try {
                const { data: docs, error } = await supabase
                    .from("document_conversions")
                    .select("*")
                    .order("created_at", { ascending: false });

                if (error) throw error;
                if (!docs) return;

                const clientCount: any = {};
                const typeCount: any = {};
                const timelineCount: any = {};

                docs.forEach(doc => {
                    clientCount[doc.client] = (clientCount[doc.client] || 0) + 1;
                    typeCount[doc.document_type] = (typeCount[doc.document_type] || 0) + 1;
                    const date = new Date(doc.created_at).toISOString().split('T')[0];
                    timelineCount[date] = (timelineCount[date] || 0) + 1;
                });

                const clientData = Object.keys(clientCount).map(k => ({ name: k, total: clientCount[k] }));
                const typeData = Object.keys(typeCount).map(k => ({ name: k, value: typeCount[k] }));
                const timelineData = Object.keys(timelineCount).sort().map(k => ({
                    date: k.split('-').reverse().slice(0, 2).join('/'),
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

    const filteredHistory = stats.history.filter((doc: any) =>
        doc.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenPreview = async (doc: any) => {
        setPreviewDoc(doc);
        setIsPreviewModeLoading(true);

        try {
            const response = await axios.get(`${API_URL}/api/v1/documents/preview/${doc.id}`, {
                responseType: "blob"
            });
            const docxContainer = document.getElementById("docx-preview-modal-container");
            if (docxContainer) {
                docxContainer.innerHTML = "";
                const docx = await import("docx-preview");
                await docx.renderAsync(response.data, docxContainer);
            }
        } catch (err: any) {
            console.error(err);
            alert("Erro ao renderizar DOCX online.");
        } finally {
            setIsPreviewModeLoading(false);
        }
    };

    const closePreview = () => {
        setPreviewDoc(null);
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-3">
                <Activity className="w-8 h-8 text-blue-500 animate-pulse" />
                <p className="text-gray-500 text-sm font-medium">Carregando métricas...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6 pt-24 font-sans">
            <div className="max-w-7xl mx-auto">

                {/* Header Minimalista */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Painel Analítico</h1>
                        <p className="text-gray-500 text-sm mt-1">Acompanhamento e KPIs do motor de conversão PDF para DOCX.</p>
                    </div>

                    <div className="bg-white border border-gray-200 px-6 py-4 rounded-xl flex items-center gap-4 shadow-sm">
                        <div className="p-2.5 bg-blue-50 rounded-lg text-blue-600">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Total Convertido</p>
                            <p className="text-2xl font-bold text-gray-900 leading-none mt-1">{stats.totalDocs}</p>
                        </div>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">

                    {/* Timeline Chart */}
                    <div className="bg-white border border-gray-200 p-6 rounded-2xl lg:col-span-2 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <Activity className="w-4 h-4 text-gray-400" />
                            <h3 className="font-semibold text-gray-800 text-sm">Volume de Processamento</h3>
                        </div>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={stats.timelineData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} />
                                    <Line type="monotone" dataKey="processamentos" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Type Distribution Chart */}
                    <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <h3 className="font-semibold text-gray-800 text-sm">Tipos de Documento</h3>
                        </div>
                        <div className="h-64 w-full flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.typeData}
                                        innerRadius={55}
                                        outerRadius={80}
                                        paddingAngle={2}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {stats.typeData.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Client Bar Chart */}
                    <div className="bg-white border border-gray-200 p-6 rounded-2xl lg:col-span-3 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <Users className="w-4 h-4 text-gray-400" />
                            <h3 className="font-semibold text-gray-800 text-sm">Conversões por Organização</h3>
                        </div>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.clientData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} />
                                    <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>

                {/* History Table */}
                <div className="bg-white rounded-2xl overflow-hidden mt-8 border border-gray-200 shadow-sm">
                    <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50">
                        <h3 className="font-semibold text-gray-900 text-sm">Histórico Detalhado</h3>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar cliente ou título..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-2 w-full md:w-64 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="text-xs uppercase bg-gray-50 text-gray-500 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Data</th>
                                    <th className="px-6 py-4 font-medium">Cliente</th>
                                    <th className="px-6 py-4 font-medium">Documento</th>
                                    <th className="px-6 py-4 font-medium">Tipo</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium text-right">Download</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredHistory.map((doc: any) => (
                                    <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-gray-900 font-medium">{new Date(doc.created_at).toLocaleDateString()}</span>
                                            <span className="text-xs text-gray-400 ml-2">{new Date(doc.created_at).toLocaleTimeString().slice(0, 5)}</span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{doc.client}</td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleOpenPreview(doc)}
                                                className="text-left group focus:outline-none"
                                            >
                                                <p className="font-medium text-blue-600 hover:text-blue-800 underline truncate max-w-[200px]" title={doc.title}>
                                                    {doc.title}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-0.5 group-hover:text-blue-500">{doc.reference || '--'}</p>
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-md">
                                                {doc.document_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 text-xs font-medium rounded-md ${doc.status === 'COMPLETED' ? 'bg-green-50 text-green-700' :
                                                doc.status === 'FAILED' ? 'bg-red-50 text-red-700' :
                                                    'bg-yellow-50 text-yellow-700'
                                                }`}>
                                                {doc.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <a href={`${API_URL}/api/v1/documents/download/${doc.id}`} download className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Baixar DOCX">
                                                <Download className="w-4 h-4" />
                                            </a>
                                        </td>
                                    </tr>
                                ))}

                                {filteredHistory.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-400 bg-white">
                                            Nenhum registro encontrado em nuvem.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal de Preview Interativo DOCX */}
                {previewDoc && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl md:h-[85vh] h-[95vh] flex flex-col overflow-hidden">
                            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/80">
                                <div>
                                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-blue-600" />
                                        {previewDoc.title}
                                    </h3>
                                    <p className="text-xs text-gray-500 ml-7">Visualização rápida do layout transformado ({previewDoc.document_type})</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <a href={`${API_URL}/api/v1/documents/download/${previewDoc.id}`} download className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                                        <Download className="w-4 h-4" /> Baixar
                                    </a>
                                    <button onClick={closePreview} className="p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-800 rounded-full transition-colors focus:outline-none">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-auto bg-gray-100 p-8 relative">
                                {isPreviewModeLoading && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100/90 z-10 backdrop-blur-[2px]">
                                        <Activity className="w-8 h-8 text-blue-500 animate-pulse mb-3" />
                                        <p className="text-gray-600 font-medium text-sm">Baixando binário e renderizando JS DOCX...</p>
                                    </div>
                                )}
                                {/* Container do Canvas do JS Preview */}
                                <div id="docx-preview-modal-container" className="w-full min-h-[600px] bg-white shadow-sm border border-gray-200 p-4 rounded-xl">
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
