# Como Expor o Projeto na Internet

## Backend (Flask - Porta 8000)

### Opção 1: Usar o arquivo .bat
Execute: `start-ngrok-backend.bat`

### Opção 2: Manualmente
```bash
ngrok http 8000
```

Após iniciar, o ngrok mostrará uma URL pública como:
- `https://xxxx-xx-xx-xx-xx.ngrok-free.app`

**IMPORTANTE:** Copie essa URL e atualize o `API_BASE_URL` no `frontend/App.js`

## Frontend (Expo)

O Expo tem um túnel nativo integrado que é mais fácil que usar ngrok:

### Iniciar com túnel (recomendado):
```bash
cd frontend
npx expo start --tunnel
```

Isso criará automaticamente um túnel público e mostrará:
- QR code para escanear de qualquer lugar
- URL pública para acessar

### Alternativa com ngrok:
Se quiser usar ngrok para o frontend também:
1. Inicie o Expo normalmente: `npx expo start`
2. Note a porta do Metro Bundler (geralmente 8081 ou 19000)
3. Em outro terminal: `ngrok http [PORTA_DO_METRO]`

## Configuração Completa

1. **Iniciar Backend:**
   ```bash
   cd backend
   python main.py
   ```

2. **Expor Backend com ngrok:**
   ```bash
   ngrok http 8000
   ```
   Copie a URL HTTPS gerada (ex: `https://abc123.ngrok-free.app`)

3. **Atualizar Frontend:**
   - Abra `frontend/App.js`
   - Substitua `API_BASE_URL` pela URL do ngrok:
   ```javascript
   const API_BASE_URL = 'https://abc123.ngrok-free.app';
   ```

4. **Iniciar Frontend com túnel:**
   ```bash
   cd frontend
   npx expo start --tunnel
   ```

Agora o projeto estará acessível de qualquer lugar na internet!

## Notas Importantes

- URLs do ngrok gratuitas mudam a cada reinicialização (a menos que use conta paga)
- Use HTTPS no frontend quando usar URLs do ngrok
- Certifique-se de que o backend aceita requisições do domínio do ngrok (CORS já está configurado)
- O túnel do Expo é mais estável e recomendado para desenvolvimento


