# 📝 Atualização: Uso de Dados Reais da Empresa na Emissão de NF-e

## Resumo das Alterações

Todos os dados cadastrados na empresa agora são utilizados corretamente na emissão de NF-e, conforme especificações da biblioteca node-sped-nfe.

---

## 1. Inicialização do Tools (NFeSefazService)

### Antes
```typescript
const tools = new Tools({
  mod: '55',
  UF: company.estado || 'SP',
  tpAmb: company.nfeAmbiente === '1' ? 1 : 2,
  versao: '4.00',
  timeout: 30,
}, {
  pfx: certificatePath,
  senha: senhaDescriptografada,
});
```

### Agora ✅
```typescript
const tools = new Tools(
  {
    mod: '55',              // Sempre 55 (NF-e)
    xmllint: '',
    UF: ufEmpresa,          // UF cadastrada na empresa (ex: 'SP')
    tpAmb: tpAmb,           // 1=Produção, 2=Homologação (cadastrado na empresa)
    CSC: '',
    CSCid: '',
    versao: '4.00',         // Sempre 4.00
    timeout: 30,            // Sempre 30 segundos
    openssl: null,
    CPF: '',
    CNPJ: company.cnpj || '',
  },
  {
    pfx: certificatePath,        // Caminho do certificado A1 cadastrado
    senha: senhaDescriptografada // Senha descriptografada do banco
  }
);
```

**Mudanças**:
- ✅ Mod sempre "55"
- ✅ Versão sempre "4.00"
- ✅ Timeout sempre 30
- ✅ UF vem do cadastro da empresa
- ✅ tpAmb vem do cadastro da empresa (1 ou 2)
- ✅ Senha do certificado descriptografada do banco

---

## 2. Tag IDE - Identificação da NF-e (NFeGeneratorService)

### Antes
```typescript
NFe.tagIde({
  cUF: this.obterCodigoUF(company.estado),
  cNF: cNF,
  natOp: dto.naturezaOperacao || 'VENDA',
  mod: dto.modelo || '55',
  serie: dto.serie || company.serieNFe || '1',
  nNF: numeroNFe.toString(),
  dhEmi: NFe.formatData(),
  tpNF: dto.tipoOperacao || '1',
  idDest: this.determinarDestinoOperacao(company.estado, sale.customer),
  cMunFG: company.codigoMunicipioIBGE || '...',
  tpImp: '1',
  tpEmis: '1',
  cDV: '1',
  tpAmb: tpAmb,
  finNFe: '1',
  indFinal: dto.consumidorFinal || '0',
  indPres: dto.presencaComprador || '1',
  indIntermed: '0',
  procEmi: '0',
  verProc: '1.0.0',
});
```

### Agora ✅
```typescript
NFe.tagIde({
  cUF: codigoUF,                         // Código IBGE da UF da empresa
  cNF: cNF,                              // Código numérico aleatório (8 dígitos)
  natOp: 'VENDA',                        // Sempre "VENDA"
  mod: '55',                             // Sempre "55" (NF-e)
  serie: serie,                          // Série cadastrada na empresa
  nNF: numeroNFe.toString(),             // Número sequencial por série
  dhEmi: NFe.formatData(),               // Data/hora atual
  tpNF: '1',                             // Sempre "1" (Saída)
  idDest: idDest,                        // 1=Interna, 2=Interestadual, 3=Exterior
  cMunFG: company.codigoMunicipioIBGE,   // Código IBGE do município da empresa
  tpImp: '1',                            // Sempre "1" (Retrato)
  tpEmis: '1',                           // Sempre "1" (Normal)
  cDV: '1',                              // Calculado pela biblioteca
  tpAmb: tpAmb,                          // 1=Produção, 2=Homologação
  finNFe: dto.finalidade || '1',         // 1=Normal (permitir escolha usuário)
  indFinal: '0',                         // Sempre "0" (Não é consumidor final)
  indPres: '1',                          // Sempre "1" (Operação presencial)
  indIntermed: '0',                      // Sempre "0" (Sem intermediador)
  procEmi: '0',                          // Sempre "0" (Aplicativo contribuinte)
  verProc: '4.13',                       // Versão do aplicativo
});
```

