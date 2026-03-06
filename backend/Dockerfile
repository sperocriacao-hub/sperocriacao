FROM python:3.11-slim

WORKDIR /app

# Instalar dependências de sistema comumente necessárias para manipulação de imagem/pdf
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements antes para cache de doclayer
COPY requirements.txt .

# Instalar pacotes Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiar o resto da aplicação
COPY . .

# Expor a porta FastAPI (Apenas documentar, o Render passa dinamicamente pela env $PORT)
EXPOSE 8000

# Iniciar Uvicorn usando a variável $PORT (o Render geralmente entrega na porta 10000)
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
