# 🚀 Guia de Deploy - Revista App

Este guia explica como fazer deploy do backend Flask e tornar o app Expo acessível publicamente para o docente visualizar sem instalar nada localmente.

---

## 📋 Pré-requisitos

- ✅ Conta no GitHub (já configurado)
- ✅ Conta no Render.com (gratuita) ou Heroku
- ✅ Node.js e Expo CLI instalados localmente (para gerar QR code)

---

## 🔧 Passo 1: Deploy do Backend no Render

### 1.1 Preparação Local

Certifique-se de que os seguintes arquivos existem na raiz do projeto:

- ✅ `Procfile` - Define o comando para iniciar o servidor
- ✅ `runtime.txt` - Define a versão do Python
- ✅ `backend/requirements.txt` - Lista as dependências Python
- ✅ `.gitignore` - Ignora arquivos desnecessários

### 1.2 Criar Conta no Render

1. Acesse [render.com](https://render.com)
2. Faça login com sua conta GitHub
3. Clique em "New" → "Web Service"

### 1.3 Configurar o Deploy

1. **Conectar Repositório:**
   - Selecione seu repositório GitHub `Revista1`
   - Escolha a branch `main` ou `master`

2. **Configurações Básicas:**
   - **Name:** `revista-backend` (ou o nome que preferir)
   - **Region:** Escolha a região mais próxima (ex: `São Paulo`)
   - **Branch:** `main`
   - **Root Directory:** Deixe vazio (raiz do projeto)
   - **Runtime:** `Python 3`
   - **Build Command:** 
     ```bash
     pip install -r backend/requirements.txt
     ```
   - **Start Command:**
     ```bash
     python backend/main.py
     ```
     *Ou use o Procfile automaticamente se configurado*

3. **Variáveis de Ambiente (Environment Variables):**
   - Clique em "Advanced" → "Add Environment Variable"
   - Adicione:
     - `FLASK_ENV=production`
     - `DEBUG=False`
     - `BASE_URL=https://seu-backend.onrender.com` (substitua pela URL que o Render fornecerá)

4. **Plano:**
   - Escolha o plano **Free** (gratuito)
   - ⚠️ **Nota:** O plano free "dorme" após 15 minutos de inatividade, mas acorda automaticamente na primeira requisição (pode levar ~30 segundos)

5. **Criar o Serviço:**
   - Clique em "Create Web Service"
   - O Render começará a fazer deploy automaticamente

### 1.4 Aguardar o Deploy

- O deploy leva cerca de 5-10 minutos na primeira vez
- Você verá os logs do build em tempo real
- Quando concluir, você terá uma URL como: `https://revista-backend.onrender.com`

### 1.5 Testar o Backend

Acesse no navegador:
```
https://seu-backend.onrender.com/
```

Você deve ver:
```json
{"message": "API da Revista funcionando!"}
```

---

## 📱 Passo 2: Configurar o Frontend Expo

### 2.1 Atualizar a URL da API no Frontend

Depois que o backend estiver no ar, você precisa atualizar o `App.js` para usar a URL pública:

**Opção 1: Variável de Ambiente (Recomendado)**

1. Instale o pacote `expo-constants` (se ainda não tiver):
   ```bash
   cd frontend
   npm install expo-constants
   ```

2. No `frontend/App.js`, substitua a linha:
   ```javascript
   const API_BASE_URL = 'http://10.197.232.123:8000';
   ```
   
   Por:
   ```javascript
   import Constants from 'expo-constants';
   
   // URL da API - usa variável de ambiente ou fallback para local
   const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'https://seu-backend.onrender.com';
   ```

3. No `frontend/app.json`, adicione:
   ```json
   {
     "expo": {
       ...
       "extra": {
         "apiUrl": "https://seu-backend.onrender.com"
       }
     }
   }
   ```

**Opção 2: Mudança Direta (Simples)**

Simplesmente altere a linha no `App.js`:
```javascript
const API_BASE_URL = 'https://seu-backend.onrender.com';
```

### 2.2 Publicar o App Expo

#### Opção A: Usando Expo Go (Mobile)

1. **Instalar Expo Go no celular do docente:**
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Iniciar o Expo localmente:**
   ```bash
   cd frontend
   npm start
   ```
   Ou use: `start-expo.bat`

3. **Obter QR Code:**
   - O Expo gerará um QR code no terminal
   - O docente escaneia o QR code com o app Expo Go
   - ⚠️ **Importante:** Você e o docente precisam estar na mesma rede Wi-Fi, OU você precisa usar o modo "Tunnel" do Expo

4. **Modo Tunnel (Para acesso remoto):**
   - No terminal do Expo, pressione `s` para abrir as opções
   - Selecione "Tunnel" (pode ser mais lento, mas funciona de qualquer lugar)

#### Opção B: Deploy Web (Expo Web)

Para o docente acessar pelo navegador sem instalar nada:

1. **Instalar dependências:**
   ```bash
   cd frontend
   npm install
   ```

2. **Build Web:**
   ```bash
   npx expo export:web
   ```

3. **Deploy Web:**
   - Você pode fazer deploy em qualquer serviço estático:
     - **Vercel:** `vercel --prod`
     - **Netlify:** `netlify deploy --prod`
     - **GitHub Pages:** Configurar manualmente

4. **Ou hospedar o build manualmente:**
   - A pasta `frontend/web-build` contém os arquivos estáticos
   - Faça upload para qualquer servidor web

---

## 🌐 Passo 3: Tornar o Expo Acessível Publicamente

### 3.1 Usando Expo Tunnel

Quando você roda `npx expo start`, pode pressionar `t` para usar o modo tunnel, que cria uma URL pública temporária.

### 3.2 Usando ngrok (Alternativa)

Se já tem o `start-ngrok.bat`, você pode:

1. Inicie o Expo: `npm start` (na pasta frontend)
2. Use o ngrok para expor o Expo (porta 19000 ou 8081 geralmente):
   ```bash
   ngrok http 8081
   ```
3. Compartilhe a URL do ngrok com o docente

---

## 📝 Checklist Final

- [ ] Backend deployado no Render
- [ ] URL do backend testada e funcionando
- [ ] `App.js` atualizado com a URL pública do backend
- [ ] Expo iniciado localmente
- [ ] QR Code gerado e compartilhado com docente
- [ ] Docente consegue acessar via Expo Go

---

## 🔍 Troubleshooting

### Backend não responde
- Verifique os logs no Render Dashboard
- Confirme que a variável `BASE_URL` está configurada corretamente
- Aguarde ~30 segundos na primeira requisição (plano free "acorda" após dormir)

### Expo não conecta ao backend
- Verifique se a URL no `App.js` está correta
- Confirme que o backend está acessível (teste no navegador)
- Verifique se há problemas de CORS (deve estar configurado no Flask)

### Erro de CORS
O backend já tem `CORS(app)` configurado, mas se precisar ajustar:
```python
# No backend/main.py
CORS(app, resources={r"/*": {"origins": "*"}})
```

### Banco de dados não funciona
- O SQLite pode ter limitações no Render (considere PostgreSQL para produção)
- Verifique os logs para erros de permissão

---

## 🎯 Resumo para o Docente

**Para o docente acessar seu app:**

1. Instalar Expo Go no celular
2. Escanear o QR code que você fornecer
3. O app carregará automaticamente
4. Todas as funcionalidades funcionarão normalmente (backend na nuvem)

**Nenhuma instalação local necessária!** 🎉

---

## 📞 Próximos Passos (Opcional)

- Considerar usar **PostgreSQL** em vez de SQLite para produção
- Adicionar **autenticação JWT** mais robusta
- Configurar **domínio customizado** no Render
- Fazer deploy do frontend web em **Vercel** ou **Netlify**

