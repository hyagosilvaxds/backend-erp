import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';

@Injectable()
export class PdfService {
  /**
   * Gera PDF a partir de HTML usando Puppeteer
   */
  async generatePdfFromHtml(html: string, landscape = false): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        landscape,
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
   * Formata valor monetário para exibição
   */
  formatCurrency(value: number | string): string {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numValue);
  }

  /**
   * Formata data para exibição
   */
  formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  /**
   * Formata CPF para exibição
   */
  formatCpf(cpf: string): string {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  /**
   * Retorna CSS base para documentos PDF
   */
  getBaseStyles(): string {
    return `
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          font-size: 12px;
          line-height: 1.6;
          color: #333;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 20px;
          border-bottom: 3px solid #4a5568;
          margin-bottom: 30px;
        }
        
        .company-name {
          font-size: 18px;
          font-weight: bold;
          color: #333;
        }
        
        .document-title {
          font-size: 16px;
          font-weight: bold;
          color: #666;
          text-align: right;
        }
        
        .section {
          margin-bottom: 25px;
        }
        
        .section-title {
          font-size: 14px;
          font-weight: bold;
          color: #333;
          margin-bottom: 15px;
          padding-bottom: 5px;
          border-bottom: 2px solid #e2e8f0;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 15px;
        }
        
        .info-item {
          padding: 10px;
          background: #f7fafc;
          border-radius: 4px;
        }
        
        .label {
          font-size: 10px;
          color: #718096;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        
        .value {
          font-size: 13px;
          font-weight: 600;
          color: #2d3748;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        
        th {
          background-color: #4a5568;
          color: white;
          padding: 12px 8px;
          text-align: left;
          font-weight: 600;
          font-size: 11px;
          text-transform: uppercase;
        }
        
        td {
          padding: 10px 8px;
          border-bottom: 1px solid #e2e8f0;
          font-size: 12px;
        }
        
        tr:nth-child(even) {
          background-color: #f7fafc;
        }
        
        .text-right {
          text-align: right;
        }
        
        .text-center {
          text-align: center;
        }
        
        .total-row {
          background-color: #edf2f7;
          font-weight: bold;
          font-size: 13px;
        }
        
        .highlight-box {
          background: #4a5568;
          color: white;
          padding: 15px;
          border-radius: 6px;
          text-align: center;
          margin: 30px 0;
        }
        
        .highlight-label {
          font-size: 12px;
          margin-bottom: 5px;
          opacity: 0.9;
        }
        
        .highlight-value {
          font-size: 24px;
          font-weight: bold;
        }
        
        .signature-section {
          margin-top: 60px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
        }
        
        .signature-box {
          text-align: center;
        }
        
        .signature-line {
          border-top: 1px solid #333;
          margin-bottom: 8px;
        }
        
        .signature-label {
          font-size: 10px;
          color: #718096;
        }
        
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          text-align: center;
          font-size: 10px;
          color: #718096;
        }
        
        .notes {
          background: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 15px;
          margin: 20px 0;
          font-size: 11px;
        }
        
        .notes-title {
          font-weight: bold;
          margin-bottom: 8px;
          color: #92400e;
        }
        
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      </style>
    `;
  }
}
