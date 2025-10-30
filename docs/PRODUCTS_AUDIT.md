# Auditoria do Módulo de Produtos

## Visão Geral

O módulo de produtos implementa auditoria completa de todas as operações CRUD em categorias, unidades, marcas, produtos e gerenciamento de estoque e fotos.

## Ações Auditadas

### Categorias
- **CREATE_PRODUCT_CATEGORY**: Criação de categoria
- **UPDATE_PRODUCT_CATEGORY**: Atualização de categoria
- **DELETE_PRODUCT_CATEGORY**: Exclusão de categoria

### Unidades
- **CREATE_PRODUCT_UNIT**: Criação de unidade (auditoria não implementada ainda)
- **UPDATE_PRODUCT_UNIT**: Atualização de unidade (auditoria não implementada ainda)
- **DELETE_PRODUCT_UNIT**: Exclusão de unidade (auditoria não implementada ainda)

### Marcas
- **CREATE_PRODUCT_BRAND**: Criação de marca (auditoria não implementada ainda)
- **UPDATE_PRODUCT_BRAND**: Atualização de marca (auditoria não implementada ainda)
- **DELETE_PRODUCT_BRAND**: Exclusão de marca (auditoria não implementada ainda)

### Produtos
- **CREATE_PRODUCT**: Criação de produto
- **UPDATE_PRODUCT**: Atualização de produto
- **DELETE_PRODUCT**: Exclusão de produto

### Estoque
- **STOCK_MOVEMENT**: Movimentação de estoque (entrada, saída, ajuste, etc)

### Fotos
- **ADD_PRODUCT_PHOTO**: Adição de foto ao produto
- **REMOVE_PRODUCT_PHOTO**: Remoção de foto do produto
- **SET_PRIMARY_PHOTO**: Definição de foto principal
- **REORDER_PRODUCT_PHOTOS**: Reordenação de fotos

## Informações Registradas

Cada registro de auditoria contém:

- **companyId**: ID da empresa
- **userId**: ID do usuário que executou a ação
- **action**: Tipo de ação (ver lista acima)
- **entityType**: Sempre "Product", "ProductCategory", etc
- **description**: Descrição legível da ação
- **oldValue**: Valor anterior (JSON) - para updates e deletes
- **newValue**: Valor novo (JSON) - para creates e updates
- **createdAt**: Data/hora da operação

## Exemplos de Consultas SQL

### Ver todas as operações de um produto específico

```sql
SELECT 
  ca.action,
  ca.description,
  u.name as usuario,
  ca."createdAt"
FROM company_audits ca
JOIN users u ON u.id = ca."userId"
WHERE ca."entityType" = 'Product'
  AND ca."newValue"::jsonb->>'id' = 'product-id-aqui'
ORDER BY ca."createdAt" DESC;
```

### Ver movimentações de estoque de um produto

```sql
SELECT 
  ca.description,
  ca."newValue"::jsonb->'movement'->>'type' as tipo,
  ca."newValue"::jsonb->'movement'->>'quantity' as quantidade,
  ca."oldValue"::jsonb->>'currentStock' as estoque_anterior,
  ca."newValue"::jsonb->>'currentStock' as estoque_novo,
  u.name as usuario,
  ca."createdAt"
FROM company_audits ca
JOIN users u ON u.id = ca."userId"
WHERE ca."entityType" = 'Product'
  AND ca.action = 'STOCK_MOVEMENT'
  AND ca."newValue"::jsonb->'movement'->>'productId' = 'product-id-aqui'
ORDER BY ca."createdAt" DESC;
```

### Ver todas as categorias criadas no último mês

```sql
SELECT 
  ca.description,
  ca."newValue"::jsonb->>'name' as categoria,
  ca."newValue"::jsonb->>'parentId' as categoria_pai,
  u.name as usuario,
  ca."createdAt"
FROM company_audits ca
JOIN users u ON u.id = ca."userId"
WHERE ca."entityType" = 'ProductCategory'
  AND ca.action = 'CREATE_PRODUCT_CATEGORY'
  AND ca."createdAt" >= NOW() - INTERVAL '30 days'
ORDER BY ca."createdAt" DESC;
```

