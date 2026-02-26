"use client";

import * as XLSX from "xlsx";

export default function ExportButton() {
  const exportExcel = () => {
    const data = [
      { Name: "Alice", Age: 25 },
      { Name: "Bob", Age: 30 },
    ];

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, "data.xlsx");
  };

  return <button onClick={exportExcel}>Export Excel</button>;
}