**Mudanças**:
- ✅ `cUF`: Código IBGE da UF cadastrada na empresa (ex: 35 para SP)
- ✅ `natOp`: Sempre "VENDA" (removido opção de customizar)
- ✅ `mod`: Sempre "55" (removido opção de customizar)
- ✅ `serie`: Usa `serieNFe` cadastrada na empresa
- ✅ `nNF`: Número calculado automaticamente (incrementa por série)
- ✅ `tpNF`: Sempre "1" (Saída)
- ✅ `idDest`: Calculado automaticamente (1, 2 ou 3)
- ✅ `cMunFG`: Código IBGE do município cadastrado na empresa
- ✅ `tpAmb`: Usa `nfeAmbiente` cadastrado na empresa
- ✅ `finNFe`: Permite escolha do usuário (1=Normal, 2=Complementar, 3=Ajuste, 4=Devolução)
- ✅ `indFinal`: Sempre "0"
- ✅ `indPres`: Sempre "1"
- ✅ `verProc`: Atualizado para "4.13"

---

## 3. Determinação do Destino da Operação

### Novo Algoritmo ✅
```typescript
private determinarDestinoOperacao(ufEmitente: string, customer: any): string {
  // Buscar endereço do cliente (priorizar BILLING > MAIN > primeiro)
  const enderecoCliente = 
    customer.addresses.find(a => a.type === 'BILLING') ||
    customer.addresses.find(a => a.type === 'MAIN') || 
    customer.addresses[0];
  
  if (!enderecoCliente) {
    return '1'; // Default: Interna
  }

  // Verificar se é operação com exterior
  if (enderecoCliente.country && 
      enderecoCliente.country !== 'Brasil' && 
      enderecoCliente.country !== 'BR') {
    return '3'; // Exterior
  }
  
  // Verificar se é operação interna ou interestadual
  const ufCliente = enderecoCliente.state || '';
  const ufEmpresa = ufEmitente || 'SP';
  
  if (ufCliente.toUpperCase() === ufEmpresa.toUpperCase()) {
    return '1'; // Interna (mesmo estado)
  } else {
    return '2'; // Interestadual (estados diferentes)
  }
}
```

**Lógica**:
- ✅ Prioriza endereço tipo `BILLING` (cobrança)
- ✅ Se não tiver, usa `MAIN` (principal)
- ✅ Se não tiver, usa o primeiro endereço
- ✅ Verifica se é operação internacional (país != Brasil)
- ✅ Compara UF da empresa com UF do cliente
- ✅ Retorna:
  - `1`: Operação Interna (mesmo estado)
  - `2`: Operação Interestadual (estados diferentes)
  - `3`: Operação com Exterior (país diferente)

---

## 4. Novo Campo no DTO: finalidade

### EmitirNFeDto
```typescript
@IsOptional()
@IsEnum(['1', '2', '3', '4'])
finalidade?: string; // 1=Normal, 2=Complementar, 3=Ajuste, 4=Devolução
```

**Permite ao usuário escolher**:
- `1`: NF-e Normal (padrão)
- `2`: NF-e Complementar
- `3`: NF-e de Ajuste
- `4`: NF-e de Devolução

---

## 5. Dados da Empresa Necessários

### Campos Usados na Emissão

```typescript
interface CompanyFiscalData {
  // Identificação
  razaoSocial: string;           // Nome empresarial
  nomeFantasia: string;          // Nome fantasia
  cnpj: string;                  // CNPJ (14 dígitos)
  inscricaoEstadual: string;     // Inscrição Estadual
  regimeTributario: string;      // Ex: "SIMPLES NACIONAL"
  
  // Endereço
  logradouro: string;            // Rua, Avenida, etc
  numero: string;                // Número
  complemento: string;           // Complemento (opcional)
  bairro: string;                // Bairro
  cidade: string;                // Nome da cidade
  estado: string;                // Sigla UF (ex: "SP")
  cep: string;                   // CEP (8 dígitos)
  codigoMunicipioIBGE: string;   // Código IBGE (7 dígitos)
  
  // Contatos
  telefone: string;              // Telefone fixo
  celular: string;               // Celular
  email: string;                 // E-mail
  
  // Configurações NF-e
  nfeAmbiente: string;           // "1" = Produção, "2" = Homologação
  serieNFe: string;              // Série da NF-e (ex: "1")
  proximoNumeroNFe: number;      // Próximo número sequencial
  
  // Certificado Digital
  certificadoDigitalPath: string;     // Caminho do arquivo .pfx
  certificadoDigitalSenha: string;    // Senha criptografada
  certificadoDigitalValidoAte: Date;  // Data de validade
  
  // Responsável Técnico (opcional)
  respTecCNPJ: string;           // CNPJ do responsável técnico
  respTecContato: string;        // Nome do contato
  respTecEmail: string;          // E-mail do responsável
  respTecFone: string;           // Telefone do responsável
}
```

