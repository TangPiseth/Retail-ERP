/**
 * Trigger a client-side CSV download.
 *
 * @param {string} filename  Name of the downloaded file (e.g. "customers.csv")
 * @param {string[]} headers Column titles
 * @param {Array<Array<string|number>>} rows  Rows of already-stringified cell values
 */
export function exportCsv(filename, headers, rows) {
  const escape = (value) => {
    const str = value === null || value === undefined ? '' : String(value);
    if (/[",\n\r]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines = [headers, ...rows].map((row) => row.map(escape).join(','));
  // Prepend BOM so Excel detects UTF-8 correctly.
  const csv = '﻿' + lines.join('\r\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
