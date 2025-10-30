# Integração de Fotos com Hub de Documentos

## Visão Geral

O módulo de produtos está integrado com o hub de documentos existente para gerenciamento de fotos dos produtos. As fotos são armazenadas como documentos e vinculadas aos produtos através da tabela `ProductPhoto`.

## Arquitetura

```
Document (Hub)
     ↓ (documentId)
ProductPhoto
     ↓ (productId)
  Product
```

### Modelo ProductPhoto

```prisma
model ProductPhoto {
  id         String   @id @default(uuid())
  productId  String
  product    Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  documentId String   // Referência ao documento no hub
  isPrimary  Boolean  @default(false)  // Se é a foto principal
  order      Int      @default(0)      // Ordem de exibição
  
  createdAt  DateTime @default(now())
}
```

## Fluxo de Trabalho

### 1. Upload de Foto

1. **Upload do arquivo** para o hub de documentos:
   ```http
   POST /documents
   Content-Type: multipart/form-data
   
   {
     "file": <arquivo>,
     "folderId": "folder-id-fotos-produtos",
     "allowedRoleIds": ["admin", "manager"]
   }
   ```
   
2. **Vinculação ao produto**:
   ```http
   POST /products/{productId}/photos
   {
     "documentId": "document-id-retornado",
     "isPrimary": true,
     "order": 0
   }
   ```

### 2. Listagem de Fotos

As fotos são automaticamente incluídas ao buscar um produto:

```http
GET /products/{productId}
```

Resposta:
```json
{
  "id": "product-id",
  "name": "Produto Exemplo",
  "photos": [
    {
      "id": "photo-id-1",
      "documentId": "doc-id-1",
      "isPrimary": true,
      "order": 0
    },
    {
      "id": "photo-id-2",
      "documentId": "doc-id-2",
      "isPrimary": false,
      "order": 1
    }
  ]
}
```

Para buscar as URLs das fotos, consulte o hub de documentos:
```http
GET /documents/{documentId}
```

### 3. Definir Foto Principal

```http
PATCH /products/{productId}/photos/{photoId}/primary
```

Isso automaticamente desmarca as outras fotos como não-primárias.

### 4. Reordenar Fotos

```http
PATCH /products/{productId}/photos/reorder
{
  "photoOrders": [
    { "id": "photo-id-1", "order": 0 },
    { "id": "photo-id-2", "order": 1 },
    { "id": "photo-id-3", "order": 2 }
  ]
}
```

### 5. Remover Foto

```http
DELETE /products/{productId}/photos/{photoId}
```

**Importante**: Isso apenas remove o vínculo. O documento permanece no hub.

## Endpoints Disponíveis

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/products/:id/photos` | Adiciona foto ao produto |
| DELETE | `/products/:id/photos/:photoId` | Remove foto do produto |
| PATCH | `/products/:id/photos/:photoId/primary` | Define foto como principal |
| PATCH | `/products/:id/photos/reorder` | Reordena fotos do produto |

## Permissões Necessárias

- **Adicionar/Remover/Reordenar fotos**: `products.update`
- **Upload de documento**: `documents.create`
- **Visualizar fotos**: `products.read` e `documents.read`

## Organização no Hub de Documentos

### Estrutura de Pastas Recomendada

```
📁 Documentos
  📁 Produtos
    📁 Fotos Principais
    📁 Fotos Adicionais
    📁 Manuais
    📁 Fichas Técnicas
```

### Criação de Pasta Dedicada

```http
POST /documents/folders
{
  "name": "Fotos de Produtos",
  "parentId": null,
  "allowedRoleIds": ["admin", "manager", "stockist"]
}
```

## Boas Práticas

### 1. Nomenclatura de Arquivos

Use nomenclatura consistente:
- `produto-{sku}-principal.jpg`
- `produto-{sku}-{numero}.jpg`

### 2. Tamanhos de Imagem

Recomendações:
- **Miniatura**: 150x150px
- **Lista**: 300x300px
- **Detalhes**: 800x800px
- **Zoom**: 1200x1200px

### 3. Formatos Aceitos

- **Preferenciais**: JPG, PNG, WebP
- **Tamanho máximo**: 5MB por arquivo

### 4. Otimização

- Comprima imagens antes do upload
- Use ferramentas como TinyPNG ou ImageOptim
- Considere gerar thumbnails automáticos

### 5. Ordem das Fotos

- Foto principal (isPrimary: true): order = 0
- Demais fotos: order sequencial (1, 2, 3...)

## Consultas SQL Úteis

### Produtos sem foto

```sql
SELECT p.id, p.name, p.sku
FROM products p
LEFT JOIN product_photos pp ON pp."productId" = p.id
WHERE pp.id IS NULL
  AND p.active = true;
