# Revista Digital - Expo React Native + FastAPI

Este projeto consiste em uma aplicação móvel React Native (Expo) que se comunica com um backend FastAPI usando SQLite como banco de dados.

## Estrutura do Projeto

```
Revista1/
├── frontend/          # Aplicação React Native (Expo)
├── backend/           # API FastAPI com SQLite
└── README.md
```

## Funcionalidades

- ✅ Criar artigos
- ✅ Listar artigos
- ✅ Deletar artigos
- ✅ Interface responsiva para Android
- ✅ Comunicação frontend-backend via HTTP

## Pré-requisitos

- Node.js (versão 16 ou superior)
- Python 3.8 ou superior
- Expo CLI (`npm install -g @expo/cli`)
- Dispositivo Android com Expo Go instalado

## Como Executar

### 1. Backend (FastAPI)

```bash
# Navegar para o diretório do backend
cd backend

# Instalar dependências Python
pip install -r requirements.txt

# Executar o servidor
python main.py
```

O backend estará rodando em `http://localhost:8000`

### 2. Frontend (React Native)

```bash
# Navegar para o diretório do frontend
cd frontend

# Instalar dependências (já instaladas)
npm install

# Executar o projeto
npx expo start
```

### 3. Configuração de Rede

**IMPORTANTE**: Para que o app móvel se comunique com o backend, você precisa:

1. Descobrir o IP da sua máquina na rede local:
   - Windows: `ipconfig`
   - Linux/Mac: `ifconfig`

2. Atualizar o IP no arquivo `frontend/App.js`:
   ```javascript
   const API_BASE_URL = 'http://SEU_IP_AQUI:8000';
   ```

3. Garantir que ambos (máquina e dispositivo móvel) estejam na mesma rede Wi-Fi

### 4. Testando no Android

1. Instale o app "Expo Go" na Play Store
2. Escaneie o QR code que aparece no terminal
3. O app será carregado no seu dispositivo

## API Endpoints

- `GET /` - Status da API
- `GET /artigos` - Lista todos os artigos
- `GET /artigos/{id}` - Busca artigo específico
- `POST /artigos` - Cria novo artigo
- `PUT /artigos/{id}` - Atualiza artigo
- `DELETE /artigos/{id}` - Deleta artigo

## Próximas Fases

- [ ] Autenticação de usuários
- [ ] Upload de imagens
- [ ] Categorias de artigos
- [ ] Sistema de comentários
- [ ] Notificações push
- [ ] Modo offline

## Tecnologias Utilizadas

- **Frontend**: React Native, Expo, Axios
- **Backend**: FastAPI, SQLite, Pydantic
- **Banco de Dados**: SQLite
- **Comunicação**: HTTP/REST API
