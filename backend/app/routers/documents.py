import os
import uuid
import shutil
from datetime import datetime
from fastapi import APIRouter, File, UploadFile, Form, HTTPException, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pdf2docx import Converter

from app.database import get_db

router = APIRouter(
    prefix="/api/v1/documents",
    tags=["documents"]
)

UPLOAD_DIR = "storage/uploads"
CONVERTED_DIR = "storage/converted"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(CONVERTED_DIR, exist_ok=True)


@router.post("/convert")
async def convert_document(
    user_id: str = Form(...),
    client: str = Form(...),
    document_type: str = Form(...),
    title: str = Form(...),
    reference: str = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Apenas arquivos PDF são suportados.")

    doc_id = str(uuid.uuid4())
    
    # 1. Salvar o PDF de entrada
    pdf_filename = f"{doc_id}_{file.filename}"
    pdf_path = os.path.join(UPLOAD_DIR, pdf_filename)
    
    with open(pdf_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # 2. Definir o destino do DOCX
    docx_filename = f"{doc_id}.docx"
    docx_path = os.path.join(CONVERTED_DIR, docx_filename)
    
    start_time = datetime.now()
    
    try:
        # A lib pdf2docx analisa a estrutura de blocos e reconstrói tabelas e parágrafos.
        # Ajustes de parâmetros para ignorar imagens soltas/fundo que causam páginas brancas ou perda de layout.
        # Usamos multi_processing e debug_mode disabled para ganhar velocidade.
        cv = Converter(pdf_path)
        cv.convert(docx_path, start=0, end=None, connected_border=False, debug=False)
        cv.close()
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        from app.supabase_client import supabase, upload_to_storage
        
        if supabase:
            try:
                # Faz o upload dos arquivos para o Supabase Storage (Buckets)
                # O bucket name precisa ser criado no Dashboard ("documents")
                await upload_to_storage("documents", pdf_path, f"pdfs/{pdf_filename}", "application/pdf")
                await upload_to_storage("documents", docx_path, f"docx/{docx_filename}", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")

                # Salvar no Supabase (Base de Dados)
                supabase.table("document_conversions").insert({
                    "id": doc_id,
                    "user_id": user_id,
                    "client": client,
                    "document_type": document_type,
                    "title": title,
                    "reference": reference,
                    "original_pdf_path": pdf_path,
                    "converted_docx_path": docx_path,
                    "status": "COMPLETED",
                    "metadata": {
                        "processing_time_sec": processing_time,
                        "original_filename": file.filename
                    }
                }).execute()
            except Exception as db_err:
                print(f"Aviso: Erro ao salvar no Supabase ou Storage: {db_err}")
                
        # Limpar os ficheiros fisicos do HD efémero para economizar espaco no Render
        if os.path.exists(pdf_path):
            os.remove(pdf_path)
        if os.path.exists(docx_path):
            os.remove(docx_path)
        
        return {
            "status": "success",
            "message": "Conversão realizada com sucesso.",
            "data": {
                "document_id": doc_id,
                "preview_url": f"/api/v1/documents/preview/{doc_id}",
                "download_url": f"/api/v1/documents/download/{doc_id}",
                "processing_time": processing_time
            }
        }
        
    except Exception as e:
        if os.path.exists(pdf_path):
            os.remove(pdf_path)
        if os.path.exists(docx_path):
            os.remove(docx_path)
        raise HTTPException(status_code=500, detail=f"Erro na conversão: {str(e)}")


@router.get("/preview/{doc_id}")
async def get_preview(doc_id: str):
    from app.supabase_client import get_signed_url
    
    # 1. Tentar primeiro obter a URL assinada direto do Supabase Storage
    # Os ficheiros são guardados no Bucket "documents" na pasta "docx"
    signed_url = get_signed_url("documents", f"docx/{doc_id}.docx")
    
    if signed_url:
        from fastapi.responses import RedirectResponse
        return RedirectResponse(url=signed_url)
        
    # 2. Fallback caso o ficheiro esteja no disco local momentaneamente ou haja erro
    docx_path = os.path.join(CONVERTED_DIR, f"{doc_id}.docx")
    if not os.path.exists(docx_path):
        raise HTTPException(status_code=404, detail="Documento não encontrado na nuvem nem no disco (limite efêmero).")
    
    return FileResponse(
        docx_path, 
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        filename=f"{doc_id}.docx"
    )

@router.get("/download/{doc_id}")
async def download_converted(doc_id: str):
    return await get_preview(doc_id)
