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

    // Set column widths
    worksheet.columns = [
      { header: 'Item Name', key: 'itemName', width: 20 },
      { header: 'Item Code', key: 'itemCode', width: 12 },
      { header: 'Packaging Type', key: 'packagingType', width: 15 },
      { header: 'Quantity', key: 'quantity', width: 15 },
      { header: 'Purchase Price', key: 'purchasePrice', width: 15 },
      { header: 'MRP', key: 'mrp', width: 12 },
      { header: 'Final Amount', key: 'finalAmount', width: 15 },
      { header: 'Opening Stock', key: 'openingStock', width: 15 }
    ];

    // Add invoice header
    if (data.vendorName) {
      worksheet.addRow([]);
      worksheet.addRow([`Vendor: ${data.vendorName}`]);
      worksheet.getCell('A2').font = { bold: true, size: 12 };
    }
    if (data.invoiceNumber) {
      worksheet.addRow([`Invoice: ${data.invoiceNumber}`]);
    }
    worksheet.addRow([]);

    // Get the header row number (depends on whether we added vendor info)
    const headerRowNumber = data.vendorName ? 5 : 2;

    // Add items
    items.forEach(item => {
      const row = worksheet.addRow({
        itemName: item.itemName || '',
        itemCode: item.itemCode || '',
        packagingType: item.packagingType || '',
        quantity: item.quantity || '',
        purchasePrice: typeof item.purchasePrice === 'number' ? item.purchasePrice : parseFloat(item.purchasePrice) || 0,
        mrp: typeof item.mrp === 'number' ? item.mrp : parseFloat(item.mrp) || 0,
        finalAmount: typeof item.finalAmount === 'number' ? item.finalAmount : parseFloat(item.finalAmount) || 0,
        openingStock: typeof item.openingStock === 'number' ? item.openingStock : parseFloat(item.openingStock) || 0
      });

      // Format number columns
      row.getCell('purchasePrice').numFmt = '#,##0.00';
      row.getCell('mrp').numFmt = '#,##0.00';
      row.getCell('finalAmount').numFmt = '#,##0.00';
      row.getCell('openingStock').numFmt = '#,##0.00';
    });

    // Add totals
    const totalAmount = items.reduce((sum, item) => sum + (parseFloat(item.finalAmount) || 0), 0);
    worksheet.addRow([]);
    const totalRow = worksheet.addRow(['', '', '', '', '', '', 'Total:', totalAmount]);
    totalRow.getCell('G').font = { bold: true };
    totalRow.getCell('H').font = { bold: true };
    totalRow.getCell('H').numFmt = '#,##0.00';

    // Style the header row
    const headerRow = worksheet.getRow(headerRowNumber);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

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
