import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SalesPdfService {
  constructor(private prisma: PrismaService) {}

  /**
   * Gera PDF de uma venda (orçamento ou venda confirmada)
   */
  async generateSalePdf(
    companyId: string,
    saleId: string,
  ): Promise<Buffer> {
    // Buscar venda com todos os dados necessários
    const sale = await this.prisma.sale.findFirst({
      where: { id: saleId, companyId },
      include: {
        customer: true,
        paymentMethod: true,
        items: {
          include: {
            product: true,
          },
        },
        company: true,
      },
    });

    if (!sale) {
      throw new NotFoundException('Venda não encontrada');
    }

    // Determinar se é orçamento ou venda
    const isQuote = sale.status === 'QUOTE';
    const title = isQuote ? 'ORÇAMENTO' : 'NOTA DE VENDA';

    // Gerar HTML
    const html = this.generateSaleHtml(sale, title);

    // Gerar PDF usando Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm',
        },
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }

  /**
   * Gera o HTML para o PDF
   */
  private generateSaleHtml(sale: any, title: string): string {
    const isQuote = sale.status === 'QUOTE';
    
    // Formatar data
    const formatDate = (date: Date | null) => {
      if (!date) return '-';
      return new Date(date).toLocaleDateString('pt-BR');
    };

    // Formatar moeda
    const formatCurrency = (value: number) => {
      return value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });
    };

    // Formatar status
    const statusMap = {
      QUOTE: 'Orçamento',
      PENDING_APPROVAL: 'Aguardando Aprovação',
      APPROVED: 'Aprovada',
      CONFIRMED: 'Confirmada',
      IN_PRODUCTION: 'Em Produção',
      READY_TO_SHIP: 'Pronto para Envio',
      SHIPPED: 'Enviado',
      DELIVERED: 'Entregue',
      COMPLETED: 'Concluída',
      CANCELED: 'Cancelada',
      REJECTED: 'Rejeitada',
    };

    // Obter logo da empresa (se existir)
    let logoBase64 = '';
    if (sale.company.logoUrl) {
      const logoPath = path.join(process.cwd(), 'uploads', sale.company.logoUrl);
      if (fs.existsSync(logoPath)) {
        const logoBuffer = fs.readFileSync(logoPath);
        const ext = path.extname(logoPath).toLowerCase();
        const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';
        logoBase64 = `data:${mimeType};base64,${logoBuffer.toString('base64')}`;
      }
    }

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - ${sale.code}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Helvetica', 'Arial', sans-serif;
      font-size: 12px;
      color: #333;
      line-height: 1.6;
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 3px solid #2c3e50;
    }

    .company-info {
      flex: 1;
    }

    .logo {
      max-width: 180px;
      max-height: 80px;
      margin-bottom: 10px;
    }

    .company-name {
      font-size: 18px;
      font-weight: bold;
      color: #2c3e50;
      margin-bottom: 5px;
    }

    .company-details {
      font-size: 10px;
      color: #666;
      line-height: 1.4;
    }

    .document-info {
      text-align: right;
    }

    .document-title {
      font-size: 24px;
      font-weight: bold;
      color: #2c3e50;
      margin-bottom: 5px;
    }

    .document-number {
      font-size: 14px;
      color: #666;
      margin-bottom: 10px;
    }

    .document-status {
      display: inline-block;
      padding: 5px 15px;
      border-radius: 15px;
      font-size: 11px;
      font-weight: bold;
      text-transform: uppercase;
    }

    .status-quote { background: #f39c12; color: white; }
    .status-pending { background: #e67e22; color: white; }
    .status-approved { background: #27ae60; color: white; }
    .status-confirmed { background: #16a085; color: white; }
    .status-in-production { background: #3498db; color: white; }
    .status-ready-to-ship { background: #9b59b6; color: white; }
    .status-shipped { background: #34495e; color: white; }
    .status-delivered { background: #1abc9c; color: white; }
    .status-completed { background: #2980b9; color: white; }
    .status-canceled { background: #e74c3c; color: white; }
    .status-rejected { background: #c0392b; color: white; }

    .info-section {
      display: flex;
      justify-content: space-between;
      margin-bottom: 25px;
    }

    .info-box {
      flex: 1;
      margin-right: 20px;
    }

    .info-box:last-child {
      margin-right: 0;
    }

    .info-box-title {
      font-size: 11px;
      font-weight: bold;
      color: #2c3e50;
      margin-bottom: 8px;
      text-transform: uppercase;
      border-bottom: 2px solid #ecf0f1;
      padding-bottom: 5px;
    }

    .info-box-content {
      font-size: 11px;
      color: #555;
    }

    .info-row {
      margin-bottom: 3px;
    }

    .info-label {
      font-weight: bold;
      color: #2c3e50;
    }

    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }

    .items-table thead {
      background: #2c3e50;
      color: white;
    }

    .items-table th {
      padding: 10px;
      text-align: left;
      font-size: 11px;
      font-weight: bold;
      text-transform: uppercase;
    }

    .items-table th.center {
      text-align: center;
    }

    .items-table th.right {
      text-align: right;
    }

    .items-table tbody tr {
      border-bottom: 1px solid #ecf0f1;
    }

    .items-table tbody tr:hover {
      background: #f8f9fa;
    }

    .items-table td {
      padding: 10px;
      font-size: 11px;
    }

    .items-table td.center {
      text-align: center;
    }

    .items-table td.right {
      text-align: right;
    }

    .product-name {
      font-weight: bold;
      color: #2c3e50;
      margin-bottom: 2px;
    }

    .product-sku {
      font-size: 9px;
      color: #999;
    }

    .totals-section {
      display: flex;
      justify-content: flex-end;
      margin-top: 20px;
    }

    .totals-box {
      width: 350px;
      background: #f8f9fa;
      padding: 15px;
      border-radius: 5px;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 5px 0;
      font-size: 11px;
    }

    .total-row.subtotal {
      border-top: 1px solid #ddd;
      padding-top: 8px;
    }

    .total-row.final {
      border-top: 2px solid #2c3e50;
      margin-top: 8px;
      padding-top: 10px;
      font-size: 14px;
      font-weight: bold;
      color: #2c3e50;
    }

    .notes-section {
      margin-top: 30px;
      padding: 15px;
      background: #fff9e6;
      border-left: 4px solid #f39c12;
      border-radius: 3px;
    }

    .notes-title {
      font-size: 11px;
      font-weight: bold;
      color: #2c3e50;
      margin-bottom: 8px;
      text-transform: uppercase;
    }

    .notes-content {
      font-size: 11px;
      color: #555;
      line-height: 1.5;
    }

    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ecf0f1;
      text-align: center;
      font-size: 9px;
      color: #999;
    }

    .watermark-draft {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 120px;
      font-weight: bold;
      color: rgba(243, 156, 18, 0.1);
      z-index: -1;
      user-select: none;
    }

    @media print {
      body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  ${isQuote ? '<div class="watermark-draft">ORÇAMENTO</div>' : ''}
  
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="company-info">
        ${logoBase64 ? `<img src="${logoBase64}" alt="Logo" class="logo">` : ''}
        <div class="company-name">${sale.company.tradeName || sale.company.companyName}</div>
        <div class="company-details">
          ${sale.company.cpfCnpj ? `CNPJ: ${sale.company.cpfCnpj}<br>` : ''}
          ${sale.company.street ? `${sale.company.street}${sale.company.number ? ', ' + sale.company.number : ''}${sale.company.complement ? ' - ' + sale.company.complement : ''}<br>` : ''}
          ${sale.company.neighborhood ? `${sale.company.neighborhood} - ` : ''}${sale.company.city ? sale.company.city : ''}${sale.company.state ? '/' + sale.company.state : ''} ${sale.company.zipCode ? 'CEP: ' + sale.company.zipCode : ''}<br>
          ${sale.company.phone ? `Tel: ${sale.company.phone}` : ''}${sale.company.email ? ` - Email: ${sale.company.email}` : ''}
        </div>
      </div>
      <div class="document-info">
        <div class="document-title">${title}</div>
        <div class="document-number">#${sale.code}</div>
        <span class="document-status status-${sale.status.toLowerCase().replace('_', '-')}">
          ${statusMap[sale.status] || sale.status}
        </span>
      </div>
    </div>

    <!-- Info Section -->
    <div class="info-section">
      <div class="info-box">
        <div class="info-box-title">Cliente</div>
        <div class="info-box-content">
          <div class="info-row"><strong>${sale.customer.name}</strong></div>
          ${sale.customer.cpfCnpj ? `<div class="info-row">CPF/CNPJ: ${sale.customer.cpfCnpj}</div>` : ''}
          ${sale.customer.email ? `<div class="info-row">Email: ${sale.customer.email}</div>` : ''}
          ${sale.customer.phone ? `<div class="info-row">Tel: ${sale.customer.phone}</div>` : ''}
          ${sale.customer.street ? `<div class="info-row">${sale.customer.street}${sale.customer.number ? ', ' + sale.customer.number : ''}</div>` : ''}
          ${sale.customer.city ? `<div class="info-row">${sale.customer.city}/${sale.customer.state}</div>` : ''}
        </div>
      </div>

      <div class="info-box">
        <div class="info-box-title">Pagamento</div>
        <div class="info-box-content">
          <div class="info-row"><strong>${sale.paymentMethod.name}</strong></div>
          <div class="info-row">Parcelas: ${sale.installments}x</div>
          ${sale.installments > 1 ? `<div class="info-row">Valor da parcela: ${formatCurrency(sale.totalAmount / sale.installments)}</div>` : ''}
        </div>
      </div>

      <div class="info-box">
        <div class="info-box-title">Datas</div>
        <div class="info-box-content">
          <div class="info-row"><span class="info-label">Emissão:</span> ${formatDate(sale.quoteDate)}</div>
          ${sale.validUntil ? `<div class="info-row"><span class="info-label">Validade:</span> ${formatDate(sale.validUntil)}</div>` : ''}
          ${sale.confirmedAt ? `<div class="info-row"><span class="info-label">Confirmação:</span> ${formatDate(sale.confirmedAt)}</div>` : ''}
        </div>
      </div>
    </div>

    <!-- Items Table -->
    <table class="items-table">
      <thead>
        <tr>
          <th>Produto</th>
          <th class="center">Qtd</th>
          <th class="right">Preço Unit.</th>
          <th class="right">Desconto</th>
          <th class="right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${sale.items.map(item => `
          <tr>
            <td>
              <div class="product-name">${item.productName}</div>
              <div class="product-sku">Código: ${item.productCode || 'N/A'}</div>
            </td>
            <td class="center">${item.quantity}</td>
            <td class="right">${formatCurrency(item.unitPrice)}</td>
            <td class="right">${item.discount > 0 ? formatCurrency(item.discount) : '-'}</td>
            <td class="right">${formatCurrency(item.total)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <!-- Totals -->
    <div class="totals-section">
      <div class="totals-box">
        <div class="total-row">
          <span>Subtotal:</span>
          <span>${formatCurrency(sale.subtotal)}</span>
        </div>
        ${sale.discountAmount > 0 ? `
          <div class="total-row">
            <span>Desconto:</span>
            <span>- ${formatCurrency(sale.discountAmount)}</span>
          </div>
        ` : ''}
        ${sale.shippingCost > 0 ? `
          <div class="total-row">
            <span>Frete:</span>
            <span>+ ${formatCurrency(sale.shippingCost)}</span>
          </div>
        ` : ''}
        ${sale.otherCharges > 0 ? `
          <div class="total-row">
            <span>Outras Despesas${sale.otherChargesDesc ? ' (' + sale.otherChargesDesc + ')' : ''}:</span>
            <span>+ ${formatCurrency(sale.otherCharges)}</span>
          </div>
        ` : ''}
        <div class="total-row final">
          <span>TOTAL:</span>
          <span>${formatCurrency(sale.totalAmount)}</span>
        </div>
      </div>
    </div>

    <!-- Notes -->
    ${sale.notes ? `
      <div class="notes-section">
        <div class="notes-title">Observações</div>
        <div class="notes-content">${sale.notes}</div>
      </div>
    ` : ''}

    ${sale.creditAnalysisNotes ? `
      <div class="notes-section" style="background: #e8f5e9; border-left-color: #27ae60;">
        <div class="notes-title">Análise de Crédito</div>
        <div class="notes-content">
          <strong>Status:</strong> ${sale.creditAnalysisStatus === 'APPROVED' ? 'Aprovado' : sale.creditAnalysisStatus === 'REJECTED' ? 'Rejeitado' : 'Pendente'}<br>
          ${sale.creditAnalysisNotes}
        </div>
      </div>
    ` : ''}

    ${sale.cancellationReason ? `
      <div class="notes-section" style="background: #ffebee; border-left-color: #e74c3c;">
        <div class="notes-title">Motivo do Cancelamento</div>
        <div class="notes-content">${sale.cancellationReason}</div>
      </div>
    ` : ''}

    <!-- Footer -->
    <div class="footer">
      ${isQuote ? 'Este é um orçamento e não tem validade fiscal.' : 'Documento gerado eletronicamente.'}<br>
      Gerado em ${new Date().toLocaleString('pt-BR')}
    </div>
  </div>
</body>
</html>
    `;
  }
}
