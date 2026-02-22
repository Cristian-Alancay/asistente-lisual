import * as XLSX from "xlsx";

type CellValue = string | number | boolean | null;

export function downloadExcel(
  filename: string,
  headers: string[],
  rows: CellValue[][],
  sheetName = "Datos",
) {
  const data = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(data);

  const colWidths = headers.map((h, i) => {
    let max = h.length;
    for (const row of rows) {
      const len = String(row[i] ?? "").length;
      if (len > max) max = len;
    }
    return { wch: Math.min(max + 2, 40) };
  });
  ws["!cols"] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename);
}
