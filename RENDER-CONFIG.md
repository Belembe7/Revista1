# ⚙️ Configuração Específica do Render

Este documento contém as configurações **exatas** para fazer deploy do backend Python no Render.

---

## 📋 Estrutura do Projeto

```
Revista1/
├── backend/              ← Python Flask (Backend)
│   ├── main.py
│   ├── requirements.txt  ← Dependências Python
│   └── uploads/
├── frontend/            ← React Native Expo (Frontend)
│   ├── package.json     ← Dependências Node.js (apenas frontend)
│   └── App.js
├── Procfile             ← Comando para iniciar backend
├── runtime.txt          ← Versão do Python
└── README.md
```

**⚠️ IMPORTANTE:** O backend é **Python**, não Node.js! Não precisa de `package.json` na raiz.

---

## 🔧 Configuração no Painel do Render

### Passo a Passo Detalhado

#### 1. Criar Novo Web Service

1. Acesse [dashboard.render.com](https://dashboard.render.com)
2. Clique em **"New"** → **"Web Service"**
3. Conecte seu repositório GitHub `Revista1`

#### 2. Configurações Básicas

Preencha os campos com **exatamente** estas configurações:

| Campo | Valor |
|------|-------|
| **Name** | `revista-backend` (ou qualquer nome) |
| **Region** | Escolha a mais próxima (ex: `São Paulo`) |
| **Branch** | `main` (ou `master`) |
| **Root Directory** | ⚠️ **DEIXE VAZIO** ou coloque `.` (raiz) |
| **Runtime** | ⚠️ **Python 3** (não Node.js!) |
| **Build Command** | `pip install -r backend/requirements.txt` |
| **Start Command** | ⚠️ **DEIXE VAZIO** (usa o Procfile automaticamente) |

#### 3. Configurações Avançadas

Clique em **"Advanced"** e configure:

**Environment Variables (Variáveis de Ambiente):**
```
FLASK_ENV=production
DEBUG=False
PORT=8000
BASE_URL=https://revista-backend.onrender.com
```
*(Ajuste o BASE_URL para a URL que o Render fornecerá após o deploy)*

**Plan:**
- Escolha **Free** (gratuito)

#### 4. Criar Serviço

- Clique em **"Create Web Service"**
- Aguarde o deploy (5-10 minutos na primeira vez)

---

## 🔍 Como o Render Vai Funcionar

1. **Detecta Python** pelo `runtime.txt` e `requirements.txt`
2. **Executa o Build Command:** Instala as dependências Python
3. **Executa o Procfile:** Roda `gunicorn main:app` para iniciar o servidor
4. **Expoe na porta:** O Render automaticamente define a variável `$PORT`

---

## ✅ Verificação Pós-Deploy

Após o deploy concluir:

1. **Verifique os logs** no dashboard do Render
2. **Teste a API:**
   ```
   https://seu-backend.onrender.com/
   ```
   Deve retornar:
   ```json
   {"message": "API da Revista funcionando!"}
   ```
3. **Anote a URL** para atualizar no frontend

---

## 🐛 Troubleshooting

### Erro: "ENOENT: no such file or directory, open '/opt/render/project/src/package.json'"

**Causa:** O Render está tentando usar Node.js em vez de Python.

**Solução:**
- Verifique se **Runtime** está como **Python 3**
- Verifique se **Root Directory** está vazio ou `.`
- Confirme que existe `backend/requirements.txt`

### Erro: "Module not found" ou "No such file: main.py"

**Causa:** O caminho do arquivo está errado.

**Solução:**
- Verifique o Procfile:
  ```
  web: cd backend && gunicorn main:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120
  ```
- Confirme que `backend/main.py` existe

### Erro: "Port already in use"

**Causa:** O código não está usando a variável `$PORT`.

**Solução:**
- Já está configurado! O `main.py` usa `os.environ.get('PORT', 8000)`
- O Gunicorn usa `$PORT` automaticamente

---

## 📝 Comandos Alternativos (Se Precisar)

Se por algum motivo o Procfile não funcionar, você pode especificar manualmente no Render:

**Start Command:**
```bash
cd backend && gunicorn main:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120
```

Ou se preferir usar Python diretamente (não recomendado para produção):
```bash
cd backend && python main.py
```

**Mas o Procfile é a forma recomendada!**

---

## 🎯 Resumo das Configurações

✅ **Root Directory:** Vazio (ou `.`)  
✅ **Runtime:** Python 3  
✅ **Build Command:** `pip install -r backend/requirements.txt`  
✅ **Start Command:** Vazio (usa Procfile)  
✅ **Procfile existe:** Sim  
✅ **requirements.txt existe:** Sim (`backend/requirements.txt`)  
✅ **main.py existe:** Sim (`backend/main.py`)

---

**Com essas configurações, o deploy deve funcionar perfeitamente!** 🚀

