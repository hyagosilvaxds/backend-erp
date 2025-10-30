# 💰 Configurações Fiscais - Guia Completo

## 📋 Visão Geral

Este documento detalha todas as configurações fiscais necessárias para emissão de documentos fiscais eletrônicos no Brasil (NF-e, NFC-e, NFS-e).

## 🏛️ Códigos IBGE

### Estados (UF)

| UF | Código | Estado |
|----|--------|--------|
| AC | 12 | Acre |
| AL | 27 | Alagoas |
| AP | 16 | Amapá |
| AM | 13 | Amazonas |
| BA | 29 | Bahia |
| CE | 23 | Ceará |
| DF | 53 | Distrito Federal |
| ES | 32 | Espírito Santo |
| GO | 52 | Goiás |
| MA | 21 | Maranhão |
| MT | 51 | Mato Grosso |
| MS | 50 | Mato Grosso do Sul |
| MG | 31 | Minas Gerais |
| PA | 15 | Pará |
| PB | 25 | Paraíba |
| PR | 41 | Paraná |
| PE | 26 | Pernambuco |
| PI | 22 | Piauí |
| RJ | 33 | Rio de Janeiro |
| RN | 24 | Rio Grande do Norte |
| RS | 43 | Rio Grande do Sul |
| RO | 11 | Rondônia |
| RR | 14 | Roraima |
| SC | 42 | Santa Catarina |
| SP | 35 | São Paulo |
| SE | 28 | Sergipe |
| TO | 17 | Tocantins |

### Municípios Principais (SP)

| Município | Código IBGE |
|-----------|-------------|
| São Paulo | 3550308 |
| Campinas | 3509502 |
| Santos | 3548500 |
| São Bernardo do Campo | 3548708 |
| Guarulhos | 3518800 |
| Osasco | 3534401 |
| Ribeirão Preto | 3543402 |
| Sorocaba | 3552205 |

