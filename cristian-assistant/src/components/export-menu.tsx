import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileDown, Loader2, ExternalLink } from "lucide-react";
import { exportToGoogleSheets } from "@/lib/google/sheets";
import { downloadExcel } from "@/lib/google/excel";

type CellValue = string | number | boolean | null;

interface ExportMenuProps {
  title: string;
  headers: string[];
  rows: CellValue[][];
  filenamePrefix?: string;
  disabled?: boolean;
}

export function ExportMenu({
  title,
  headers,
  rows,
  filenamePrefix = "export",
  disabled,
}: ExportMenuProps) {
  const [exporting, setExporting] = useState(false);
  const hasGoogleClientId = !!import.meta.env.VITE_GOOGLE_CLIENT_ID;

  async function handleSheets() {
    setExporting(true);
    try {
      const url = await exportToGoogleSheets({
        title,
        sheetName: "Datos",
        headers,
        rows,
      });
      toast.success("Exportado a Google Sheets", {
        description: "Se abrirá en una nueva pestaña",
        action: {
          label: "Abrir",
          onClick: () => window.open(url, "_blank"),
        },
      });
      window.open(url, "_blank");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al exportar";
      if (msg.includes("popup_closed") || msg.includes("access_denied")) {
        toast.info("Exportación cancelada");
      } else {
        toast.error("Error al exportar a Google Sheets", { description: msg });
      }
    } finally {
      setExporting(false);
    }
  }

  function handleExcel() {
    const date = new Date().toISOString().slice(0, 10);
    downloadExcel(`${filenamePrefix}-${date}.xlsx`, headers, rows);
    toast.success("Excel descargado");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5" disabled={disabled || exporting}>
          {exporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        {hasGoogleClientId && (
          <>
            <DropdownMenuItem onClick={handleSheets} disabled={exporting} className="gap-2">
              <FileSpreadsheet className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Google Sheets</p>
                <p className="text-[11px] text-muted-foreground">Crea una hoja en tu Drive</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={handleExcel} className="gap-2">
          <FileDown className="h-4 w-4 text-green-700" />
          <div>
            <p className="text-sm font-medium">Descargar Excel</p>
            <p className="text-[11px] text-muted-foreground">Archivo .xlsx</p>
          </div>
        </DropdownMenuItem>
        {!hasGoogleClientId && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled className="gap-2 opacity-50">
              <ExternalLink className="h-4 w-4" />
              <div>
                <p className="text-[11px]">Google Sheets requiere configurar</p>
                <p className="text-[10px] text-muted-foreground">VITE_GOOGLE_CLIENT_ID</p>
              </div>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
