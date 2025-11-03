# 🚀 Quick Start - Deploy no Render (Resumo Rápido)

## ⚡ Configuração Rápida no Render

### Valores Exatos para Copiar e Colar

| Campo | Valor | Observação |
|-------|-------|------------|
| **Name** | `revista-backend` | Qualquer nome |
| **Runtime** | `Python 3` | ⚠️ Não Node.js! |
| **Root Directory** | *(vazio)* | ⚠️ Deixe em branco |
| **Build Command** | `pip install -r backend/requirements.txt` | |
| **Start Command** | *(vazio)* | ⚠️ Deixe em branco (usa Procfile) |

### Variáveis de Ambiente

Adicione estas no painel do Render (Advanced → Environment Variables):

```
FLASK_ENV=production
DEBUG=False
PORT=8000
BASE_URL=https://revista-backend.onrender.com
```
*(Ajuste BASE_URL depois que o Render fornecer a URL)*

---

## ✅ Checklist Pré-Deploy

- [x] `Procfile` existe na raiz ✅
- [x] `runtime.txt` existe na raiz ✅
- [x] `backend/requirements.txt` existe ✅
- [x] `backend/main.py` existe ✅
- [x] `.gitignore` configurado ✅

---

## 📁 Estrutura do Projeto (Confirmação)

```
Revista1/                    ← Root do repositório GitHub
│
├── Procfile                ← ✅ Render lê daqui
├── runtime.txt             ← ✅ Render detecta Python
├── .gitignore              ← ✅ Evita uploads desnecessários
│
├── backend/                ← Backend Python
│   ├── main.py            ← ✅ App Flask principal
│   ├── requirements.txt   ← ✅ Dependências Python
│   │                         (flask, flask-cors, gunicorn)
│   └── uploads/           ← Pasta de imagens
│
└── frontend/               ← Frontend React Native (NÃO vai pro Render)
    ├── package.json       ← ⚠️ NÃO necessário para backend!
    └── App.js
```

---

## 🎯 O Que o Render Vai Fazer

1. ✅ Detecta **Python** pelo `runtime.txt`
2. ✅ Executa: `pip install -r backend/requirements.txt`
3. ✅ Lê o `Procfile`: `web: cd backend && gunicorn main:app ...`
4. ✅ Inicia o servidor na porta `$PORT` (definida automaticamente)

---

## ❌ Erros Comuns e Soluções

### Erro: `ENOENT: no such file or directory, open 'package.json'`

**Problema:** Render está tentando usar Node.js

**Solução:**
- ✅ Verifique se **Runtime** está como **Python 3**
- ✅ Verifique se **Root Directory** está vazio
- ✅ Ignore qualquer mensagem sobre `package.json` - não é necessário!

### Erro: `ModuleNotFoundError` ou `No module named 'flask'`

**Problema:** Dependências não foram instaladas

**Solução:**
- ✅ Verifique se **Build Command** está: `pip install -r backend/requirements.txt`
- ✅ Verifique se `backend/requirements.txt` existe e tem as dependências

### Erro: `Port already in use` ou servidor não inicia

**Problema:** Configuração de porta incorreta

**Solução:**
- ✅ Já está configurado! O Procfile usa `$PORT` automaticamente
- ✅ O `main.py` também usa `os.environ.get('PORT', 8000)`

---

## 🧪 Teste Após Deploy

Após o deploy, acesse:

```
https://seu-backend.onrender.com/
```

**Resposta esperada:**
```json
{"message": "API da Revista funcionando!"}
```

Se funcionar, está tudo certo! 🎉

---

## 📞 Próximo Passo

Depois que o backend estiver no ar:

1. Anote a URL (ex: `https://revista-backend.onrender.com`)
2. Atualize `frontend/App.js`:
   ```javascript
   const API_BASE_URL = 'https://revista-backend.onrender.com';
   ```
3. Ou use o script helper:
   ```bash
   node update-api-url.js "https://revista-backend.onrender.com"
   ```

---

**Documentação Completa:** Veja `RENDER-CONFIG.md` para mais detalhes.

