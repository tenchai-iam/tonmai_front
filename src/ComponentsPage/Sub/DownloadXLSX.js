import XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";

export const downloadSummaryDistrict = ({
  data,
  headers,
  fileName,
  title,
  extraInfoRows = [],
  dateInfo,
}) => {
  extraInfoRows = title ? [title, ...extraInfoRows] : extraInfoRows;

  const formattedData = data.map((item) =>
    headers.reduce((acc, header) => {
      acc[header.label] = item[header.key];
      return acc;
    }, {})
  );

  const extraRowsAbove = Array(extraInfoRows.length).fill({});
  const extraRowsBelow = Array(2).fill({});

  const headerRow = headers.reduce((acc, header) => {
    acc[header.label] = header.label;
    return acc;
  }, {});

  const fullData = [
    ...extraRowsAbove,
    headerRow,
    ...formattedData,
    ...extraRowsBelow,
  ];

  const worksheet = XLSX.utils.json_to_sheet(fullData, { skipHeader: true });
  const workbook = XLSX.utils.book_new();

  // Merge cells for title and info
  const numCols = headers.length;
  const merges = extraInfoRows.map((_, idx) => ({
    s: { r: idx, c: 0 },
    e: { r: idx, c: numCols - 1 },
  }));
  merges.push({
    s: { r: fullData.length - 1, c: 0 },
    e: { r: fullData.length - 1, c: numCols - 1 },
  });
  worksheet["!merges"] = merges;

  // Add info content
  extraInfoRows.forEach((text, idx) => {
    worksheet[`A${idx + 1}`] = { v: text };
  });

  // // Add timestamp
  // worksheet[`A${fullData.length}`] = {
  //   v: `ข้อมูล ณ วันที่ ${dateInfo?.day || "-"} / ${dateInfo?.month || "-"} / ${
  //     dateInfo?.year || "-"
  //   } เวลา 0${dateInfo?.hour}:${dateInfo?.minute}0 น.`,
  // };

  // Style header
  const headerRowIndex = extraInfoRows.length;
  headers.forEach((header, C) => {
    const cell = XLSX.utils.encode_cell({ r: headerRowIndex, c: C });
    if (!worksheet[cell]) worksheet[cell] = { v: header.label };
    worksheet[cell].s = {
      font: { bold: true },
      alignment: { horizontal: "center", vertical: "center", wrapText: true },
      fill: { fgColor: { rgb: "D9D9D9" } },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } },
      },
    };
  });

  // Style data
  for (
    let R = headerRowIndex + 1;
    R < fullData.length - extraRowsBelow.length;
    R++
  ) {
    for (let C = 0; C < headers.length; ++C) {
      const cell = XLSX.utils.encode_cell({ r: R, c: C });
      if (!worksheet[cell]) continue;

      worksheet[cell].s = {
        alignment: {
          horizontal: C === 1 ? "left" : "right",
          vertical: "center",
          wrapText: true,
        },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } },
        },
      };
    }
  }

  // Auto width
  worksheet["!cols"] = headers.map((header) => {
    const maxLength = Math.max(
      header.label.length,
      ...formattedData.map((row) => row[header.label]?.toString().length || 0)
    );
    return { wch: maxLength + 2 };
  });

  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  const xlsxData = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([xlsxData], { type: "application/octet-stream" });
  saveAs(blob, `${fileName}.xlsx`);
};

export const downloadTable = ({
  data,
  headers,
  fileName,
  title,
  extraInfoRows = [],
  dateInfo,
}) => {
  extraInfoRows = title ? [title, ...extraInfoRows] : extraInfoRows;

  const formattedData = data.map((item) =>
    headers.reduce((acc, header) => {
      acc[header.label] = item[header.key];
      return acc;
    }, {})
  );

  const extraRowsAbove = Array(extraInfoRows.length).fill({});
  const extraRowsBelow = Array(2).fill({});

  const headerRow = headers.reduce((acc, header) => {
    acc[header.label] = header.label;
    return acc;
  }, {});

  const fullData = [
    ...extraRowsAbove,
    headerRow,
    ...formattedData,
    ...extraRowsBelow,
  ];

  const worksheet = XLSX.utils.json_to_sheet(fullData, { skipHeader: true });
  const workbook = XLSX.utils.book_new();

  // Merge cells for title and info
  const numCols = headers.length;
  const merges = extraInfoRows.map((_, idx) => ({
    s: { r: idx, c: 0 },
    e: { r: idx, c: numCols - 1 },
  }));
  merges.push({
    s: { r: fullData.length - 1, c: 0 },
    e: { r: fullData.length - 1, c: numCols - 1 },
  });
  worksheet["!merges"] = merges;

  // Add info content
  extraInfoRows.forEach((text, idx) => {
    worksheet[`A${idx + 1}`] = { v: text };
  });

  // // Add timestamp
  // worksheet[`A${fullData.length}`] = {
  //   v: `ข้อมูล ณ วันที่ ${dateInfo?.day || "-"} / ${dateInfo?.month || "-"} / ${
  //     dateInfo?.year || "-"
  //   } เวลา 0${dateInfo?.hour}:${dateInfo?.minute}0 น.`,
  // };

  // Style header
  const headerRowIndex = extraInfoRows.length;
  headers.forEach((header, C) => {
    const cell = XLSX.utils.encode_cell({ r: headerRowIndex, c: C });
    if (!worksheet[cell]) worksheet[cell] = { v: header.label };
    worksheet[cell].s = {
      font: { bold: true },
      alignment: { horizontal: "center", vertical: "center", wrapText: true },
      fill: { fgColor: { rgb: "D9D9D9" } },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } },
      },
    };
  });

  // Style data
  for (
    let R = headerRowIndex + 1;
    R < fullData.length - extraRowsBelow.length;
    R++
  ) {
    for (let C = 0; C < headers.length; ++C) {
      const cell = XLSX.utils.encode_cell({ r: R, c: C });
      if (!worksheet[cell]) continue;

      worksheet[cell].s = {
        alignment: {
          horizontal: C === 1 ? "left" : "right",
          vertical: "center",
          wrapText: true,
        },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } },
        },
      };
    }
  }

  // Auto width
  worksheet["!cols"] = headers.map((header) => {
    const maxLength = Math.max(
      header.label.length,
      ...formattedData.map((row) => row[header.label]?.toString().length || 0)
    );
    return { wch: maxLength + 2 };
  });

  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  const xlsxData = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([xlsxData], { type: "application/octet-stream" });
  saveAs(blob, `${fileName}.xlsx`);
};

