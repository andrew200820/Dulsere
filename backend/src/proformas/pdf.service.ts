import { Injectable, InternalServerErrorException } from '@nestjs/common';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFDocument = require('pdfkit');

@Injectable()
export class PdfService {
  async generarPdfProforma(proforma: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const buffers: Buffer[] = [];

        doc.on('data', (chunk: Buffer) => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', (err: Error) => reject(err));

        // --- ENCABEZADO ---
        doc.fontSize(24).fillColor('#c0392b').text('DULSERE', { align: 'left' });
        doc.fontSize(10).fillColor('#7f8c8d').text('Repostería Fina & Catering Gourmet', { align: 'left' });

        doc.moveUp(2);
        doc.fontSize(14).fillColor('#2c3e50').text(`PROFORMA #000${proforma.id}`, { align: 'right' });
        doc.fontSize(10).fillColor('#7f8c8d').text(`Estado: ${proforma.estado}`, { align: 'right' });
        doc.moveDown(1.5);

        // Línea divisoria
        doc.strokeColor('#bdc3c7').lineWidth(1).moveTo(50, 110).lineTo(562, 110).stroke();
        doc.moveDown(1.5);

        // --- DATOS DE LA TRANSACCIÓN ---
        const yStart = 130;
        doc.fontSize(11).fillColor('#2c3e50').text('Datos del Cliente:', 50, yStart, { underline: true });
        doc.fontSize(10).fillColor('#34495e')
          .text(`Nombre: ${proforma.cliente.nombre}`, 50, yStart + 15)
          .text(`Cédula/RUC: ${proforma.cliente.cedulaRuc}`, 50, yStart + 30)
          .text(`Teléfono: ${proforma.cliente.telefono}`, 50, yStart + 45)
          .text(`Email: ${proforma.cliente.email || 'N/A'}`, 50, yStart + 60);

        doc.fontSize(11).fillColor('#2c3e50').text('Detalle de Entrega:', 320, yStart, { underline: true });
        doc.fontSize(10).fillColor('#34495e')
          .text(`Fecha Emisión: ${new Date(proforma.fechaEmision).toLocaleDateString()}`, 320, yStart + 15)
          .text(`Fecha Entrega: ${new Date(proforma.fechaEntrega).toLocaleDateString()}`, 320, yStart + 30)
          .text(`Dirección: ${proforma.cliente.direccionEntrega || 'Retiro en Tienda'}`, 320, yStart + 45);

        doc.moveDown(4);

        // --- TABLA DE DETALLES ---
        const tableTop = 230;
        doc.fontSize(10).fillColor('#2c3e50');

        // Cabecera bold
        doc.font('Helvetica-Bold');
        doc.text('Producto', 50, tableTop);
        doc.text('Cant.', 280, tableTop, { align: 'right' });
        doc.text('Precio Unit.', 380, tableTop, { align: 'right' });
        doc.text('Subtotal', 480, tableTop, { align: 'right' });
        doc.font('Helvetica');

        doc.strokeColor('#2c3e50').lineWidth(1).moveTo(50, tableTop + 15).lineTo(562, tableTop + 15).stroke();

        let currentY = tableTop + 25;
        proforma.detalles.forEach((det: any) => {
          doc.fillColor('#34495e');
          doc.text(det.producto.nombre, 50, currentY, { width: 220 });
          doc.text(det.cantidad.toString(), 280, currentY, { align: 'right' });
          doc.text(`$${Number(det.precioUnitario).toFixed(2)}`, 380, currentY, { align: 'right' });
          doc.text(`$${Number(det.subtotal).toFixed(2)}`, 480, currentY, { align: 'right' });
          currentY += 20;
        });

        doc.strokeColor('#bdc3c7').lineWidth(1).moveTo(50, currentY).lineTo(562, currentY).stroke();
        currentY += 15;

        // --- DESGLOSE DE TOTALES ---
        const totalX = 350;
        doc.fontSize(10).fillColor('#2c3e50');

        doc.text('Subtotal:', totalX, currentY);
        doc.text(`$${Number(proforma.subtotal).toFixed(2)}`, 480, currentY, { align: 'right' });
        currentY += 15;

        if (Number(proforma.descuento) > 0) {
          doc.text(`Descuento (${proforma.motivoDescuento || 'Promo'}):`, totalX, currentY);
          doc.text(`-$${Number(proforma.descuento).toFixed(2)}`, 480, currentY, { align: 'right' });
          currentY += 15;
        }

        doc.text(`IVA (${Number(proforma.porcentajeIva)}%):`, totalX, currentY);
        doc.text(`$${Number(proforma.montoIva).toFixed(2)}`, 480, currentY, { align: 'right' });
        currentY += 20;

        doc.font('Helvetica-Bold').fontSize(12).fillColor('#c0392b');
        doc.text('TOTAL:', totalX, currentY);
        doc.text(`$${Number(proforma.total).toFixed(2)}`, 480, currentY, { align: 'right' });
        doc.font('Helvetica');

        // --- PIE DE PÁGINA ---
        doc.fontSize(8).fillColor('#95a5a6').text(
          'Este documento es una proforma preliminar de cotización de servicios de repostería. ' +
          'Para confirmación de pedido se requiere el anticipo del 50% mínimo.',
          50, 700,
          { align: 'center', width: 462 },
        );

        doc.end();
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        reject(new InternalServerErrorException(`Fallo al generar PDF: ${msg}`));
      }
    });
  }
}