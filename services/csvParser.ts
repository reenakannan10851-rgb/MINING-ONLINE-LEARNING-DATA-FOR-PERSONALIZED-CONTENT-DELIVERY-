/**
 * Fast line-split CSV parser optimised for OULAD files.
 * Uses String.split('\n') instead of char-by-char to avoid blocking the main thread.
 * Caps at MAX_ROWS per file so the browser stays responsive even with multi-MB CSVs.
 */

export interface ParsedCSV {
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
}

export function parseCSV(csvText: string, maxRows: number = Infinity): ParsedCSV {
  if (!csvText || !csvText.trim()) {
    return { headers: [], rows: [], totalRows: 0 };
  }

  // Fast line-split (handles \r\n and \n)
  const rawLines = csvText.split(/\r?\n/);
  const headers = splitCSVLine(rawLines[0]);
  if (headers.length === 0) return { headers: [], rows: [], totalRows: 0 };

  const rows: Record<string, string>[] = [];
  const limit = Math.min(rawLines.length - 1, maxRows);

  for (let r = 1; r <= limit; r++) {
    const line = rawLines[r];
    if (!line || !line.trim()) continue;
    const values = splitCSVLine(line);
    const rowObj: Record<string, string> = {};
    for (let c = 0; c < headers.length; c++) {
      rowObj[headers[c]] = values[c] !== undefined ? values[c] : '';
    }
    rows.push(rowObj);
  }

  return { headers, rows, totalRows: rows.length };
}

/** Split a single CSV line respecting double-quoted fields. */
function splitCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

export function exportToCSV(data: any[], filename: string): void {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvRows: string[] = [];

  csvRows.push(headers.join(','));

  for (const row of data) {
    const values = headers.map(header => {
      let val = row[header];
      if (val === null || val === undefined) val = '';
      const strVal = String(val).replace(/"/g, '""');
      if (strVal.includes(',') || strVal.includes('\n') || strVal.includes('"')) {
        return `"${strVal}"`;
      }
      return strVal;
    });
    csvRows.push(values.join(','));
  }

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