**Consulta completa:** [IBGE - Códigos de Municípios](https://www.ibge.gov.br/explica/codigos-dos-municipios.php)

## 📊 Tipos de Contribuinte

### Contribuinte ICMS
- Empresas que comercializam produtos
- Obrigadas a recolher ICMS
- Emitem NF-e e NFC-e

### Contribuinte ISS
- Empresas prestadoras de serviços
- Obrigadas a recolher ISS
- Emitem NFS-e

### Não Contribuinte
- Não recolhem ICMS nem ISS
- Geralmente MEIs ou profissionais liberais

### Isento
- Isentos de tributos específicos
- Podem ser isentos de ICMS ou ISS conforme legislação

## 💼 Regimes de Apuração

### Simples Nacional
- Para empresas com faturamento até R$ 4,8 milhões/ano
- Tributação simplificada e unificada
- Alíquotas progressivas por faixa de faturamento
- **CFOP comum:** 5102, 6102

### Lucro Presumido
- Para empresas com faturamento até R$ 78 milhões/ano
- Base de cálculo presumida sobre o faturamento
- Alíquotas específicas por atividade
- **CFOP comum:** 5102, 6102, 5405

### Lucro Real
- Obrigatório para grandes empresas
- Tributação sobre o lucro líquido contábil
- Exige contabilidade completa
- **CFOP comum:** 5102, 6102, 5405, 5403

### MEI (Microempreendedor Individual)
- Faturamento até R$ 81 mil/ano
- Tributação fixa mensal
- Dispensa de emissão de nota para consumidor final
- **CFOP comum:** 5102

## 🔢 CFOPs Mais Utilizados

### Operações Internas (Dentro do Estado)

| CFOP | Descrição |
|------|-----------|
| 5101 | Venda de produção do estabelecimento |
| 5102 | Venda de mercadoria adquirida ou recebida de terceiros |
| 5103 | Venda de produção do estabelecimento efetuada fora do estabelecimento |
| 5104 | Venda de mercadoria adquirida ou recebida de terceiros, efetuada fora do estabelecimento |
| 5405 | Venda de mercadoria adquirida ou recebida de terceiros em operação com mercadoria sujeita ao regime de substituição tributária, na condição de contribuinte substituto |
| 5403 | Venda de mercadoria adquirida ou recebida de terceiros em operação com mercadoria sujeita ao regime de substituição tributária, na condição de contribuinte substituído |

### Operações Interestaduais (Entre Estados)

| CFOP | Descrição |
|------|-----------|
| 6101 | Venda de produção do estabelecimento |
| 6102 | Venda de mercadoria adquirida ou recebida de terceiros |
| 6103 | Venda de produção do estabelecimento efetuada fora do estabelecimento |
| 6104 | Venda de mercadoria adquirida ou recebida de terceiros, efetuada fora do estabelecimento |
| 6405 | Venda de mercadoria adquirida ou recebida de terceiros em operação com mercadoria sujeita ao regime de substituição tributária, na condição de contribuinte substituto |

### Devolução e Retorno

| CFOP | Descrição |
|------|-----------|
| 5201 | Devolução de compra para industrialização ou produção rural (operação interna) |
| 5202 | Devolução de compra para comercialização (operação interna) |
| 6201 | Devolução de compra para industrialização ou produção rural (operação interestadual) |
| 6202 | Devolução de compra para comercialização (operação interestadual) |

## 📄 Tipos de Notas Fiscais

### NF-e (Nota Fiscal Eletrônica)
- **Uso:** Venda de produtos
- **Ambiente:** SEFAZ estadual
- **Série:** Numérica (ex: "1", "2")
- **Numeração:** Sequencial por série
- **Certificado:** A1 ou A3 obrigatório
- **Validade:** Após autorização pela SEFAZ

### NFC-e (Nota Fiscal de Consumidor Eletrônica)
- **Uso:** Venda direta ao consumidor (substitui cupom fiscal)
- **Ambiente:** SEFAZ estadual
- **Série:** Numérica (ex: "1")
- **Numeração:** Sequencial por série
- **Certificado:** A1 ou A3 obrigatório
- **Limite:** Geralmente até R$ 100 mil por nota

### NFS-e (Nota Fiscal de Serviços Eletrônica)
- **Uso:** Prestação de serviços
- **Ambiente:** Prefeitura municipal
- **Série:** Conforme prefeitura
- **Numeração:** Sequencial por série
- **Certificado:** Depende da prefeitura (algumas dispensam)

## 🔐 Certificado Digital

### Tipos de Certificado

#### A1
- **Formato:** Arquivo .pfx ou .p12
- **Armazenamento:** No computador/servidor
- **Validade:** 1 ano
- **Vantagens:** Mais barato, fácil de usar
- **Desvantagens:** Menos seguro, precisa renovar anualmente

#### A3
- **Formato:** Cartão ou token USB
- **Armazenamento:** Hardware específico
- **Validade:** 1 a 5 anos
- **Vantagens:** Mais seguro
- **Desvantagens:** Mais caro, requer hardware

### Obtenção do Certificado

1. **Escolher uma Autoridade Certificadora (AC)**
   - Serasa Experian
   - Certisign
   - Soluti (antiga Valid)
   - AR Soluti

2. **Tipo de Pessoa**
   - e-CNPJ (para empresas)
   - e-CPF (para pessoas físicas)

3. **Processo**
   - Compra online
   - Validação presencial ou videoconferência
   - Emissão do certificado

4. **Custos**
   - A1: R$ 150 a R$ 300
   - A3: R$ 200 a R$ 500

## 🌐 Ambientes Fiscais

### Homologação
- **Uso:** Testes e validações
- **Notas:** Sem validade jurídica
- **Acesso:** Liberado para testes
- **Importante:** Usar sempre antes de produção

### Produção
- **Uso:** Operação real
- **Notas:** Com validade jurídica
- **Acesso:** Após testes em homologação
- **Importante:** Erros geram custos e retrabalho

## 📊 Numeração de Notas

### Regras Gerais
- Numeração sequencial obrigatória
- Não pode haver números duplicados na mesma série
- Não pode haver saltos de numeração
- Inutilização de números requer autorização da SEFAZ

### Séries
- Empresas podem ter múltiplas séries
- Série "1" é a mais comum
- Uso de séries diferentes para:
  - Filiais diferentes
  - Tipos de operação diferentes
  - Separação por departamento

### Controle de Numeração
```typescript
// Exemplo de incremento seguro de numeração
async function getNextNumber(companyId: string, tipoNota: 'NFe' | 'NFCe' | 'NFSe') {
  const company = await prisma.company.findUnique({
    where: { id: companyId }
  });
  
  let nextNumber: number;
  let field: string;
  
  switch(tipoNota) {
    case 'NFe':
      nextNumber = company.ultimoNumeroNFe + 1;
      field = 'ultimoNumeroNFe';
      break;
    case 'NFCe':
      nextNumber = company.ultimoNumeroNFCe + 1;
      field = 'ultimoNumeroNFCe';
      break;
    case 'NFSe':
      nextNumber = company.ultimoNumeroNFSe + 1;
      field = 'ultimoNumeroNFSe';
      break;
  }
  
  // Atualizar atomicamente para evitar race conditions
  await prisma.company.update({
    where: { id: companyId },
    data: { [field]: nextNumber }
  });
  
  return nextNumber;
}
```

## 🔧 Configuração Inicial Recomendada

### Passo a Passo

1. **Cadastrar Empresa com Dados Básicos**
   - Razão Social, CNPJ, IE
   - Endereço completo
   - Contatos

2. **Configurar Regime Tributário**
   - Tipo de contribuinte
   - Regime de apuração
   - CFOP padrão

3. **Obter Códigos IBGE**
   - Município
   - Estado

4. **Adquirir Certificado Digital**
   - Escolher A1 ou A3
   - Contratar com AC
   - Armazenar com segurança

5. **Configurar Séries e Numeração**
   - Definir séries (geralmente "1")
   - Iniciar numeração em 1

6. **Testar em Homologação**
   - Configurar ambiente como "Homologacao"
   - Emitir notas de teste
   - Validar todas as operações

7. **Migrar para Produção**
   - Alterar ambiente para "Producao"
   - Emitir primeira nota real
   - Monitorar resultados

## 📚 Referências e Links Úteis

- [Portal NF-e](http://www.nfe.fazenda.gov.br/)
- [Manual de Integração NF-e](http://www.nfe.fazenda.gov.br/portal/listaConteudo.aspx?tipoConteudo=/fNJvKGW+oA=)
- [Tabela CFOP Completa](http://www.nfe.fazenda.gov.br/portal/listaConteudo.aspx?tipoConteudo=Iy/5Qol1YbE=)
- [IBGE Códigos de Municípios](https://www.ibge.gov.br/explica/codigos-dos-municipios.php)
- [Portal do Simples Nacional](http://www8.receita.fazenda.gov.br/simplesnacional/)

---

**Nota:** As informações fiscais estão sujeitas a mudanças conforme legislação. Sempre consulte um contador para orientações específicas.