---

## 6. Fluxo de Uso dos Dados

```
┌─────────────────────────────────────────────────────────────┐
│                   EMISSÃO DE NF-e                            │
└─────────────────────────────────────────────────────────────┘

1. BUSCAR VENDA
   └─ Inclui: company, customer, items.product

2. OBTER PRÓXIMO NÚMERO
   └─ Busca última NF-e da série
   └─ Incrementa +1

3. GERAR CÓDIGO NUMÉRICO (cNF)
   └─ 8 dígitos aleatórios

4. PREENCHER TAG IDE
   ├─ cUF ← company.estado → obterCodigoUF()
   ├─ natOp ← "VENDA" (fixo)
   ├─ mod ← "55" (fixo)
   ├─ serie ← company.serieNFe
   ├─ nNF ← numeroCalculado
   ├─ tpNF ← "1" (fixo - Saída)
   ├─ idDest ← determinarDestinoOperacao()
   │   ├─ Compara company.estado com customer.address.state
   │   └─ Retorna: 1=Interna, 2=Interestadual, 3=Exterior
   ├─ cMunFG ← company.codigoMunicipioIBGE
   ├─ tpAmb ← company.nfeAmbiente
   ├─ finNFe ← dto.finalidade || "1"
   ├─ indFinal ← "0" (fixo)
   ├─ indPres ← "1" (fixo)
   └─ verProc ← "4.13" (fixo)

5. INICIALIZAR TOOLS
   ├─ mod ← "55" (fixo)
   ├─ UF ← company.estado
   ├─ tpAmb ← company.nfeAmbiente
   ├─ versao ← "4.00" (fixo)
   ├─ timeout ← 30 (fixo)
   ├─ CNPJ ← company.cnpj
   ├─ pfx ← company.certificadoDigitalPath
   └─ senha ← descriptografar(company.certificadoDigitalSenha)

6. GERAR, ASSINAR E ENVIAR
```

---

## 7. Exemplos de Uso

### Request Body Mínimo
```json
POST /fiscal/nfe/emitir

{
  "saleId": "uuid-da-venda",
  "enviarSefaz": true
}
```

Todos os dados vêm da empresa cadastrada!

### Request Body Completo (com opcionais)
```json
POST /fiscal/nfe/emitir

{
  "saleId": "uuid-da-venda",
  "enviarSefaz": true,
  "finalidade": "1"  // 1=Normal, 2=Complementar, 3=Ajuste, 4=Devolução
}
```

---

## 8. Validações Automáticas

### Antes de Emitir
```typescript
// Validar empresa
✅ company.inscricaoEstadual - obrigatório
✅ company.logradouro - obrigatório
✅ company.cidade - obrigatório
✅ company.estado - obrigatório
✅ company.codigoMunicipioIBGE - obrigatório
✅ company.certificadoDigitalPath - obrigatório
✅ company.certificadoDigitalSenha - obrigatório

// Validar cliente
✅ customer.cnpj ou customer.cpf - obrigatório
✅ customer.addresses - ao menos 1 endereço
✅ endereço com IBGE code - obrigatório

// Validar produtos
✅ product.ncm - obrigatório (8 dígitos)
✅ product.cfopEstadual ou cfopInterestadual - obrigatório
✅ product.unit - obrigatório
```

---

## 9. Campos Fixos (Não Customizáveis)

