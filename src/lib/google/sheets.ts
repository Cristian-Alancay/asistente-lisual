import { requestAccessToken } from "./gis";

const SHEETS_API = "https://sheets.googleapis.com/v4/spreadsheets";

type CellValue = string | number | boolean | null;

interface ExportOptions {
  title: string;
  sheetName?: string;
  headers: string[];
  rows: CellValue[][];
}

async function apiCall<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = await requestAccessToken();
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Google Sheets API error (${res.status}): ${body}`);
  }
  return res.json();
}

export async function exportToGoogleSheets({
  title,
  sheetName = "Datos",
  headers,
  rows,
}: ExportOptions): Promise<string> {
  const spreadsheet = await apiCall<{ spreadsheetId: string; spreadsheetUrl: string }>(
    SHEETS_API,
    {
      method: "POST",
      body: JSON.stringify({
        properties: { title },
        sheets: [
          {
            properties: {
              title: sheetName,
              gridProperties: { frozenRowCount: 1 },
            },
          },
        ],
      }),
    },
  );

  const range = `${sheetName}!A1`;
  const values = [headers, ...rows];

  await apiCall(
    `${SHEETS_API}/${spreadsheet.spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
    {
      method: "PUT",
      body: JSON.stringify({ range, majorDimension: "ROWS", values }),
    },
  );

  await formatHeaderRow(spreadsheet.spreadsheetId, 0, headers.length);

  return spreadsheet.spreadsheetUrl;
}

async function formatHeaderRow(
  spreadsheetId: string,
  sheetId: number,
  columnCount: number,
) {
  await apiCall(`${SHEETS_API}/${spreadsheetId}:batchUpdate`, {
    method: "POST",
    body: JSON.stringify({
      requests: [
        {
          repeatCell: {
            range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: columnCount },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.15, green: 0.15, blue: 0.2 },
                textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 }, fontSize: 10 },
                horizontalAlignment: "CENTER",
              },
            },
            fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)",
          },
        },
        {
          autoResizeDimensions: {
            dimensions: { sheetId, dimension: "COLUMNS", startIndex: 0, endIndex: columnCount },
          },
        },
      ],
    }),
  });
}
