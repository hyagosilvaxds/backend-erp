# ❓ FAQ - Perguntas Frequentes sobre NF-e

## 📋 Índice

1. [Geral](#geral)
2. [Emissão de NF-e](#emissão-de-nf-e)
3. [Erros Comuns](#erros-comuns)
4. [DANFE e XML](#danfe-e-xml)
5. [Cancelamento](#cancelamento)
6. [Integração](#integração)
7. [SEFAZ](#sefaz)
8. [Certificado Digital](#certificado-digital)

---

## 🌐 Geral

### **P: Onde está a documentação completa?**
**R:** Comece pelo [NFE_DOCUMENTATION_INDEX.md](./NFE_DOCUMENTATION_INDEX.md) que lista todos os documentos.

### **P: Qual documentação devo ler primeiro?**
**R:** Depende do seu perfil:
- **Frontend:** [API_NFE_QUICK_REFERENCE.md](./API_NFE_QUICK_REFERENCE.md)
- **Backend:** [NFE_SEFAZ_FLOW_COMPLETE.md](./NFE_SEFAZ_FLOW_COMPLETE.md)
- **QA:** [API_NFE_COMPLETE.md](./API_NFE_COMPLETE.md)

### **P: Quantos endpoints a API tem?**
**R:** 8 endpoints:
1. POST `/fiscal/nfe/emitir` - Emitir
2. GET `/fiscal/nfe` - Listar
3. GET `/fiscal/nfe/:id` - Buscar
4. GET `/fiscal/nfe/:id/danfe` - DANFE
5. GET `/fiscal/nfe/:id/xml` - XML
6. GET `/fiscal/nfe/consultar/:chave` - Consultar SEFAZ
7. POST `/fiscal/nfe/:id/cancelar` - Cancelar
8. GET `/fiscal/nfe/sefaz/status` - Status SEFAZ

---

## 📤 Emissão de NF-e

### **P: Como emitir uma NF-e?**
**R:** Faça um POST para `/fiscal/nfe/emitir`:
```json
{
  "saleId": "uuid-da-venda",
  "enviarSefaz": true
}
```
Veja exemplos completos em [API_NFE_COMPLETE.md](./API_NFE_COMPLETE.md#1-emissão-de-nf-e).

### **P: Quanto tempo demora para emitir uma NF-e?**
**R:** Com transmissão síncrona (`indSinc: 1`), geralmente 2-5 segundos. A SEFAZ processa e retorna o resultado imediatamente.

### **P: Posso emitir várias NF-e ao mesmo tempo?**
**R:** Sim, mas recomendamos processar uma por vez para evitar problemas de numeração e duplicidade.

### **P: O que significa "enviarSefaz: false"?**
**R:** Quando `false`, apenas gera e assina o XML sem enviar para SEFAZ. Útil para:
- Testar geração de XML
- Contingência offline
- Validar dados antes de enviar

### **P: Como funciona a numeração da NF-e?**
**R:** A numeração é sequencial por série. O sistema busca o último número usado e incrementa automaticamente. Você pode forçar um número específico passando `numero` no body.

### **P: Posso emitir NF-e em homologação?**
**R:** Sim! Configure o campo `ambienteNFe` da empresa:
- `1` = Produção
- `2` = Homologação

---

## ⚠️ Erros Comuns

### **P: Erro "Venda não encontrada"**
**R:** Verifique se:
- O `saleId` está correto
- A venda pertence à empresa do token
- A venda existe no banco de dados

### **P: Erro "Certificado inválido ou expirado"**
**R:** 
1. Verifique a validade do certificado A1
2. Confirme que a senha está correta
3. Re-upload do certificado se necessário
4. Veja [CERTIFICATE_A1_UPLOAD.md](./CERTIFICATE_A1_UPLOAD.md)

### **P: Erro "Duplicidade de NF-e" (cStat 539)**
**R:** Significa que uma NF-e com a mesma chave já foi autorizada. Possíveis causas:
- Tentando emitir novamente uma NF-e já autorizada
- Número/série duplicados
- Verificar se a venda já tem NF-e emitida

**Solução:**
```javascript
// Verificar se já existe NF-e para a venda
const nfes = await fetch(`${API_URL}/fiscal/nfe?saleId=${saleId}`);
if (nfes.length > 0) {
  console.log('NF-e já emitida:', nfes[0].chaveAcesso);
}
```

### **P: Erro "Destinatário não habilitado" (cStat 233)**
**R:** O cliente não está apto a receber NF-e. Verificar:
- Inscrição Estadual correta
- Situação cadastral ativa
- Estado correto

### **P: Erro 401 Unauthorized**
**R:** Token JWT inválido ou expirado. Fazer login novamente:
```javascript
const response = await fetch(`${API_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const { access_token } = await response.json();
```

### **P: Erro 404 ao baixar DANFE/XML**
**R:** Possíveis causas:
1. NF-e não foi autorizada (status !== 'AUTHORIZED')
2. Arquivo foi deletado do servidor
3. Caminho incorreto no banco

**Solução:**
```javascript
// Verificar status da NF-e
const nfe = await fetch(`${API_URL}/fiscal/nfe/${nfeId}`);
if (nfe.status !== 'AUTHORIZED') {
  console.error('NF-e não autorizada');
}
```

---

## 📄 DANFE e XML

### **P: Qual a diferença entre XML assinado e XML de processamento?**
**R:**
- **XML Assinado (nfe_sign.xml):** XML com assinatura digital, usado para enviar à SEFAZ
- **XML de Processamento (nfe_proc.xml):** XML assinado + protocolo de autorização, usado para DANFE e armazenamento

**Importante:** Sempre use `nfe_proc.xml` para gerar DANFE e enviar ao cliente!

### **P: Como baixar o DANFE?**
**R:** GET para `/fiscal/nfe/:id/danfe`:
```javascript
const response = await fetch(`${API_URL}/fiscal/nfe/${nfeId}/danfe`, {
  headers: { 'Authorization': `Bearer ${token}` }
});

const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `danfe-${nfeId}.pdf`;
a.click();
```

### **P: Como abrir o DANFE em nova aba?**
**R:**
```javascript
const url = `${API_URL}/fiscal/nfe/${nfeId}/danfe`;
window.open(url, '_blank');
```

### **P: O DANFE pode ser reimprimir?**
**R:** Sim! Você pode baixar/imprimir o DANFE quantas vezes quiser. GET `/fiscal/nfe/:id/danfe` sempre retorna o mesmo PDF.

### **P: Como baixar o XML?**
**R:** GET para `/fiscal/nfe/:id/xml`:
```javascript
const response = await fetch(`${API_URL}/fiscal/nfe/${nfeId}/xml`, {
  headers: { 'Authorization': `Bearer ${token}` }
});

const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `nfe-${nfeId}.xml`;
a.click();
```

### **P: Posso enviar o DANFE por e-mail?**
**R:** Sim! Baixe o DANFE e anexe no e-mail ou implemente um endpoint de envio automático.

---

## ❌ Cancelamento

### **P: Como cancelar uma NF-e?**
**R:** POST para `/fiscal/nfe/:id/cancelar`:
```json
{
  "justificativa": "Motivo do cancelamento com mínimo 15 caracteres"
}
```

### **P: Qual o prazo para cancelar?**
**R:** **24 horas** após a emissão. Após esse prazo, é necessário fazer uma **nota de devolução**.

### **P: Qual o tamanho mínimo da justificativa?**
**R:** **15 caracteres**. É uma exigência da SEFAZ.

### **P: Posso cancelar uma NF-e rejeitada?**
**R:** Não. Apenas NF-e com status `AUTHORIZED` podem ser canceladas.

### **P: O que acontece após o cancelamento?**
**R:** 
1. Status muda para `CANCELED`
2. Um evento de cancelamento é registrado na SEFAZ
3. A NF-e fica marcada como cancelada no sistema
4. Não é possível reverter o cancelamento

### **P: Como verificar se passou 24 horas?**
**R:**
```javascript
const dataEmissao = new Date(nfe.dataEmissao);
const agora = new Date();
const diferencaHoras = (agora - dataEmissao) / (1000 * 60 * 60);

if (diferencaHoras > 24) {
  console.log('Prazo de cancelamento expirado');
}
```

---

## 🔌 Integração

### **P: Como integrar com meu frontend?**
**R:** Veja exemplos completos em [API_NFE_EXEMPLOS_PRATICOS.md](./API_NFE_EXEMPLOS_PRATICOS.md). Temos exemplos para:
- Sistema de vendas
- Dashboard
- Portal do cliente
- Relatórios

### **P: Vocês têm Postman Collection?**
**R:** Sim! Veja em [API_NFE_QUICK_REFERENCE.md](./API_NFE_QUICK_REFERENCE.md#postman-collection).

### **P: Como fazer paginação na listagem?**
**R:** Atualmente a API retorna todos os resultados. Use filtros para limitar:
```javascript
// Listar NF-e do mês atual
const dataInicio = '2024-11-01';
const dataFim = '2024-11-30';

const response = await fetch(
  `${API_URL}/fiscal/nfe?dataInicio=${dataInicio}&dataFim=${dataFim}`,
  { headers: { 'Authorization': `Bearer ${token}` }}
);
```

### **P: Como fazer busca por cliente?**
**R:** Liste todas e filtre no frontend:
```javascript
const response = await fetch(`${API_URL}/fiscal/nfe`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
const nfes = await response.json();

// Filtrar por cliente
const nfesDoCliente = nfes.filter(nfe => 
  nfe.destinatarioNome.toLowerCase().includes(busca.toLowerCase())
);
```

### **P: Como listar apenas autorizadas?**
**R:**
```javascript
const response = await fetch(`${API_URL}/fiscal/nfe?status=AUTHORIZED`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

## 🌐 SEFAZ

### **P: O que é transmissão síncrona?**
**R:** Com `indSinc: 1`, a API aguarda o processamento da SEFAZ e retorna o resultado imediatamente (autorizada ou rejeitada). Demora 2-5 segundos mas simplifica muito a implementação.

### **P: Como verificar se a SEFAZ está online?**
**R:** GET `/fiscal/nfe/sefaz/status`:
```javascript
const response = await fetch(`${API_URL}/fiscal/nfe/sefaz/status`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
const status = await response.json();

if (status.cStat === '107') {
  console.log('✅ SEFAZ Online');
} else {
  console.log('⚠️ SEFAZ:', status.xMotivo);
}
```

### **P: O que fazer se a SEFAZ estiver offline?**
**R:** 
1. Verificar status com endpoint `/sefaz/status`
2. Informar usuário
3. Tentar novamente mais tarde
4. Em último caso, usar contingência (não implementado)

### **P: Como consultar uma NF-e na SEFAZ?**
**R:** GET `/fiscal/nfe/consultar/:chaveAcesso`:
```javascript
const chave = '35240112345678901234550010000000011234567890';

const response = await fetch(
  `${API_URL}/fiscal/nfe/consultar/${chave}`,
  { headers: { 'Authorization': `Bearer ${token}` }}
);

const resultado = await response.json();

if (resultado.cStat === '100') {
  console.log('✅ NF-e autorizada');
} else if (resultado.cStat === '101') {
  console.log('❌ NF-e cancelada');
}
```

### **P: Quais são os principais códigos de status?**
**R:**
- `100` = ✅ Autorizado
- `101` = ❌ Cancelado
- `107` = ✅ SEFAZ Online
- `135` = ✅ Evento registrado (cancelamento)
- `204` / `539` = ❌ Duplicidade
- `217` = ⚠️ NF-e não encontrada
- `233` = ❌ Destinatário não habilitado

**Lista completa:** [API_NFE_COMPLETE.md](./API_NFE_COMPLETE.md#códigos-de-status)

---

## 🔐 Certificado Digital

### **P: Preciso de certificado A1 ou A3?**
**R:** **A1** (arquivo .pfx). O sistema não suporta A3 (token/cartão).

### **P: Como fazer upload do certificado?**
**R:** Veja documentação completa em [CERTIFICATE_A1_UPLOAD.md](./CERTIFICATE_A1_UPLOAD.md).

### **P: O certificado fica salvo onde?**
**R:** No banco de dados, na tabela `companies`:
- `certificateA1Buffer` - Buffer do arquivo .pfx
- `certificatePassword` - Senha (criptografada)

### **P: Meu certificado expirou, o que fazer?**
**R:**
1. Comprar novo certificado A1
2. Fazer upload do novo certificado
3. Informar nova senha
4. Sistema passa a usar o novo automaticamente

### **P: Posso ter certificados diferentes por empresa?**
**R:** Sim! Cada empresa tem seu próprio certificado no banco.

---

## 💡 Dicas e Boas Práticas

### **P: Como implementar retry em caso de erro?**
**R:**
```javascript
async function emitirComRetry(saleId, maxTentativas = 3) {
  for (let i = 0; i < maxTentativas; i++) {
    try {
      const response = await fetch(`${API_URL}/fiscal/nfe/emitir`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ saleId, enviarSefaz: true })
      });
      
      const nfe = await response.json();
      
      if (nfe.status === 'AUTORIZADA') {
        return nfe;
      }
      
      // Se rejeitada, não tentar novamente
      if (nfe.status === 'REJEITADA') {
        throw new Error(nfe.motivoRejeicao);
      }
      
    } catch (error) {
      if (i === maxTentativas - 1) throw error;
      
      // Aguardar 2 segundos antes de tentar novamente
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}
```

### **P: Como exibir loading durante emissão?**
**R:**
```jsx
function EmitirNFe({ saleId }) {
  const [loading, setLoading] = useState(false);
  const [progresso, setProgresso] = useState('');
  
  const emitir = async () => {
    setLoading(true);
    
    try {
      setProgresso('Gerando XML...');
      await new Promise(r => setTimeout(r, 500));
      
      setProgresso('Assinando digitalmente...');
      await new Promise(r => setTimeout(r, 500));
      
      setProgresso('Enviando para SEFAZ...');
      const response = await fetch(`${API_URL}/fiscal/nfe/emitir`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ saleId, enviarSefaz: true })
      });
      
      setProgresso('Aguardando autorização...');
      const nfe = await response.json();
      
      if (nfe.status === 'AUTORIZADA') {
        setProgresso('✅ NF-e autorizada!');
        alert(`NF-e ${nfe.chaveAcesso} emitida com sucesso!`);
      }
      
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <button onClick={emitir} disabled={loading}>
        {loading ? progresso : 'Emitir NF-e'}
      </button>
    </div>
  );
}
```

### **P: Como validar campos antes de emitir?**
**R:**
```javascript
function validarVendaParaNFe(sale) {
  const erros = [];
  
  // Validar venda
  if (!sale || !sale.id) {
    erros.push('Venda não encontrada');
  }
  
  if (sale.totalAmount <= 0) {
    erros.push('Valor total inválido');
  }
  
  // Validar cliente
  if (!sale.customer) {
    erros.push('Cliente não encontrado');
  }
  
  if (!sale.customer.cnpj && !sale.customer.cpf) {
    erros.push('Cliente sem CPF/CNPJ');
  }
  
  // Validar endereço
  const addresses = sale.customer.addresses || [];
  if (addresses.length === 0) {
    erros.push('Cliente sem endereço cadastrado');
  }
  
  // Validar produtos
  if (!sale.items || sale.items.length === 0) {
    erros.push('Venda sem itens');
  }
  
  sale.items.forEach((item, index) => {
    if (!item.product.ncm) {
      erros.push(`Produto ${index + 1} sem NCM`);
    }
    if (!item.product.cfop) {
      erros.push(`Produto ${index + 1} sem CFOP`);
    }
  });
  
  return erros;
}

// Uso
const erros = validarVendaParaNFe(sale);
if (erros.length > 0) {
  alert(`Erros encontrados:\n${erros.join('\n')}`);
  return;
}

// Emitir NF-e
await emitirNFe(sale.id);
```

---

## 📚 Links Úteis

- [Documentação Completa](./API_NFE_COMPLETE.md)
- [Referência Rápida](./API_NFE_QUICK_REFERENCE.md)
- [Exemplos Práticos](./API_NFE_EXEMPLOS_PRATICOS.md)
- [Fluxo SEFAZ](./NFE_SEFAZ_FLOW_COMPLETE.md)
- [Índice Geral](./NFE_DOCUMENTATION_INDEX.md)

---

**Versão:** 1.0.0  
**Data:** 16 de novembro de 2025
