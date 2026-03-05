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

# Expor a porta FastAPI
EXPOSE 8000

# Iniciar Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
