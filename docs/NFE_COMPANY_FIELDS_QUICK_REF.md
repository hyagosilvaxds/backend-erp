# Quick Reference: Campos da Empresa para NFe

## ✅ Campos Obrigatórios (13)

| # | Campo | Tipo | Validação | Onde Usar |
|---|-------|------|-----------|-----------|
| 1 | `razaoSocial` | String | 3-60 caracteres | Emitente NFe |
| 2 | `cnpj` | String | 14 dígitos + validação | Emitente NFe |
| 3 | `inscricaoEstadual` | String | Por UF ou "ISENTO" | Emitente NFe |
| 4 | `logradouro` | String | 3-60 caracteres | Endereço emitente |
| 5 | `numero` | String | 1-10 caracteres | Endereço emitente |
| 6 | `bairro` | String | 3-60 caracteres | Endereço emitente |
| 7 | `cidade` | String | 3-60 caracteres | Endereço emitente |
| 8 | `estado` | String | 2 caracteres (UF) | Endereço emitente |
| 9 | `cep` | String | 8 dígitos | Endereço emitente |
| 10 | `codigoMunicipioIBGE` | String | 7 dígitos | Código município |
| 11 | `regimeTributario` | String | Enum (3 opções) | Dados fiscais |
| 12 | `cnaePrincipal` | String | 7 dígitos | Atividade econômica |
| 13 | `serieNFe` | String | 1-999 | Série da nota |

## 🟡 Campos Obrigatórios para Produção (2)

| # | Campo | Validação | Observação |
|---|-------|-----------|------------|
| 14 | `certificadoDigitalPath` | Arquivo .pfx/.p12 | Apenas produção |
| 15 | `certificadoDigitalSenha` | String criptografada | Apenas produção |

## 🟠 Responsável Técnico - Obrigatório (4)

| # | Campo | Validação | Observação |
|---|-------|-----------|------------|
| 16 | `respTecCNPJ` | 14 dígitos + validação | Obrigatório desde 2024 |
| 17 | `respTecContato` | 3-60 caracteres | Nome do contato |
| 18 | `respTecEmail` | Email válido | Contato técnico |
| 19 | `respTecFone` | 10-11 dígitos | Telefone técnico |

## 📊 Total: 19 campos obrigatórios

---

## 🎯 Validação Rápida

```typescript
// Mínimo para emitir NFe em HOMOLOGAÇÃO
const canEmitNFeHomologacao = (company: Company): boolean => {
  return !!(
    company.razaoSocial &&
    company.cnpj &&
    company.inscricaoEstadual &&
    company.logradouro &&
    company.numero &&
    company.bairro &&
    company.cidade &&
    company.estado &&
    company.cep &&
    company.codigoMunicipioIBGE &&
    company.regimeTributario &&
    company.cnaePrincipal &&
    company.serieNFe &&
    company.respTecCNPJ &&
    company.respTecContato &&
    company.respTecEmail &&
    company.respTecFone &&
    company.ambienteFiscal === 'HOMOLOGACAO'
  );
};

// Para emitir NFe em PRODUÇÃO (adiciona certificado)
const canEmitNFeProducao = (company: Company): boolean => {
  return canEmitNFeHomologacao(company) &&
    company.ambienteFiscal === 'PRODUCAO' &&
    !!company.certificadoDigitalPath &&
    !!company.certificadoDigitalSenha;
};
```

---

## 🔴 Erros Mais Comuns

1. **CNPJ inválido** → Validar dígitos verificadores
2. **Código IBGE errado** → Buscar na API do IBGE
3. **IE inválida** → Validação varia por UF
4. **Certificado expirado** → Verificar validade
5. **Responsável Técnico faltando** → Obrigatório desde 2024
6. **CEP sem hífen** → Remover máscara antes de enviar

---

## 🚀 APIs Auxiliares

```typescript
// CEP → Endereço
const buscarCEP = async (cep: string) => {
  const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
  return response.json();
};

// Cidade + UF → Código IBGE
const buscarCodigoIBGE = async (cidade: string, uf: string) => {
  const response = await fetch(
    `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`
  );
  const municipios = await response.json();
  return municipios.find((m: any) => 
    m.nome.toLowerCase() === cidade.toLowerCase()
  )?.id;
};
```

---

## 📋 Payload de Exemplo

```json
{
  "razaoSocial": "EMPRESA EXEMPLO LTDA",
  "cnpj": "12345678000195",
  "inscricaoEstadual": "123456789",
  "logradouro": "Avenida Paulista",
  "numero": "1000",
  "bairro": "Bela Vista",
  "cidade": "São Paulo",
  "estado": "SP",
  "cep": "01310100",
  "codigoMunicipioIBGE": "3550308",
  "regimeTributario": "SIMPLES_NACIONAL",
  "cnaePrincipal": "4712100",
  "serieNFe": "1",
  "ambienteFiscal": "HOMOLOGACAO",
  "respTecCNPJ": "12345678000195",
  "respTecContato": "João Silva",
  "respTecEmail": "joao@software.com",
  "respTecFone": "11987654321"
}
```

---

## 🎨 Indicador Visual Sugerido

```tsx
function NFeStatusBadge({ company }: { company: Company }) {
  const canEmit = validateCompanyForNFe(company);
  
  if (canEmit.canEmitNFe) {
    return (
      <span className="badge badge-success">
        ✅ Pronto para NFe
      </span>
    );
  }
  
  return (
    <span className="badge badge-error">
      ❌ {canEmit.errors.length} pendências
    </span>
  );
}
```

---

## 📄 Documentação Completa

Ver documento detalhado: `NFE_COMPANY_FIELDS_FRONTEND.md`
