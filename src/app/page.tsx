"use client";

import { useState } from "react";
import { UploadCloud, FileText, CheckCircle, Clock } from "lucide-react";
import axios from "axios";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    client: "",
    documentType: "Relatório OHSAS",
    title: "",
    reference: ""
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Anexe um arquivo PDF");

    setIsProcessing(true);
    try {
      const data = new FormData();
      // user_id provisório; virá do Auth (Supabase) futuramente
      data.append("user_id", "admin-demo-123");
      data.append("client", formData.client);
      data.append("document_type", formData.documentType);
      data.append("title", formData.title);
      data.append("reference", formData.reference);
      data.append("file", file);

      // Chamada à API FastAPI Local (Por padrão a porta é 8000)
      const res = await axios.post("http://localhost:8000/api/v1/documents/convert", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setResult(res.data.data);
    } catch (error) {
      console.error(error);
      alert("Erro ao converter o documento.");
    } finally {
      setIsProcessing(false);
    }
  };

  const loadPreview = async () => {
    if (!result?.document_id) return;

    try {
      const response = await axios.get(`http://localhost:8000/api/v1/documents/preview/${result.document_id}`, {
        responseType: "blob" // Necessário para baixar arquivo binário pro Docx-Preview
      });

      const docxContainer = document.getElementById("docx-preview-container");
      if (docxContainer) {
        docxContainer.innerHTML = ""; // limpa preview anterior
        const docx = await import("docx-preview");
        await docx.renderAsync(response.data, docxContainer);
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao carregar renderização do DOCX");
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-black dark:to-slate-800 p-8 pt-20">

      {/* Header Premium */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl mb-4 shadow-sm">
          <FileText className="w-8 h-8" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
          Conversor Documental Analítico
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Converta formulários e relatórios em PDF do chão de fábrica para DOCX perfeitamente editáveis, preservando layouts, imagens e tabelas complexas.
        </p>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Formulário Interativo */}
        <div className="glass rounded-3xl p-8 transition-all hover:shadow-2xl">
          <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-200">
            Novo Processamento
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Cliente / Departamento</label>
              <input
                required
                name="client"
                value={formData.client}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-black/50 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                placeholder="Ex: Refinaria XPTO"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tipo de Documento</label>
                <select
                  name="documentType"
                  value={formData.documentType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-black/50 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                >
                  <option>Relatório OHSAS</option>
                  <option>Auditoria 5S</option>
                  <option>Ordem de Produção</option>
                  <option>Certificado HST</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Referência (Opcional)</label>
                <input
                  name="reference"
                  value={formData.reference}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-black/50 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                  placeholder="Ex: #REF-4091"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Título do Documento</label>
              <input
                required
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-black/50 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                placeholder="Ex: Inspeção Visual Caldeira 01"
              />
            </div>

            {/* Drag & Drop zone simplificada */}
            <div className="mt-4 border-2 border-dashed border-purple-300 dark:border-purple-800 rounded-2xl p-8 text-center bg-purple-50/50 dark:bg-purple-900/10 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors cursor-pointer relative">
              <UploadCloud className="w-10 h-10 mx-auto text-purple-500 mb-3" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {file ? file.name : "Clique ou arraste um PDF aqui"}
              </p>
              <p className="text-xs text-slate-500 mt-1">Apenas .pdf até 15MB</p>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full mt-6 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-lg shadow-lg shadow-purple-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <><Clock className="animate-spin w-5 h-5" /> Processando IA...</>
              ) : (
                "Gerar Documento (DOCX)"
              )}
            </button>
          </form>
        </div>

        {/* Painel de Resultados & Preview */}
        <div className="flex flex-col gap-6">
          {/* Status Box */}
          <div className="glass rounded-3xl p-8 flex-1 flex flex-col items-center justify-center text-center min-h-[300px]">
            {!result ? (
              <div className="text-slate-400 dark:text-slate-600 flex flex-col items-center gap-4">
                <FileText className="w-16 h-16 opacity-30" />
                <p>O resultado da conversão aparecerá aqui.</p>
              </div>
            ) : (
              <div className="w-full animate-in fade-in zoom-in duration-500 flex flex-col items-center">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Sucesso!</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  O layout de tabelas e imagens foi preservado de forma nativa. <br />
                  Tempo de ML: <span className="font-mono text-purple-600">{result.processing_time?.toFixed(2)}s</span>
                </p>

                <div className="flex flex-col w-full gap-3">
                  <button
                    onClick={loadPreview}
                    className="w-full py-3 rounded-xl border-2 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-semibold hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all"
                  >
                    Visualizar online (Modal de Revisão)
                  </button>
                  <a
                    href={`http://localhost:8000${result.download_url}`}
                    download
                    className="w-full py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold shadow-md hover:bg-slate-800 dark:hover:bg-slate-100 transition-all block text-center"
                  >
                    Fazer Download em (.docx)
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Modal / Container de Preview JS Puro */}
      <div id="docx-preview-wrapper" className={`max-w-5xl mx-auto mt-12 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 ${result ? 'block' : 'hidden'}`}>
        <div className="border-b border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between pointer-events-none">
          <h3 className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-500" /> Preview da Estrutura Convertida
          </h3>
          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">JS View (Fidelidade Simples)</span>
        </div>
        <div id="docx-preview-container" className="min-h-[600px] w-full bg-slate-100 dark:bg-slate-800 p-8 overflow-auto">
          {/* Injetado via React docx-preview */}
          <div className="flex items-center justify-center h-full text-slate-400">
            Clique em "Visualizar online" para renderizar o binário gerado.
          </div>
        </div>
      </div>

    </div>
  );
}