### Ver histórico de fotos de um produto

```sql
SELECT 
  ca.action,
  ca.description,
  CASE 
    WHEN ca.action = 'ADD_PRODUCT_PHOTO' THEN ca."newValue"::jsonb->>'photoId'
    WHEN ca.action = 'REMOVE_PRODUCT_PHOTO' THEN ca."oldValue"::jsonb->>'id'
    ELSE NULL
  END as photo_id,
  u.name as usuario,
  ca."createdAt"
FROM company_audits ca
JOIN users u ON u.id = ca."userId"
WHERE ca."entityType" = 'Product'
  AND ca.action IN ('ADD_PRODUCT_PHOTO', 'REMOVE_PRODUCT_PHOTO', 'SET_PRIMARY_PHOTO', 'REORDER_PRODUCT_PHOTOS')
  AND (
    ca."newValue"::jsonb->>'productId' = 'product-id-aqui' OR
    ca."oldValue"::jsonb->'product'->>'id' = 'product-id-aqui'
  )
ORDER BY ca."createdAt" DESC;
```

### Ver alterações de preço de um produto

```sql
SELECT 
  ca.description,
  ca."oldValue"::jsonb->>'salePrice' as preco_antigo,
  ca."newValue"::jsonb->>'salePrice' as preco_novo,
  ca."oldValue"::jsonb->>'costPrice' as custo_antigo,
  ca."newValue"::jsonb->>'costPrice' as custo_novo,
  u.name as usuario,
  ca."createdAt"
FROM company_audits ca
JOIN users u ON u.id = ca."userId"
WHERE ca."entityType" = 'Product'
  AND ca.action = 'UPDATE_PRODUCT'
  AND ca."newValue"::jsonb->>'id' = 'product-id-aqui'
  AND (
    ca."oldValue"::jsonb->>'salePrice' IS DISTINCT FROM ca."newValue"::jsonb->>'salePrice' OR
    ca."oldValue"::jsonb->>'costPrice' IS DISTINCT FROM ca."newValue"::jsonb->>'costPrice'
  )
ORDER BY ca."createdAt" DESC;
```

### Ver produtos deletados recentemente

```sql
SELECT 
  ca.description,
  ca."oldValue"::jsonb->>'name' as produto,
  ca."oldValue"::jsonb->>'sku' as sku,
  ca."oldValue"::jsonb->>'salePrice' as preco,
  u.name as usuario,
  ca."createdAt"
FROM company_audits ca
JOIN users u ON u.id = ca."userId"
WHERE ca."entityType" = 'Product'
  AND ca.action = 'DELETE_PRODUCT'
  AND ca."createdAt" >= NOW() - INTERVAL '7 days'
ORDER BY ca."createdAt" DESC;
```

### Estatísticas de operações por usuário

```sql
SELECT 
  u.name as usuario,
  ca.action,
  COUNT(*) as quantidade
FROM company_audits ca
JOIN users u ON u.id = ca."userId"
WHERE ca."entityType" IN ('Product', 'ProductCategory')
  AND ca."createdAt" >= NOW() - INTERVAL '30 days'
GROUP BY u.name, ca.action
ORDER BY quantidade DESC;
```

## Considerações Importantes

1. **Performance**: Os registros de auditoria podem crescer rapidamente. Considere implementar política de retenção.

2. **Campos JSON**: `oldValue` e `newValue` são armazenados como TEXT, mas podem ser parseados como JSON nas consultas.

3. **Pesquisa**: Use índices JSONB se precisar fazer muitas consultas nos valores JSON.

4. **Privacidade**: Dados sensíveis (como preços e custos) são armazenados na auditoria.

5. **Integridade**: Se um usuário for deletado, os registros de auditoria ainda mantém o `userId` mas a junção com `users` falhará.

## Futuras Melhorias

- [ ] Implementar auditoria para unidades e marcas
- [ ] Adicionar auditoria para variações de produtos
- [ ] Adicionar auditoria para compostos e combos
- [ ] Implementar dashboard de auditoria
- [ ] Adicionar exportação de relatórios de auditoria
- [ ] Implementar notificações para ações críticas
