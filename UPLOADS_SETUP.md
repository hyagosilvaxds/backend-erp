# 📁 Configuração de Uploads - Arquivos Estáticos

## Problema Comum

Quando o servidor NestJS é executado com `npm run start:dev`, o código TypeScript é compilado para JavaScript na pasta `dist/`. O servidor então roda a partir de `dist/main.js`.

Por padrão, a configuração `useStaticAssets(join(__dirname, '..', 'uploads'))` dentro de `dist/main.js` aponta para `dist/../uploads`, que resolve para a pasta `uploads/` na raiz do projeto. **Porém, o Express não consegue servir essa pasta automaticamente.**

## Solução Implementada

### 1. Link Simbólico

Criamos um link simbólico dentro da pasta `dist/` apontando para a pasta `uploads/` real:

```bash
cd /Users/hyago/Documents/ERP/backend-erp/dist
ln -sf ../uploads uploads
```

Isso cria `dist/uploads` → `../uploads` (pasta real)

### 2. Verificação

Para verificar se o link foi criado corretamente:

```bash
ls -la /Users/hyago/Documents/ERP/backend-erp/dist/uploads
```

Deve mostrar:
```
lrwxr-xr-x  1 hyago  staff  10 Oct 25 11:25 uploads -> ../uploads
```

### 3. Teste de Acesso

```bash
curl -I http://localhost:4000/uploads/logos/logo-xxxxxxxxxx.png
```

Deve retornar `200 OK` se funcionando corretamente.

## Estrutura de Pastas

```
backend-erp/
├── dist/                          # Código compilado
│   ├── uploads -> ../uploads      # Link simbólico
│   ├── main.js
│   └── ...
├── uploads/                       # Arquivos reais
│   ├── logos/
│   │   ├── .gitkeep
│   │   └── logo-*.png
│   └── certificates/
│       ├── .gitkeep
│       └── cert-*.pfx
└── src/
    └── main.ts
```

## Alternativa: Variável de Ambiente

No `src/main.ts`, implementamos uma solução alternativa usando variável de ambiente:

```typescript
const uploadsPath = process.env.UPLOADS_PATH || join(__dirname, '..', 'uploads');
app.useStaticAssets(uploadsPath, {
  prefix: '/uploads/',
});
```

Para produção, defina:
```bash
export UPLOADS_PATH=/var/www/erp/uploads
```

## Automação (Recomendado)

### Script no package.json

Adicione ao `package.json`:

```json
{
  "scripts": {
    "start:dev": "nest start --watch",
    "prestart:dev": "mkdir -p uploads/logos uploads/certificates && cd dist && ln -sf ../uploads uploads || true"
  }
}
```

O comando `prestart:dev` será executado automaticamente antes de `start:dev`.

### Script Shell

Crie `scripts/setup-uploads.sh`:

```bash
#!/bin/bash

# Criar pastas de upload se não existirem
mkdir -p uploads/logos
mkdir -p uploads/certificates

# Criar link simbólico se não existir
if [ ! -L "dist/uploads" ]; then
    cd dist
    ln -sf ../uploads uploads
    cd ..
fi

echo "✅ Setup de uploads concluído"
```

Torne executável:
```bash
chmod +x scripts/setup-uploads.sh
```

Execute:
```bash
./scripts/setup-uploads.sh
```

## Produção

### Opção 1: CDN (Recomendado)

Use serviços como:
- **Cloudinary** - Imagens
- **AWS S3** - Arquivos gerais
- **Google Cloud Storage** - Arquivos gerais
- **Azure Blob Storage** - Arquivos gerais

### Opção 2: Servidor de Arquivos

Configure NGINX ou Apache para servir a pasta `uploads/` diretamente:

**NGINX:**
```nginx
location /uploads/ {
    alias /var/www/erp/uploads/;
    autoindex off;
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

### Opção 3: Volume Docker

Se usar Docker, monte um volume:

```yaml
# docker-compose.yml
services:
  api:
    volumes:
      - ./uploads:/app/uploads
      - ./dist/uploads:/app/dist/uploads
```

## Segurança

1. **Certificados Digitais**: NUNCA servir via HTTP público
2. **Validação de Tipos**: Sempre validar extensões de arquivo
3. **Limite de Tamanho**: Configurado no multer
4. **Nomes Únicos**: Timestamp + random evita sobrescritas
5. **Permissões**: 
   - Logos: Leitura pública OK
   - Certificados: Apenas acesso interno

## Troubleshooting

### 404 ao acessar arquivo

1. Verifique se o link simbólico existe:
   ```bash
   ls -la dist/uploads
   ```

2. Verifique se o arquivo existe:
   ```bash
   ls -la uploads/logos/
   ```

3. Reinicie o servidor:
   ```bash
   npm run start:dev
   ```

4. Verifique os logs do servidor:
   ```
   📁 Servindo arquivos estáticos de: /path/to/dist/uploads
   ```

### Link quebrado após rebuild

O comando `nest build` pode apagar a pasta `dist/`. Recrie o link:

```bash
cd dist && ln -sf ../uploads uploads
```

Ou use o script `prestart:dev` no package.json.

## URLs de Acesso

| Tipo | Caminho no Servidor | URL Pública |
|------|---------------------|-------------|
| Logo | `uploads/logos/logo-123.png` | `http://localhost:4000/uploads/logos/logo-123.png` |
| Certificado | `uploads/certificates/cert-456.pfx` | ❌ Não acessível (apenas path interno) |

## Checklist de Setup

- [ ] Pasta `uploads/logos/` criada
- [ ] Pasta `uploads/certificates/` criada
- [ ] `.gitkeep` em ambas as pastas
- [ ] Link simbólico `dist/uploads` → `../uploads` criado
- [ ] Servidor reiniciado
- [ ] Teste de upload funcionando
- [ ] Teste de acesso via URL funcionando
- [ ] `.gitignore` configurado para ignorar arquivos de upload (exceto `.gitkeep`)
