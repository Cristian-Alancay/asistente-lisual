import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type PresupuestoData = {
  numero: string;
  fecha_emision: string;
  vigencia_hasta: string;
  moneda: string;
  subtotal: number;
  impuestos: number;
  total: number;
  estado: string;
  items: { descripcion: string; cantidad: number; precio_unitario: number }[];
  lead?: {
    nombre: string;
    empresa?: string | null;
    email?: string | null;
    telefono?: string | null;
  } | null;
};

function formatCurrency(amount: number, moneda: string) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: moneda,
  }).format(amount);
}

export function generatePresupuestoPDF(data: PresupuestoData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(20);
  doc.setTextColor(63, 63, 241);
  doc.text("PRESUPUESTO", 14, 22);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`N° ${data.numero}`, 14, 30);
  doc.text(`Estado: ${data.estado.toUpperCase()}`, 14, 36);

  doc.setFontSize(9);
  doc.text(`Emisión: ${data.fecha_emision}`, pageWidth - 14, 22, { align: "right" });
  doc.text(`Vigencia: ${data.vigencia_hasta}`, pageWidth - 14, 28, { align: "right" });

  if (data.lead) {
    doc.setFontSize(11);
    doc.setTextColor(30);
    doc.text("Cliente", 14, 48);
    doc.setFontSize(9);
    doc.setTextColor(80);
    let y = 54;
    doc.text(data.lead.nombre, 14, y);
    if (data.lead.empresa) { y += 5; doc.text(data.lead.empresa, 14, y); }
    if (data.lead.email) { y += 5; doc.text(data.lead.email, 14, y); }
    if (data.lead.telefono) { y += 5; doc.text(data.lead.telefono, 14, y); }
  }

  const startY = data.lead ? 76 : 50;

  autoTable(doc, {
    startY,
    head: [["#", "Descripción", "Cant.", "P. Unit.", "Subtotal"]],
    body: data.items.map((item, i) => [
      i + 1,
      item.descripcion,
      item.cantidad,
      formatCurrency(item.precio_unitario, data.moneda),
      formatCurrency(item.cantidad * item.precio_unitario, data.moneda),
    ]),
    theme: "striped",
    headStyles: { fillColor: [63, 63, 241] },
    styles: { fontSize: 9 },
    columnStyles: {
      0: { halign: "center", cellWidth: 12 },
      2: { halign: "center", cellWidth: 18 },
      3: { halign: "right", cellWidth: 30 },
      4: { halign: "right", cellWidth: 30 },
    },
  });

  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  doc.setFontSize(9);
  doc.setTextColor(80);
  const col = pageWidth - 14;
  doc.text(`Subtotal: ${formatCurrency(data.subtotal, data.moneda)}`, col, finalY, { align: "right" });
  doc.text(`IVA (21%): ${formatCurrency(data.impuestos, data.moneda)}`, col, finalY + 6, { align: "right" });
  doc.setFontSize(12);
  doc.setTextColor(30);
  doc.text(`TOTAL: ${formatCurrency(data.total, data.moneda)}`, col, finalY + 14, { align: "right" });

  doc.setFontSize(7);
  doc.setTextColor(150);
  doc.text("Generado por Assistant Cristian Alancay", 14, doc.internal.pageSize.getHeight() - 10);

  return doc;
}

export function downloadPresupuestoPDF(data: PresupuestoData) {
  const doc = generatePresupuestoPDF(data);
  doc.save(`presupuesto-${data.numero}.pdf`);
}
