# Exportação de Vendas em PDF - Documentação Completa

## 📋 Visão Geral

O módulo de vendas permite exportar orçamentos e vendas confirmadas em formato PDF profissional, incluindo automaticamente a logo da empresa configurada no sistema.

## 🚀 Características

### ✅ Layout Profissional
- Design moderno e clean
- Logo da empresa no cabeçalho (se configurada)
- Cores diferenciadas por status
- Tabelas formatadas
- Marca d'água para orçamentos

### ✅ Informações Completas
- **Empresa**: Nome, CNPJ, endereço, contato
- **Cliente**: Nome, CPF/CNPJ, endereço, contato
- **Produtos**: Descrição, código, quantidade, preços
- **Valores**: Subtotal, descontos, frete, outras despesas
- **Pagamento**: Método, parcelas, valor das parcelas
- **Datas**: Emissão, validade, confirmação
- **Observações**: Notas gerais e internas
- **Status**: Visual e descritivo
- **Análise de Crédito**: Status e observações (quando aplicável)
- **Cancelamento**: Motivo (quando aplicável)

### ✅ Recursos Visuais

**Status com Cores:**
- 🟠 Orçamento (QUOTE) - Laranja
- 🟠 Aguardando Aprovação (PENDING_APPROVAL) - Laranja escuro
- 🟢 Aprovada (APPROVED) - Verde
- 🔵 Confirmada (CONFIRMED) - Azul esverdeado
- 🔵 Em Produção (IN_PRODUCTION) - Azul
- 🟣 Pronto para Envio (READY_TO_SHIP) - Roxo
- ⚫ Enviado (SHIPPED) - Cinza escuro
- 🟢 Entregue (DELIVERED) - Verde água
- 🔵 Concluída (COMPLETED) - Azul
- 🔴 Cancelada (CANCELED) - Vermelho
- 🔴 Rejeitada (REJECTED) - Vermelho escuro

**Marca d'Água:**
- Orçamentos (QUOTE) exibem marca d'água diagonal "ORÇAMENTO"
- Transparente, não atrapalha a leitura

---

## 📡 Endpoint

### GET /sales/:id/pdf

**Autenticação:** Bearer Token (obrigatório)

**Parâmetros:**
- `id` (path, uuid) - ID da venda/orçamento

**Response:**
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="orcamento-{código}.pdf"`
- Binário do PDF

---

## 💻 Exemplos de Uso

### JavaScript/Fetch

```javascript
async function downloadSalePdf(saleId) {
  try {
    const response = await fetch(`http://api.com/sales/${saleId}/pdf`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao gerar PDF');
    }

    // Obter blob
    const blob = await response.blob();
    
    // Criar link temporário
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `venda-${saleId}.pdf`;
    document.body.appendChild(a);
    a.click();
    
    // Limpar
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Erro:', error);
    alert('Erro ao baixar PDF');
  }
}

// Usar
downloadSalePdf('uuid-da-venda');
```

### Axios

```javascript
import axios from 'axios';

async function downloadSalePdf(saleId) {
  try {
    const response = await axios.get(
      `http://api.com/sales/${saleId}/pdf`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        responseType: 'blob' // Importante!
      }
    );

    // Criar URL do blob
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // Obter nome do arquivo do header (se disponível)
    const contentDisposition = response.headers['content-disposition'];
    const fileName = contentDisposition
      ? contentDisposition.split('filename=')[1].replace(/"/g, '')
      : `venda-${saleId}.pdf`;
    
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    
    // Limpar
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erro ao baixar PDF:', error);
  }
}
```

### React Component

```jsx
import React, { useState } from 'react';
import axios from 'axios';

function SalePdfDownloadButton({ saleId, token }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://api.com/sales/${saleId}/pdf`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const contentDisposition = response.headers['content-disposition'];
      const fileName = contentDisposition
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : `venda-${saleId}.pdf`;
      
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleDownload} 
      disabled={loading}
      className="btn-download-pdf"
    >
      {loading ? 'Gerando PDF...' : '📄 Baixar PDF'}
    </button>
  );
}

export default SalePdfDownloadButton;
```

### HTML Simples (Link Direto)

```html
<!-- Não recomendado: não funciona com autenticação -->
<a 
  href="http://api.com/sales/uuid-da-venda/pdf" 
  download 
  target="_blank"
>
  📄 Baixar PDF
</a>

<!-- Melhor: usar JavaScript com fetch -->
<button onclick="downloadPdf('uuid-da-venda')">
  📄 Baixar PDF
</button>

