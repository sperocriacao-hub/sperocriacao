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
        # A lib pdf2docx analisa a estrutura de blocos e reconstrói tabelas e parágrafos
        cv = Converter(pdf_path)
        cv.convert(docx_path, start=0, end=None)
        cv.close()
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        # Em um cenário completo, salvaríamos as infos no DB aqui usando SQLAlchemy:
        # new_conversion = ConversionModel(id=doc_id, user_id=user_id, client=client, ...)
        # db.add(new_conversion)
        # db.commit()
        
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
        raise HTTPException(status_code=500, detail=f"Erro na conversão: {str(e)}")


@router.get("/preview/{doc_id}")
async def get_preview(doc_id: str):
    docx_path = os.path.join(CONVERTED_DIR, f"{doc_id}.docx")
    if not os.path.exists(docx_path):
        raise HTTPException(status_code=404, detail="Documento não encontrado")
    
    return FileResponse(
        docx_path, 
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        filename=f"{doc_id}.docx"
    )

@router.get("/download/{doc_id}")
async def download_converted(doc_id: str):
    return await get_preview(doc_id)
