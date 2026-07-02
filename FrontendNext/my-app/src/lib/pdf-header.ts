import type { jsPDF } from 'jspdf';

/**
 * Dibuja un encabezado corporativo profesional con logo en cualquier PDF.
 * Reutilizable en todos los reportes de PAT-LI Textiles.
 *
 * @returns la coordenada Y donde termina el header (para continuar el contenido)
 */
export function drawPdfHeader(
  doc: jsPDF,
  title: string,
  subtitle?: string,
): number {
  const pageW = doc.internal.pageSize.getWidth();

  // ── Banda superior navy ─────────────────────────────────────────
  doc.setFillColor(30, 58, 95); // #1e3a5f
  doc.rect(0, 0, pageW, 38, 'F');

  // Acento dorado inferior
  doc.setFillColor(245, 158, 11); // #f59e0b
  doc.rect(0, 38, pageW, 1.5, 'F');

  // ── Logo: recuadro con iniciales "PL" + camiseta estilizada ─────
  const logoX = 14;
  const logoY = 8;
  // Cuadro dorado del logo
  doc.setFillColor(245, 158, 11);
  doc.roundedRect(logoX, logoY, 22, 22, 4, 4, 'F');
  // Iniciales navy sobre dorado
  doc.setTextColor(30, 58, 95);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('PL', logoX + 11, logoY + 11, { align: 'center' });
  // Pequeña línea decorativa (representa textil)
  doc.setDrawColor(30, 58, 95);
  doc.setLineWidth(0.5);
  doc.line(logoX + 5, logoY + 14.5, logoX + 17, logoY + 14.5);
  doc.setFontSize(4.5);
  doc.text('TEXTILES', logoX + 11, logoY + 18, { align: 'center' });

  // ── Nombre de la empresa + tagline ──────────────────────────────
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.text('PAT-LI TEXTILES', logoX + 28, logoY + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(245, 158, 11);
  doc.text('CALIDAD IQUEÑA DESDE 1995', logoX + 28, logoY + 14);

  doc.setTextColor(220, 230, 245);
  doc.setFontSize(7);
  doc.text('RUC 20554498712  ·  Calle Lima 123, Ica, Perú  ·  (056) 212121', logoX + 28, logoY + 19);

  // ── Título del reporte (lado derecho) ───────────────────────────
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(title.toUpperCase(), pageW - 14, logoY + 8, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(200, 215, 235);
  if (subtitle) {
    doc.text(subtitle, pageW - 14, logoY + 13, { align: 'right' });
  }
  doc.text(`Generado: ${new Date().toLocaleString('es-PE')}`, pageW - 14, logoY + (subtitle ? 18 : 13), { align: 'right' });

  return 48; // Y donde continúa el contenido
}

/**
 * Dibuja el pie de página corporativo con número de página en todas las hojas.
 */
export function drawPdfFooter(doc: jsPDF): void {
  const pageW   = doc.internal.pageSize.getWidth();
  const pageH   = doc.internal.pageSize.getHeight();
  // jsPDF v2 expone getNumberOfPages en internal
  const total   = (doc as unknown as { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages();

  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    // Línea separadora
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.3);
    doc.line(14, pageH - 14, pageW - 14, pageH - 14);
    // Texto
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text('PAT-LI Textiles S.R.L. · Documento confidencial', 14, pageH - 9);
    doc.text(`Página ${i} de ${total}`, pageW - 14, pageH - 9, { align: 'right' });
  }
}