```

### Produtos com múltiplas fotos principais

```sql
SELECT p.id, p.name, COUNT(*) as fotos_principais
FROM products p
JOIN product_photos pp ON pp."productId" = p.id
WHERE pp."isPrimary" = true
GROUP BY p.id, p.name
HAVING COUNT(*) > 1;
```

### Fotos órfãs (sem produto)

```sql
SELECT d.id, d."originalName", d."createdAt"
FROM documents d
LEFT JOIN product_photos pp ON pp."documentId" = d.id
WHERE pp.id IS NULL
  AND d."folderId" IN (
    SELECT id FROM document_folders WHERE name LIKE '%Produto%'
  );
```

### Produtos com fotos, ordenadas

```sql
SELECT 
  p.name as produto,
  pp.id as photo_id,
  d."originalName" as arquivo,
  pp."isPrimary" as principal,
  pp."order" as ordem
FROM products p
JOIN product_photos pp ON pp."productId" = p.id
JOIN documents d ON d.id = pp."documentId"
WHERE p.id = 'product-id-aqui'
ORDER BY pp."order" ASC;
```

## Integração com Frontend

### Exemplo React/Next.js

```typescript
// Buscar produto com fotos
const product = await fetch(`/api/products/${productId}`);

// Para cada foto, buscar URL do documento
const photosWithUrls = await Promise.all(
  product.photos.map(async (photo) => {
    const doc = await fetch(`/api/documents/${photo.documentId}`);
    return {
      ...photo,
      url: doc.url,
      thumbnailUrl: doc.thumbnailUrl
    };
  })
);

// Ordenar por ordem
photosWithUrls.sort((a, b) => a.order - b.order);

// Foto principal
const mainPhoto = photosWithUrls.find(p => p.isPrimary) || photosWithUrls[0];
```

### Galeria de Fotos

```jsx
function ProductGallery({ photos }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const mainPhoto = photos.find(p => p.isPrimary) || photos[0];
  const otherPhotos = photos.filter(p => !p.isPrimary);
  
  return (
    <div className="product-gallery">
      <div className="main-photo">
        <img src={mainPhoto.url} alt={mainPhoto.order} />
      </div>
      <div className="thumbnails">
        {otherPhotos.map((photo, index) => (
          <img
            key={photo.id}
            src={photo.thumbnailUrl}
            onClick={() => setSelectedIndex(index)}
            className={selectedIndex === index ? 'active' : ''}
          />
        ))}
      </div>
    </div>
  );
}
```

## Auditoria

Todas as operações de fotos são auditadas:

- `ADD_PRODUCT_PHOTO`: Foto adicionada
- `REMOVE_PRODUCT_PHOTO`: Foto removida
- `SET_PRIMARY_PHOTO`: Foto principal alterada
- `REORDER_PRODUCT_PHOTOS`: Fotos reordenadas

Ver documento `PRODUCTS_AUDIT.md` para mais detalhes.

## Limitações e Considerações

1. **Não há soft delete**: Ao remover vínculo, não há como recuperar (a menos que tenha auditoria)

2. **Documentos permanecem**: Remover foto do produto não deleta o documento do hub

3. **Sem validação de formato**: O sistema aceita qualquer documento, não apenas imagens

4. **Sem compressão automática**: Arquivos são armazenados como enviados

5. **Sem CDN**: Por padrão, arquivos são servidos diretamente do servidor

## Melhorias Futuras

- [ ] Adicionar validação de tipo de arquivo (apenas imagens)
- [ ] Implementar geração automática de thumbnails
- [ ] Adicionar integração com CDN
- [ ] Implementar compressão automática de imagens
- [ ] Adicionar marca d'água opcional
- [ ] Suporte a imagens de variações (por cor/tamanho)
- [ ] Implementar zoom/galeria 360°
- [ ] Adicionar suporte a vídeos de produtos
