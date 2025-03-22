
/**
 * Converts an array of objects to CSV format
 * @param data Array of objects to convert
 * @param headers Optional custom headers (keys will be used if not provided)
 * @returns CSV formatted string
 */
export const convertToCSV = <T extends Record<string, any>>(
  data: T[],
  headers?: Partial<Record<keyof T, string>>
): string => {
  if (data.length === 0) return '';
  
  const keys = Object.keys(data[0]) as Array<keyof T>;
  
  // Create header row
  let csvContent = '';
  if (headers) {
    csvContent = keys.map(key => headers[key] || String(key)).join(',') + '\n';
  } else {
    csvContent = keys.join(',') + '\n';
  }
  
  // Add data rows
  data.forEach(item => {
    const row = keys.map(key => {
      const value = item[key];
      // Handle strings with commas by wrapping in quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value === null || value === undefined ? '' : String(value);
    });
    csvContent += row.join(',') + '\n';
  });
  
  return csvContent;
};

/**
 * Triggers a file download with the given content
 * @param content Content to download
 * @param fileName Name of the file to download
 * @param mimeType MIME type of the file
 */
export const downloadFile = (
  content: string,
  fileName: string,
  mimeType: string = 'text/csv;charset=utf-8;'
): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Exports data to CSV and triggers download
 * @param data Data to export
 * @param fileName Name of the file to download
 * @param headers Optional custom headers
 */
export const exportToCSV = <T extends Record<string, any>>(
  data: T[],
  fileName: string,
  headers?: Partial<Record<keyof T, string>>
): void => {
  const csvContent = convertToCSV(data, headers);
  downloadFile(csvContent, fileName);
};
