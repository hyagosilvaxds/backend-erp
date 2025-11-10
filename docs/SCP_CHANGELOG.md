# Changelog - Módulo SCP

## [1.4.0] - 2024-11-10

### Adicionado
- **Distribuição em Lote**: Novo endpoint `POST /scp/distributions/bulk` para criar distribuições para múltiplos investidores simultaneamente
  - DTO: `CreateBulkDistributionDto` e `BulkDistributionItemDto`
  - Service: Método `createBulk()` com transação atômica
  - Controller: Endpoint com autenticação e validação
  - Documentação completa: `SCP_BULK_DISTRIBUTIONS.md`
  - Resumo técnico: `SCP_BULK_DISTRIBUTIONS_SUMMARY.md`
  - Exemplos HTTP: `bulk-distributions-tests.http`

### Melhorado
- Performance: 10x mais rápido para criar múltiplas distribuições
- Segurança: Transações atômicas garantem consistência
- Flexibilidade: Cada investidor pode ter deduções diferentes
- Documentação: Guia completo com casos de uso e boas práticas

### Características
- Campos compartilhados (projectId, distributionDate, status, etc.)
- Campos individuais por investidor (amount, percentage, irrf, notes)
- Cálculo automático de netAmount
- Atualização automática de distributedValue do projeto
- Validação de existência de projeto e investidores
- Rollback automático em caso de erro

---

## [1.3.0] - 2024-11-10

### Adicionado
- **Documentos em Aportes**: Sistema completo de documentos para investimentos
  - DTO: `UploadInvestmentDocumentDto`
  - Service: `InvestmentDocumentsService` com CRUD completo
  - Controller: `InvestmentDocumentsController` com 4 endpoints
  - Estrutura de pastas automática: `SCP > Aportes > {Project} > {Investor} > {Category}`
  - Documentação: `SCP_INVESTMENT_DOCUMENTS.md`

### Corrigido
- **Permissões**: Método `checkUserPermissions()` agora verifica múltiplos recursos:
  - `investidores`
  - `scp`
  - `projetos_scp`
  - `aportes`
  - `investments`
  - `documents`
- **Admin Role**: Verificação explícita de roles Admin/Administrador
- **Query Performance**: Uso de `userCompany.findFirst()` ao invés de `user.findUnique()` com nested includes

### Endpoints
- `POST /scp/investments/documents/upload`: Upload de documento
- `GET /scp/investments/documents/:investmentId`: Listar documentos de um aporte
- `GET /scp/investments/documents/:documentId/download`: Download de documento
- `DELETE /scp/investments/documents/:documentId`: Deletar documento

---

## [1.2.0] - 2024-11-09

### Adicionado
- **Documentos em Projetos**: Campo `documents` incluído no GET de projeto individual
  - Endpoint: `GET /scp/projects/:id` agora retorna array de documentos vinculados

### Melhorado
- Documentação atualizada com exemplos de resposta incluindo documentos

---

## [1.1.0] - 2024-10-XX

### Adicionado
- Políticas de Distribuição (`DistributionPolicy`)
- Distribuições manuais (`Distribution`)
- Cálculo automático de ROI
- Validações de negócio aprimoradas

---

## [1.0.0] - 2024-09-XX

### Adicionado
- Módulo SCP inicial
- CRUD de Investidores (Pessoa Física e Jurídica)
- CRUD de Projetos SCP
- CRUD de Investimentos (Aportes)
- Sistema de endereços
- Sistema de contatos
- Sistema de contas bancárias
- Documentação completa
- Isolamento por empresa
- Autenticação JWT

### Recursos
- Investidores com dados completos (PF e PJ)
- Projetos com controle financeiro
- Aportes de capital com rastreamento
- Múltiplos endereços, contatos e contas por investidor
- Validações robustas
- Auditoria automática (createdAt, updatedAt)

---

## Versões Futuras

### [1.5.0] - Planejado
- [ ] Calculadora automática de distribuições
- [ ] Templates de distribuição
- [ ] Agendamento de distribuições
- [ ] Notificações por email

### [2.0.0] - Planejado
- [ ] Dashboard visual com gráficos
- [ ] Relatórios em PDF
- [ ] Integração com pagamentos
- [ ] Exportação Excel/CSV
- [ ] Workflow de aprovação
- [ ] Compliance e KYC

---

## Notas de Migração

### v1.3.0 → v1.4.0
- Nenhuma mudança breaking
- Novo endpoint opcional: `POST /scp/distributions/bulk`
- Endpoints existentes continuam funcionando normalmente

### v1.2.0 → v1.3.0
- Nenhuma mudança breaking
- Novos endpoints opcionais para documentos de aportes
- Ajuste de permissões (mais permissivo, não quebra funcionalidades existentes)

---

## Como Usar Este Changelog

1. **Desenvolvedores**: Consultar antes de atualizar para nova versão
2. **QA**: Usar como checklist de testes
3. **Documentação**: Base para release notes
4. **Usuários**: Entender novas funcionalidades

---

## Formato das Versões

- **MAJOR** (X.0.0): Mudanças incompatíveis com versão anterior
- **MINOR** (0.X.0): Nova funcionalidade compatível com versão anterior
- **PATCH** (0.0.X): Correções de bugs compatíveis

---

## Contato

Para dúvidas ou sugestões sobre o módulo SCP, consulte a documentação completa em `docs/SCP_MODULE.md`.