export const downloadMeterDetail = ({
  data,
  headers,
  fileName,
  title,
  extraInfoRows = [],
  dateInfo,
}) => {
  extraInfoRows = title ? [title, ...extraInfoRows] : extraInfoRows;

  // Convert raw data to formatted object where keys are column labels
  const formattedData = data.map((item) =>
    headers.reduce((acc, header) => {
      acc[header.label] = item[header.key];
      return acc;
    }, {})
  );

  // Add empty rows above the header (for optional title/info)
  const extraRowsAbove = Array(extraInfoRows.length).fill({});

  // Add empty rows below the data (for optional footer or timestamp)
  const extraRowsBelow = Array(2).fill({});

  // Create header row object (keys and values are both labels for clarity)
  const headerRow = headers.reduce((acc, header) => {
    acc[header.label] = header.label;
    return acc;
  }, {});

  // Combine everything into one array for export
  const fullData = [
    ...extraRowsAbove,
    headerRow,
    ...formattedData,
    ...extraRowsBelow,
  ];

  // Create worksheet and workbook from the data
  const worksheet = XLSX.utils.json_to_sheet(fullData, { skipHeader: true });
  const workbook = XLSX.utils.book_new();

  // Merge cells for info rows and footer row
  const numCols = headers.length;
  const merges = extraInfoRows.map((_, idx) => ({
    s: { r: idx, c: 0 },
    e: { r: idx, c: numCols - 1 },
  }));
  merges.push({
    s: { r: fullData.length - 1, c: 0 },
    e: { r: fullData.length - 1, c: numCols - 1 },
  });
  worksheet["!merges"] = merges;

  // Add text content to the info rows above the table (title, notes, etc.)
  extraInfoRows.forEach((text, idx) => {
    worksheet[`A${idx + 1}`] = { v: text };
  });

  // Optional: Add timestamp info to the last row (currently commented out)
  /*
  worksheet[`A${fullData.length}`] = {
    v: `ข้อมูล ณ วันที่ ${dateInfo?.day || "-"} / ${dateInfo?.month || "-"} / ${
      dateInfo?.year || "-"
    } เวลา 0${dateInfo?.hour}:${dateInfo?.minute}0 น.`,
  };
  */

  // Style the header row: bold font, centered text, grey background, and borders
  const headerRowIndex = extraInfoRows.length;
  headers.forEach((header, C) => {
    const cell = XLSX.utils.encode_cell({ r: headerRowIndex, c: C });
    if (!worksheet[cell]) worksheet[cell] = { v: header.label };
    worksheet[cell].s = {
      font: { bold: true },
      alignment: { horizontal: "center", vertical: "center", wrapText: true },
      fill: { fgColor: { rgb: "D9D9D9" } },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } },
      },
    };
  });

  // Style all data cells (after header): align left for col index 1, others right; add borders
  for (
    let R = headerRowIndex + 1;
    R < fullData.length - extraRowsBelow.length;
    R++
  ) {
    const dataRow = data[R - (headerRowIndex + 1)]; // ← use original data here
    const isAnomaly = dataRow?.anomaly == 1;

    for (let C = 0; C < headers.length; ++C) {
      const cell = XLSX.utils.encode_cell({ r: R, c: C });
      if (!worksheet[cell]) continue;

      worksheet[cell].s = {
        alignment: {
          horizontal: C === 0 ? "left" : "right",
          vertical: "center",
          wrapText: true,
        },
        fill: isAnomaly
          ? { fgColor: { rgb: "FFCCCC" } } // light red background
          : undefined,
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } },
        },
      };
    }
  }

  // Automatically set column widths based on max label/data length
  worksheet["!cols"] = headers.map((header) => {
    const maxLength = Math.max(
      header.label.length,
      ...formattedData.map((row) => row[header.label]?.toString().length || 0)
    );
    return { wch: maxLength + 2 };
  });

  // Finalize and download the Excel file
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  const xlsxData = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([xlsxData], { type: "application/octet-stream" });
  saveAs(blob, `${fileName}.xlsx`);
};