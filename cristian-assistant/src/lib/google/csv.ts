type CellValue = string | number | boolean | null;

function escapeCsv(val: CellValue): string {
  if (val == null) return "";
  const s = String(val);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function downloadCsv(
  filename: string,
  headers: string[],
  rows: CellValue[][],
) {
  const bom = "\uFEFF";
  const csv =
    bom +
    [headers.map(escapeCsv).join(","), ...rows.map((r) => r.map(escapeCsv).join(","))].join(
      "\r\n",
    );

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
