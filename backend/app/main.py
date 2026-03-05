import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import documents

# Inicializa banco de dados, caso queira que o script Python crie sqlite
from app.database import engine, Base
# Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Microserviço de Conversão Documental",
    description="API especializada em conversões de PDF para DOCX focada em alta fidelidade ("
                "preservação de layout com processamento local via pdf2docx).",
    version="1.0.0"
)

# Configurando permissões de CORS para que o FrontNext.js tenha flexibilidade
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Atenção, em produção especificar a origin exata da Vercel
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Bem vindo ao Microserviço de Conversão de Documentos."}

app.include_router(documents.router)