<script>
async function downloadPdf(saleId) {
  const token = localStorage.getItem('token');
  const response = await fetch(`http://api.com/sales/${saleId}/pdf`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `documento-${saleId}.pdf`;
  a.click();
  window.URL.revokeObjectURL(url);
}
</script>
```

### cURL (Linha de Comando)

```bash
# Download direto
curl -X GET "http://api.com/sales/uuid-da-venda/pdf" \
  -H "Authorization: Bearer seu_token" \
  -o venda.pdf

# Com saída para arquivo específico
curl -X GET "http://api.com/sales/uuid-da-venda/pdf" \
  -H "Authorization: Bearer seu_token" \
  --output orcamento-123.pdf
```

### Postman / Insomnia

1. **Request:**
   - Method: `GET`
   - URL: `{{baseUrl}}/sales/{{saleId}}/pdf`
   - Headers: `Authorization: Bearer {{token}}`

2. **Response:**
   - Clique em "Send and Download"
   - O PDF será salvo automaticamente

---

## 🎨 Configurar Logo da Empresa

Para que a logo apareça no PDF, ela deve estar configurada na empresa:

### Endpoint para Upload da Logo

```bash
POST /companies/:companyId/logo
Content-Type: multipart/form-data

Body (form-data):
  logo: [arquivo de imagem]
```

### Formatos Suportados
- PNG (recomendado para transparência)
- JPG/JPEG

### Tamanho Recomendado
- Largura: 300-600px
- Altura: proporcional (máximo 200px no PDF)
- Tamanho do arquivo: < 2MB

---

## 🔧 Tecnologia Utilizada

- **Puppeteer**: Geração de PDF a partir de HTML
- **HTML/CSS**: Template do documento
- **Node.js fs**: Leitura da logo do disco
- **Base64**: Embedding da logo no HTML

---

## 📝 Estrutura do PDF

```
┌─────────────────────────────────────────┐
│  [LOGO]              ORÇAMENTO/VENDA    │
│  Empresa             #CODIGO            │
│  CNPJ, Endereço      [STATUS]           │
├─────────────────────────────────────────┤
│                                         │
│  CLIENTE          PAGAMENTO    DATAS   │
│  Nome             Método        Emissão │
│  CPF/CNPJ         Parcelas      Validade│
│  Endereço         Valor/Parcela         │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  PRODUTOS                               │
│  ┌─────────────────────────────────┐   │
│  │ Produto | Qtd | Preço | Total   │   │
│  ├─────────────────────────────────┤   │
│  │ Item 1  | 2   | R$ 50 | R$ 100  │   │
│  │ Item 2  | 1   | R$ 30 | R$ 30   │   │
│  └─────────────────────────────────┘   │
│                                         │
│                    Subtotal: R$ 130,00  │
│                    Desconto: R$ 10,00   │
│                    Frete:    R$ 15,00   │
│                    ──────────────────   │
│                    TOTAL:    R$ 135,00  │
│                                         │
├─────────────────────────────────────────┤
│  OBSERVAÇÕES                            │
│  Texto das observações...               │
├─────────────────────────────────────────┤
│  Gerado em: DD/MM/YYYY HH:MM            │
└─────────────────────────────────────────┘
```

---

## ⚠️ Observações Importantes

1. **Performance:**
   - A geração do PDF pode levar 1-3 segundos
   - Mostre um loading ao usuário
   - Considere cache para PDFs frequentemente acessados

2. **Memória:**
   - PDFs são gerados em memória
   - Não são salvos no disco por padrão
   - Para alto volume, considere implementar fila

3. **Logo:**
   - Se não houver logo, o PDF é gerado normalmente
   - Logo é convertida para base64 e embutida no HTML
   - Suporta PNG (com transparência) e JPG

4. **Tamanho:**
   - PDFs típicos: 100-500KB
   - Com logo: +50-200KB
   - Considere compressão se necessário

5. **Internacionalização:**
   - Atualmente em PT-BR
   - Datas no formato DD/MM/YYYY
   - Moeda em R$ (BRL)

---

## 🐛 Troubleshooting

### Logo não aparece
- ✅ Verificar se o campo `logoUrl` está preenchido
- ✅ Verificar se o arquivo existe em `uploads/`
- ✅ Verificar permissões do diretório
- ✅ Checar formato do arquivo (PNG/JPG)

### PDF não baixa
- ✅ Verificar token de autenticação
- ✅ Verificar se a venda existe
- ✅ Verificar permissões do usuário
- ✅ Checar logs do servidor

### Erro de memória
- ✅ Aumentar limite de memória do Node.js
- ✅ Implementar fila de processamento
- ✅ Adicionar timeout nas requisições

### Layout quebrado
- ✅ Verificar se todos os dados estão presentes
- ✅ Testar com diferentes quantidades de itens
- ✅ Verificar campos nulos/undefined

---

## 🔜 Melhorias Futuras

- [ ] Template customizável por empresa
- [ ] Opção de visualizar antes de baixar
- [ ] Envio por email automaticamente
- [ ] Múltiplos idiomas
- [ ] QR Code para consulta online
- [ ] Assinatura digital
- [ ] Watermark customizável
- [ ] Diferentes formatos (A4, Carta, etc)
- [ ] Compactação automática de imagens
- [ ] Cache de PDFs gerados

---

## 📚 Links Relacionados

- [API de Vendas - Referência Completa](./API_SALES.md)
- [API de Vendas - Guia Rápido](./API_SALES_QUICKSTART.md)
- [Configuração de Empresa](./COMPANIES.md)

---

## 💡 Exemplos de Casos de Uso

### 1. Download Automático Após Criação
```javascript
async function createAndDownloadQuote(quoteData) {
  // Criar orçamento
  const sale = await createSale(quoteData);
  
  // Aguardar 1 segundo (opcional)
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Baixar PDF
  await downloadSalePdf(sale.id);
}
```

### 2. Enviar por Email
```javascript
async function sendQuoteByEmail(saleId, customerEmail) {
  // Baixar PDF
  const response = await fetch(`http://api.com/sales/${saleId}/pdf`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const pdfBlob = await response.blob();
  
  // Enviar por email (usar serviço de email)
  const formData = new FormData();
  formData.append('to', customerEmail);
  formData.append('subject', 'Seu Orçamento');
  formData.append('attachment', pdfBlob, 'orcamento.pdf');
  
  await sendEmail(formData);
}
```

### 3. Preview no Navegador
```javascript
async function previewPdf(saleId) {
  const response = await fetch(`http://api.com/sales/${saleId}/pdf`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  
  // Abrir em nova aba
  window.open(url, '_blank');
  
  // OU mostrar em iframe
  document.getElementById('pdf-viewer').src = url;
}
```

---

## 📞 Suporte

Para dúvidas ou problemas com a geração de PDF, consulte:
- Logs do servidor
- Documentação do Puppeteer
- Issues conhecidos no GitHub
- Contato com o time de desenvolvimento
