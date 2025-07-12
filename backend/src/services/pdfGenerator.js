import htmlPdf from 'html-pdf-node';
import fs from 'fs/promises';
import path from 'path';

class PDFGenerator {
  constructor() {
    this.options = {
      format: 'A4',
      width: '210mm',
      height: '297mm',
      border: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm'
      }
    };
  }

  /**
   * Generate PDF for invoice
   * @param {Object} invoice - Invoice object
   * @param {Object} user - User object
   * @returns {Buffer} PDF buffer
   */
  async generateInvoicePDF(invoice, user) {
    try {
      const html = await this.generateInvoiceHTML(invoice, user);
      
      const file = {
        content: html
      };

      const pdfBuffer = await htmlPdf.generatePdf(file, this.options);
      return pdfBuffer;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error(`Failed to generate PDF: ${error.message}`);
    }
  }

  /**
   * Generate HTML template for invoice
   * @param {Object} invoice - Invoice object
   * @param {Object} user - User object
   * @returns {String} HTML string
   */
  async generateInvoiceHTML(invoice, user) {
    const documentTitle = invoice.type === 'factura' ? 'FACTURA ELECTRÓNICA' : 'BOLETA DE VENTA ELECTRÓNICA';
    const documentNumber = `${invoice.series}-${invoice.number}`;
    
    // Format date
    const issueDate = new Date(invoice.issueDate).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Generate items HTML
    const itemsHTML = invoice.items.map((item, index) => `
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${index + 1}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${item.description}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.quantity}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">S/ ${item.unitPrice.toFixed(2)}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">S/ ${item.total.toFixed(2)}</td>
      </tr>
    `).join('');

    const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${documentTitle} - ${documentNumber}</title>
        <style>
            body {
                font-family: 'Arial', sans-serif;
                font-size: 12px;
                line-height: 1.4;
                color: #333;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 210mm;
                margin: 0 auto;
                padding: 10mm;
            }
            .header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 20px;
                border-bottom: 2px solid #007bff;
                padding-bottom: 15px;
            }
            .company-info {
                flex: 1;
            }
            .company-name {
                font-size: 18px;
                font-weight: bold;
                color: #007bff;
                margin-bottom: 5px;
            }
            .company-details {
                font-size: 11px;
                color: #666;
            }
            .document-info {
                text-align: center;
                border: 2px solid #007bff;
                padding: 15px;
                border-radius: 8px;
                min-width: 200px;
            }
            .document-title {
                font-size: 14px;
                font-weight: bold;
                color: #007bff;
                margin-bottom: 10px;
            }
            .document-number {
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 5px;
            }
            .client-section {
                margin: 20px 0;
                border: 1px solid #ddd;
                border-radius: 5px;
                padding: 15px;
                background-color: #f9f9f9;
            }
            .section-title {
                font-size: 14px;
                font-weight: bold;
                margin-bottom: 10px;
                color: #007bff;
            }
            .client-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
            }
            .field {
                margin-bottom: 8px;
            }
            .field-label {
                font-weight: bold;
                color: #555;
            }
            .items-table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
            }
            .items-table th {
                background-color: #007bff;
                color: white;
                padding: 10px 8px;
                border: 1px solid #007bff;
                font-weight: bold;
                text-align: center;
            }
            .items-table td {
                border: 1px solid #ddd;
                padding: 8px;
            }
            .totals-section {
                margin-top: 20px;
                display: flex;
                justify-content: flex-end;
            }
            .totals-table {
                border: 1px solid #ddd;
                border-radius: 5px;
                overflow: hidden;
                min-width: 300px;
            }
            .totals-table td {
                padding: 8px 15px;
                border-bottom: 1px solid #eee;
            }
            .totals-table .label {
                font-weight: bold;
                background-color: #f8f9fa;
            }
            .totals-table .amount {
                text-align: right;
                font-weight: bold;
            }
            .total-row {
                background-color: #007bff;
                color: white;
                font-size: 14px;
            }
            .footer {
                margin-top: 30px;
                padding-top: 15px;
                border-top: 1px solid #ddd;
                text-align: center;
                font-size: 10px;
                color: #666;
            }
            .qr-section {
                margin-top: 20px;
                text-align: center;
                padding: 15px;
                border: 1px solid #ddd;
                border-radius: 5px;
                background-color: #f9f9f9;
            }
            .sunat-info {
                margin-top: 15px;
                padding: 10px;
                background-color: #e7f3ff;
                border-left: 4px solid #007bff;
                font-size: 11px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <!-- Header -->
            <div class="header">
                <div class="company-info">
                    <div class="company-name">${user.businessName}</div>
                    <div class="company-details">
                        <strong>RUC:</strong> ${user.ruc}<br>
                        ${user.address || 'Dirección no especificada'}<br>
                        <strong>Email:</strong> ${user.email}<br>
                        <strong>Teléfono:</strong> ${user.phone || 'No especificado'}
                    </div>
                </div>
                <div class="document-info">
                    <div class="document-title">${documentTitle}</div>
                    <div class="document-number">${documentNumber}</div>
                    <div style="font-size: 11px; margin-top: 5px;">
                        <strong>Fecha de Emisión:</strong><br>
                        ${issueDate}
                    </div>
                </div>
            </div>

            <!-- Client Information -->
            <div class="client-section">
                <div class="section-title">DATOS DEL CLIENTE</div>
                <div class="client-grid">
                    <div class="field">
                        <span class="field-label">${invoice.client.documentType}:</span>
                        ${invoice.client.documentNumber}
                    </div>
                    <div class="field">
                        <span class="field-label">Nombre/Razón Social:</span>
                        ${invoice.client.name}
                    </div>
                    ${invoice.client.address ? `
                    <div class="field">
                        <span class="field-label">Dirección:</span>
                        ${invoice.client.address}
                    </div>
                    ` : ''}
                    ${invoice.client.email ? `
                    <div class="field">
                        <span class="field-label">Email:</span>
                        ${invoice.client.email}
                    </div>
                    ` : ''}
                </div>
            </div>

            <!-- Items Table -->
            <table class="items-table">
                <thead>
                    <tr>
                        <th style="width: 40px;">Item</th>
                        <th style="width: 40%;">Descripción</th>
                        <th style="width: 80px;">Cantidad</th>
                        <th style="width: 100px;">Precio Unit.</th>
                        <th style="width: 100px;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHTML}
                </tbody>
            </table>

            <!-- Totals -->
            <div class="totals-section">
                <table class="totals-table">
                    <tr>
                        <td class="label">Subtotal:</td>
                        <td class="amount">S/ ${invoice.amounts.subtotal.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td class="label">IGV (18%):</td>
                        <td class="amount">S/ ${invoice.amounts.igv.toFixed(2)}</td>
                    </tr>
                    <tr class="total-row">
                        <td class="label">TOTAL:</td>
                        <td class="amount">S/ ${invoice.amounts.total.toFixed(2)}</td>
                    </tr>
                </table>
            </div>

            <!-- QR Code Section -->
            <div class="qr-section">
                <div style="font-weight: bold; margin-bottom: 10px;">CÓDIGO QR</div>
                <div style="border: 1px solid #ddd; width: 100px; height: 100px; margin: 0 auto; display: flex; align-items: center; justify-content: center; background-color: white;">
                    QR CODE
                </div>
                <div style="margin-top: 10px; font-size: 10px;">
                    Representación impresa del Comprobante de Pago Electrónico
                </div>
            </div>

            <!-- SUNAT Information -->
            <div class="sunat-info">
                <strong>Estado SUNAT:</strong> ${invoice.sunat.status === 'accepted' ? 'ACEPTADO' : 'PENDIENTE'}<br>
                <strong>Moneda:</strong> ${invoice.currency || 'PEN'}<br>
                <strong>Sistema:</strong> Quipu.ai - Plataforma de Facturación Electrónica
            </div>

            <!-- Footer -->
            <div class="footer">
                <div>Este documento ha sido generado electrónicamente por Quipu.ai</div>
                <div>Para consultas, visite: https://quipu.ai</div>
                <div style="margin-top: 10px;">
                    <strong>Hash:</strong> ${invoice._id ? invoice._id.toString().substring(0, 16).toUpperCase() : 'PENDING'}
                </div>
            </div>
        </div>
    </body>
    </html>
    `;

    return html;
  }

  /**
   * Save PDF to file system
   * @param {Buffer} pdfBuffer - PDF buffer
   * @param {String} filename - File name
   * @returns {String} File path
   */
  async savePDF(pdfBuffer, filename) {
    try {
      const uploadsDir = path.join(process.cwd(), 'uploads', 'pdfs');
      
      // Create directory if it doesn't exist
      await fs.mkdir(uploadsDir, { recursive: true });
      
      const filePath = path.join(uploadsDir, filename);
      await fs.writeFile(filePath, pdfBuffer);
      
      return filePath;
    } catch (error) {
      console.error('Error saving PDF:', error);
      throw new Error(`Failed to save PDF: ${error.message}`);
    }
  }

  /**
   * Generate and save invoice PDF
   * @param {Object} invoice - Invoice object
   * @param {Object} user - User object
   * @returns {Object} Result with file path and buffer
   */
  async generateAndSaveInvoicePDF(invoice, user) {
    try {
      const pdfBuffer = await this.generateInvoicePDF(invoice, user);
      
      const filename = `${invoice.type}_${invoice.series}_${invoice.number}_${Date.now()}.pdf`;
      const filePath = await this.savePDF(pdfBuffer, filename);
      
      return {
        buffer: pdfBuffer,
        filePath,
        filename
      };
    } catch (error) {
      console.error('Error generating and saving PDF:', error);
      throw error;
    }
  }
}

export default new PDFGenerator();