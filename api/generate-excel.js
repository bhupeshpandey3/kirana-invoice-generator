// Import ExcelJS library
const ExcelJS = require('exceljs');

// Export handler function for Vercel serverless
module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get invoice data from request - handle both old and new formats
    let data = req.body;
    
    // If the data comes wrapped in invoiceData, unwrap it
    if (data.invoiceData) {
      data = data.invoiceData;
    }

    // Validate data - check for both 'products' and 'items' arrays for compatibility
    const items = data.products || data.items || [];
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No invoice data provided' });
    }

    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Invoice');

    // Set column widths for proper formatting
    worksheet.columns = [
      { width: 15 }, // A
      { width: 12 }, // B
      { width: 12 }, // C
      { width: 10 }, // D
      { width: 15 }, // E
      { width: 20 }, // F
      { width: 15 }, // G
      { width: 15 }, // H
      { width: 12 }, // I
      { width: 15 }  // J
    ];

    let currentRow = 1;

    // Add main title
    worksheet.mergeCells('A1:J1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'INVOICE';
    titleCell.font = { bold: true, size: 16 };
    titleCell.alignment = { horizontal: 'center' };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    currentRow = 2;

    // Add invoice details
    worksheet.getCell(`A${currentRow}`).value = `Invoice Number: ${data.invoiceNumber || 'N/A'}`;
    worksheet.getCell(`A${currentRow}`).font = { bold: true };
    currentRow++;

    worksheet.getCell(`A${currentRow}`).value = `Date: ${new Date().toLocaleDateString()}`;
    worksheet.getCell(`A${currentRow}`).font = { bold: true };
    currentRow++;

    // Add vendor details
    currentRow++;
    worksheet.getCell(`A${currentRow}`).value = 'Vendor Details:';
    worksheet.getCell(`A${currentRow}`).font = { bold: true };
    currentRow++;

    worksheet.getCell(`A${currentRow}`).value = `Name: ${data.vendorName || 'N/A'}`;
    currentRow++;

    worksheet.getCell(`A${currentRow}`).value = `Address: N/A`;
    currentRow++;

    // Add customer details
    worksheet.getCell(`A${currentRow}`).value = 'Customer Details:';
    worksheet.getCell(`A${currentRow}`).font = { bold: true };
    currentRow++;

    worksheet.getCell(`A${currentRow}`).value = `Name: N/A`;
    currentRow++;

    worksheet.getCell(`A${currentRow}`).value = `Address: N/A`;
    currentRow += 2;

    // Add table headers
    const headers = ['Item Name', 'Item Code', 'Category', 'HSN', 'Packaging Type', 'Quantity', 'Final Amount', 'Purchase Price', 'MRP', 'Opening Stock'];
    headers.forEach((header, index) => {
      const cell = worksheet.getCell(currentRow, index + 1);
      cell.value = header;
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    currentRow++;

    // Add items data
    items.forEach(item => {
      const rowData = [
        item.itemName || '',
        item.itemCode || 'N/A',
        item.category || '',
        item.hsn || '',
        item.packagingType || '',
        item.quantity || '',
        typeof item.finalAmount === 'number' ? item.finalAmount : parseFloat(item.finalAmount) || 0,
        typeof item.purchasePrice === 'number' ? item.purchasePrice : parseFloat(item.purchasePrice) || 0,
        typeof item.mrp === 'number' ? item.mrp : parseFloat(item.mrp) || 0,
        typeof item.openingStock === 'number' ? item.openingStock : parseFloat(item.openingStock) || 0
      ];

      rowData.forEach((value, index) => {
        const cell = worksheet.getCell(currentRow, index + 1);
        cell.value = value;
        
        // Format number columns
        if (index >= 6 && index <= 9 && typeof value === 'number') {
          cell.numFmt = '#,##0.00';
        }
        
        // Add borders
        cell.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
      currentRow++;
    });

    // Add empty row
    currentRow++;

    // Add total
    const totalAmount = items.reduce((sum, item) => sum + (parseFloat(item.finalAmount) || 0), 0);
    worksheet.getCell(`F${currentRow}`).value = 'Total Amount';
    worksheet.getCell(`F${currentRow}`).font = { bold: true };
    worksheet.getCell(`G${currentRow}`).value = totalAmount;
    worksheet.getCell(`G${currentRow}`).font = { bold: true };
    worksheet.getCell(`G${currentRow}`).numFmt = '#,##0.00';

    // Generate Excel buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=invoice.xlsx');
    res.setHeader('Content-Length', buffer.length);

    // Send the Excel file
    res.send(Buffer.from(buffer));

  } catch (error) {
    console.error('Error generating Excel:', error);
    res.status(500).json({ error: 'Failed to generate Excel file', details: error.message });
  }
};
