"use client";

import { useState } from "react";
import { UploadCloud, FileText, CheckCircle, Clock } from "lucide-react";
import axios from "axios";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    client: "",
    documentType: "Relatório",
    title: "",
    reference: ""
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);

  // URL DO BACKEND via Env (para Vercel + Hospedagem de API futura) ou Localhost para dev
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
      data.append("user_id", "admin-demo-123");
      data.append("client", formData.client);
      data.append("document_type", formData.documentType);
      data.append("title", formData.title);
      data.append("reference", formData.reference);
      data.append("file", file);

      const res = await axios.post(`${API_URL}/api/v1/documents/convert`, data, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setResult(res.data.data);
    } catch (error: any) {
      console.error("Erro completo:", error);
      if (error.message === "Network Error") {
        alert(`Falha de Conexão: O Frontend não conseguiu alcançar a API em ${API_URL}. Se você estiver testando pela Vercel pública, lembre-se que navegadores bloqueiam requisições pro seu Localhost (Mixed Content/CORS). Teste via http://localhost:3000 ou hospede seu backend FastAPI!`);
      } else {
        alert("Erro ao processar a requisição: " + (error.response?.data?.detail || error.message));
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const loadPreview = async () => {
    if (!result?.document_id) return;
    try {
      const response = await axios.get(`${API_URL}/api/v1/documents/preview/${result.document_id}`, {
        responseType: "blob"
      });
      const docxContainer = document.getElementById("docx-preview-container");
      if (docxContainer) {
        docxContainer.innerHTML = "";
        const docx = await import("docx-preview");
        await docx.renderAsync(response.data, docxContainer);
      }
    } catch (err: any) {
      console.error(err);
      alert("Erro ao carregar renderização do DOCX no navegador.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-6 pt-24">

      {/* Header Minimalista */}
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-4xl font-semibold tracking-tight text-gray-900 mb-3">
          Conversor de Documentos
        </h1>
        <p className="text-lg text-gray-500 font-light">
          Transforme PDFs complexos em DOCX com preservação impecável de layout.
        </p>
      </div>

      <div className="max-w-5xl w-full mx-auto grid grid-cols-1 md:grid-cols-12 gap-10">

        {/* Formulário - Clean Card */}
        <div className="md:col-span-7 bg-white border border-gray-200 shadow-sm rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Cliente / Organização</label>
              <input
                required name="client" value={formData.client} onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow text-gray-900"
                placeholder="Exemplo Corp."
              />
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Tipo</label>
                <select
                  name="documentType" value={formData.documentType} onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                >
                  <option>Relatório</option>
                  <option>Auditoria</option>
                  <option>Ordem de Serviço</option>
                  <option>Certificado</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Código de Referência</label>
                <input
                  name="reference" value={formData.reference} onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow text-gray-900"
                  placeholder="Opcional"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Título do Arquivo</label>
              <input
                required name="title" value={formData.title} onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow text-gray-900"
                placeholder="Ex: Análise Estrutural 2026"
              />
            </div>

            {/* Upload Area Minimalista */}
            <div className="mt-8 border border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 hover:bg-blue-50 transition-colors cursor-pointer relative group">
              <UploadCloud className="w-8 h-8 mx-auto text-gray-400 group-hover:text-blue-500 mb-2 transition-colors" />
              <p className="text-sm font-medium text-gray-700">
                {file ? file.name : "Selecionar arquivo PDF"}
              </p>
              <p className="text-xs text-gray-400 mt-1">Até 15MB (.pdf)</p>
              <input
                type="file" accept=".pdf" onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>

            <button
              type="submit" disabled={isProcessing}
              className="w-full py-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isProcessing ? <><Clock className="animate-spin w-4 h-4" /> Convertendo...</> : "Converter para DOCX"}
            </button>
          </form>
        </div>

        {/* Quadro Lateral Auxiliar / Resultados */}
        <div className="md:col-span-5 flex flex-col gap-6">
          <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8 flex-1 flex flex-col items-center justify-center text-center">
            {!result ? (
              <div className="text-gray-400 flex flex-col items-center gap-3">
                <FileText className="w-12 h-12 text-gray-200" />
                <p className="text-sm">Os resultados do processamento aparecerão aqui.</p>
              </div>
            ) : (
              <div className="w-full animate-in fade-in zoom-in duration-300 flex flex-col items-center">
                <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">Concluído</h3>
                <p className="text-sm text-gray-500 mb-8 border-b border-gray-100 pb-6 w-full">
                  Tempo no motor analítico: <span className="font-mono text-gray-900">{result.processing_time?.toFixed(2)}s</span>
                </p>

                <div className="flex flex-col w-full gap-3">
                  <button onClick={loadPreview} className="w-full py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm">
                    Revisar no Navegador
                  </button>
                  <a href={`${API_URL}${result.download_url}`} download className="w-full py-3 rounded-lg bg-gray-900 hover:bg-gray-800 text-white font-medium shadow-sm transition-colors text-sm text-center">
                    Baixar Arquivo
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Container de Preview Javascript */}
      <div id="docx-preview-wrapper" className={`max-w-5xl w-full mx-auto mt-10 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden ${result ? 'block' : 'hidden'}`}>
        <div className="border-b border-gray-100 p-4 bg-gray-50 flex items-center justify-between">
          <span className="font-medium text-gray-700 text-sm flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-500" /> Visualização Rápida JavaScript
          </span>
        </div>
        <div id="docx-preview-container" className="min-h-[500px] w-full bg-white p-8 overflow-auto">
          <div className="flex items-center justify-center h-full text-gray-300 text-sm">
            Clique em "Revisar" para carregar.
          </div>
        </div>
      </div>

    </div>
  );
}
