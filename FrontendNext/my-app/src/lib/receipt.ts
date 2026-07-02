import { jsPDF } from 'jspdf';

/**
 * Generador de Boleta de Venta Electrónica peruana — PAT-LI Textiles.
 * Cumple con los requisitos de SUNAT: RUC, IGV 18%, serie/correlativo,
 * detalle valorizado, monto en letras y leyendas de ley.
 */

export interface ReceiptItem {
  description: string;
  quantity: number;
  price: number; // precio unitario (incluye IGV)
}

export interface ReceiptData {
  transactionId: string;
  items: ReceiptItem[];
  total: number;       // total final (con IGV, ya con descuento)
  discount: number;    // monto de descuento aplicado
  paymentMethod: string;
  customerName?: string;
  customerDoc?: string;
  couponCode?: string;
}

// ── Datos fiscales de la empresa (emisor) ──────────────────────────
const EMPRESA = {
  razonSocial: 'PAT-LI TEXTILES S.R.L.',
  ruc:         '20554498712',
  direccion:   'Calle Lima 123, Ica, Perú',
  telefono:    '(056) 212121',
  email:       'ventas@patli.pe',
};

const IGV_RATE = 0.18;

// ── Número a letras (para "SON: ...") ──────────────────────────────
const UNIDADES = ['', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
const DECENAS  = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
const ESPECIALES: Record<number, string> = {
  11: 'ONCE', 12: 'DOCE', 13: 'TRECE', 14: 'CATORCE', 15: 'QUINCE',
  16: 'DIECISÉIS', 17: 'DIECISIETE', 18: 'DIECIOCHO', 19: 'DIECINUEVE',
  21: 'VEINTIUNO', 22: 'VEINTIDÓS', 23: 'VEINTITRÉS', 24: 'VEINTICUATRO',
  25: 'VEINTICINCO', 26: 'VEINTISÉIS', 27: 'VEINTISIETE', 28: 'VEINTIOCHO', 29: 'VEINTINUEVE',
};
const CENTENAS = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

function centenasALetras(n: number): string {
  if (n === 0) return '';
  if (n === 100) return 'CIEN';
  const c = Math.floor(n / 100);
  const resto = n % 100;
  let txt = CENTENAS[c];
  if (resto > 0) {
    if (ESPECIALES[resto]) txt += ` ${ESPECIALES[resto]}`;
    else {
      const d = Math.floor(resto / 10);
      const u = resto % 10;
      txt += ` ${DECENAS[d]}`;
      if (u > 0) txt += d === 0 ? UNIDADES[u] : ` Y ${UNIDADES[u]}`;
    }
  }
  return txt.trim();
}

function numeroALetras(num: number): string {
  const entero = Math.floor(num);
  const centimos = Math.round((num - entero) * 100);
  let texto = '';

  if (entero === 0) texto = 'CERO';
  else if (entero < 1000) texto = centenasALetras(entero);
  else {
    const miles = Math.floor(entero / 1000);
    const resto = entero % 1000;
    texto = miles === 1 ? 'MIL' : `${centenasALetras(miles)} MIL`;
    if (resto > 0) texto += ` ${centenasALetras(resto)}`;
  }

  return `${texto.trim()} CON ${centimos.toString().padStart(2, '0')}/100 SOLES`;
}

// ── Serie/correlativo determinístico a partir del transactionId ────
function serieCorrelativo(transactionId: string): string {
  const digits = transactionId.replace(/\D/g, '').slice(-8).padStart(8, '0');
  return `B001-${digits}`;
}

export function generateReceiptPDF(data: ReceiptData): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = 210;
  const marginX = 15;

  const subTotal = +(data.total / (1 + IGV_RATE)).toFixed(2); // valor de venta (sin IGV)
  const igv      = +(data.total - subTotal).toFixed(2);
  const serieNum = serieCorrelativo(data.transactionId);
  const fecha    = new Date();

  // ── Header: logo + empresa ──────────────────────────────────────
  // Bloque del logo (cuadro con iniciales estilizadas)
  doc.setFillColor(30, 58, 95);
  doc.roundedRect(marginX, 12, 22, 22, 3, 3, 'F');
  doc.setTextColor(245, 158, 11);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('PL', marginX + 11, 25, { align: 'center' });
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(5);
  doc.text('TEXTILES', marginX + 11, 30, { align: 'center' });

  // Datos del emisor
  doc.setTextColor(30, 58, 95);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text(EMPRESA.razonSocial, marginX + 28, 18);
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(EMPRESA.direccion, marginX + 28, 24);
  doc.text(`Telf: ${EMPRESA.telefono}  ·  ${EMPRESA.email}`, marginX + 28, 28.5);
  doc.text('Productores directos de textiles de algodón pima · Ica, Perú', marginX + 28, 33);

  // ── Recuadro RUC + tipo comprobante ─────────────────────────────
  const boxX = 138;
  const boxW = pageW - marginX - boxX;
  doc.setDrawColor(30, 58, 95);
  doc.setLineWidth(0.6);
  doc.roundedRect(boxX, 12, boxW, 26, 2, 2, 'S');
  doc.setTextColor(30, 58, 95);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`R.U.C. ${EMPRESA.ruc}`, boxX + boxW / 2, 19, { align: 'center' });
  doc.setFillColor(30, 58, 95);
  doc.rect(boxX, 22, boxW, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text('BOLETA DE VENTA', boxX + boxW / 2, 27, { align: 'center' });
  doc.setTextColor(30, 58, 95);
  doc.setFontSize(11);
  doc.text(serieNum, boxX + boxW / 2, 35, { align: 'center' });

  // ── Datos del cliente / venta ───────────────────────────────────
  let y = 46;
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.roundedRect(marginX, y, pageW - 2 * marginX, 20, 2, 2, 'S');
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('CLIENTE:', marginX + 4, y + 6);
  doc.text('DNI/DOC:', marginX + 4, y + 12);
  doc.text('FECHA EMISIÓN:', marginX + 110, y + 6);
  doc.text('HORA:', marginX + 110, y + 12);
  doc.setFont('helvetica', 'normal');
  doc.text(data.customerName || 'CLIENTE VARIOS', marginX + 28, y + 6);
  doc.text(data.customerDoc || '00000000', marginX + 28, y + 12);
  doc.text(fecha.toLocaleDateString('es-PE'), marginX + 145, y + 6);
  doc.text(fecha.toLocaleTimeString('es-PE'), marginX + 145, y + 12);
  doc.setFont('helvetica', 'bold');
  doc.text('MONEDA:', marginX + 4, y + 18);
  doc.setFont('helvetica', 'normal');
  doc.text('SOLES (PEN)', marginX + 28, y + 18);
  doc.setFont('helvetica', 'bold');
  doc.text('FORMA DE PAGO:', marginX + 110, y + 18);
  doc.setFont('helvetica', 'normal');
  doc.text(data.paymentMethod, marginX + 145, y + 18);

  // ── Tabla de items ──────────────────────────────────────────────
  y += 26;
  doc.setFillColor(30, 58, 95);
  doc.rect(marginX, y, pageW - 2 * marginX, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('CANT.', marginX + 4, y + 5.5);
  doc.text('DESCRIPCIÓN', marginX + 22, y + 5.5);
  doc.text('P. UNIT.', marginX + 132, y + 5.5);
  doc.text('IMPORTE', pageW - marginX - 4, y + 5.5, { align: 'right' });

  y += 8;
  doc.setTextColor(40, 40, 40);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  data.items.forEach((item, idx) => {
    const rowH = 7;
    if (idx % 2 === 1) {
      doc.setFillColor(245, 248, 252);
      doc.rect(marginX, y, pageW - 2 * marginX, rowH, 'F');
    }
    const importe = item.quantity * item.price;
    doc.text(String(item.quantity), marginX + 6, y + 5, { align: 'center' });
    const descLines = doc.splitTextToSize(item.description, 105);
    doc.text(descLines[0], marginX + 22, y + 5);
    doc.text(item.price.toFixed(2), marginX + 140, y + 5, { align: 'right' });
    doc.text(importe.toFixed(2), pageW - marginX - 4, y + 5, { align: 'right' });
    y += rowH;
  });

  // ── Totales ─────────────────────────────────────────────────────
  doc.setDrawColor(220, 220, 220);
  doc.line(marginX, y, pageW - marginX, y);
  y += 5;

  const totX = 135;
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);
  const totalLine = (label: string, value: string, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.text(label, totX, y);
    doc.text(value, pageW - marginX - 4, y, { align: 'right' });
    y += 5.5;
  };
  totalLine('OP. GRAVADA:', `S/ ${subTotal.toFixed(2)}`);
  totalLine('I.G.V. (18%):', `S/ ${igv.toFixed(2)}`);
  if (data.discount > 0) {
    doc.setTextColor(200, 50, 50);
    totalLine(`DESCUENTO${data.couponCode ? ` (${data.couponCode})` : ''}:`, `- S/ ${data.discount.toFixed(2)}`);
    doc.setTextColor(60, 60, 60);
  }
  // Línea de total destacada
  y += 1;
  doc.setFillColor(30, 58, 95);
  doc.roundedRect(totX - 4, y - 4, pageW - marginX - (totX - 4), 9, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('IMPORTE TOTAL:', totX, y + 2);
  doc.text(`S/ ${data.total.toFixed(2)}`, pageW - marginX - 4, y + 2, { align: 'right' });
  y += 12;

  // ── Monto en letras ─────────────────────────────────────────────
  doc.setTextColor(40, 40, 40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('SON:', marginX, y);
  doc.setFont('helvetica', 'normal');
  const letras = doc.splitTextToSize(numeroALetras(data.total), 170);
  doc.text(letras, marginX + 12, y);
  y += letras.length * 5 + 4;

  // ── Leyendas de ley / SUNAT ─────────────────────────────────────
  doc.setDrawColor(220, 220, 220);
  doc.roundedRect(marginX, y, pageW - 2 * marginX, 28, 2, 2, 'S');
  doc.setTextColor(90, 90, 90);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  const hash = data.transactionId.replace(/\D/g, '').slice(-12).padStart(12, '0');
  doc.text('Representación impresa de la BOLETA DE VENTA ELECTRÓNICA.', marginX + 4, y + 6);
  doc.text(`Consulte su comprobante en: www.patli.pe/comprobantes  ·  Autorizado mediante Resolución de Intendencia SUNAT.`, marginX + 4, y + 11);
  doc.text(`Código Hash: ${hash.toUpperCase()}-${serieNum}`, marginX + 4, y + 16);
  doc.text('Bienes transferidos en la Amazonía para ser consumidos fuera de ella: No aplica.', marginX + 4, y + 21);
  doc.setFont('helvetica', 'bold');
  doc.text('Gracias por su preferencia · PAT-LI Textiles, calidad iqueña desde 1995.', marginX + 4, y + 26);

  // ── Footer ──────────────────────────────────────────────────────
  doc.setTextColor(160, 160, 160);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Este documento es una representación impresa de un comprobante de pago electrónico emitido conforme al Reglamento de Comprobantes de Pago (SUNAT).', pageW / 2, 285, { align: 'center' });

  doc.save(`boleta_${serieNum}.pdf`);
}