| Campo | Valor | Descrição |
|-------|-------|-----------|
| `mod` | `"55"` | Modelo de documento (sempre NF-e) |
| `natOp` | `"VENDA"` | Natureza da operação |
| `tpNF` | `"1"` | Tipo de nota fiscal (sempre Saída) |
| `tpImp` | `"1"` | Tipo de impressão (sempre Retrato) |
| `tpEmis` | `"1"` | Tipo de emissão (sempre Normal) |
| `indFinal` | `"0"` | Indicador de consumidor final |
| `indPres` | `"1"` | Indicador de presença (sempre Presencial) |
| `indIntermed` | `"0"` | Indicador de intermediador |
| `procEmi` | `"0"` | Processo de emissão (Aplicativo contribuinte) |
| `verProc` | `"4.13"` | Versão do aplicativo emissor |
| `versao` | `"4.00"` | Versão do layout da NF-e |
| `timeout` | `30` | Timeout de comunicação (segundos) |

---

## 10. Campos Calculados Automaticamente

| Campo | Origem | Lógica |
|-------|--------|--------|
| `cUF` | `company.estado` | Convertido para código IBGE |
| `cNF` | Gerado | 8 dígitos aleatórios |
| `serie` | `company.serieNFe` | Usa cadastro da empresa |
| `nNF` | Calculado | Última NF-e + 1 (por série) |
| `idDest` | `customer.address` | Compara UF empresa vs cliente |
| `cMunFG` | `company.codigoMunicipioIBGE` | Código IBGE do município |
| `tpAmb` | `company.nfeAmbiente` | 1=Produção, 2=Homologação |
| `dhEmi` | Data/hora atual | Momento da emissão |
| `cDV` | Calculado | Biblioteca calcula automaticamente |

---

## 11. Campos Opcionais (Escolha do Usuário)

| Campo | Valores | Descrição | Padrão |
|-------|---------|-----------|--------|
| `finalidade` | 1, 2, 3, 4 | 1=Normal, 2=Complementar, 3=Ajuste, 4=Devolução | `"1"` |
| `enviarSefaz` | true, false | Se deve enviar para SEFAZ ou apenas gerar XML | `true` |

---

## 12. Checklist de Configuração

### Empresa
- [ ] `razaoSocial` preenchida
- [ ] `cnpj` válido (14 dígitos)
- [ ] `inscricaoEstadual` preenchida
- [ ] `regimeTributario` escolhido
- [ ] `estado` preenchido (ex: SP)
- [ ] `codigoMunicipioIBGE` preenchido (7 dígitos)
- [ ] `nfeAmbiente` escolhido ("1" ou "2")
- [ ] `serieNFe` definida (ex: "1")
- [ ] `proximoNumeroNFe` definido (começa em 1)
- [ ] Certificado A1 (.pfx) enviado
- [ ] Senha do certificado salva e criptografada

### Validar
```bash
GET /companies/{id}

# Verificar response:
{
  "hasCertificate": true,
  "nfeAmbiente": "2",
  "serieNFe": "1",
  "estado": "SP",
  "codigoMunicipioIBGE": "3550308"
}
```

---

## 13. Troubleshooting

### Erro: "UF não cadastrada"
```
Solução: Preencher campo company.estado
```

### Erro: "Código município inválido"
```
Solução: Preencher company.codigoMunicipioIBGE
Consulta: https://www.ibge.gov.br/explica/codigos-dos-municipios.php
```

### Erro: "Série não cadastrada"
```
Solução: Preencher company.serieNFe (geralmente "1")
```

### Erro: "Ambiente não configurado"
```
Solução: Definir company.nfeAmbiente
- "1" para Produção
- "2" para Homologação (recomendado para testes)
```

---

## 14. Resumo Final

### O que mudou ✅
1. **Mod, versão e timeout**: Sempre fixos ("55", "4.00", 30)
2. **natOp**: Sempre "VENDA"
3. **tpNF**: Sempre "1" (Saída)
4. **indFinal, indPres, indIntermed, procEmi**: Sempre fixos
5. **UF e tpAmb**: Vêm do cadastro da empresa
6. **Serie e número**: Calculados automaticamente
7. **idDest**: Calculado comparando UF empresa vs cliente
8. **verProc**: Atualizado para "4.13"
9. **Senha certificado**: Descriptografada automaticamente

### O que o usuário pode customizar
- ✅ `finalidade`: 1=Normal, 2=Complementar, 3=Ajuste, 4=Devolução
- ✅ `enviarSefaz`: true=Envia SEFAZ, false=Apenas gera XML

### Tudo mais é automático! 🎉

---

**Data**: 16/11/2025  
**Versão**: 2.0.0  
**Compatível com**: node-sped-nfe v1.2.45
