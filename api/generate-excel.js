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
    // Get invoice data from request
    const { invoiceData } = req.body;

    // Validate data
    if (!invoiceData || !invoiceData.products || invoiceData.products.length === 0) {
      return res.status(400).json({ error: 'No invoice data provided' });
    }

    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Invoice');

    // Set column widths
    worksheet.columns = [
      { header: 'Item Name', key: 'itemName', width: 20 },
      { header: 'Item Code', key: 'itemCode', width: 10 },
      { header: 'Packaging Type', key: 'packagingType', width: 15 },
      { header: 'Quantity', key: 'quantity', width: 12 },
      { header: 'Purchase Price', key: 'purchasePrice', width: 12 },
      { header: 'MRP', key: 'mrp', width: 10 },
      { header: 'Final Amount', key: 'finalAmount', width: 15 },
      { header: 'Opening Stock', key: 'openingStock', width: 15 }
    ];

    // Add invoice header
    if (invoiceData.vendorName) {
      worksheet.addRow([]);
      worksheet.addRow([`Vendor: ${invoiceData.vendorName}`]);
      worksheet.getCell('A2').font = { bold: true, size: 12 };
    }
    if (invoiceData.invoiceNumber) {
      worksheet.addRow([`Invoice: ${invoiceData.invoiceNumber}`]);
    }
    if (invoiceData.date) {
      worksheet.addRow([`Date: ${invoiceData.date}`]);
    }
    worksheet.addRow([]);

    // Add items
    invoiceData.products.forEach(item => {
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
    const totalAmount = invoiceData.products.reduce((sum, item) => sum + (parseFloat(item.finalAmount) || 0), 0);
    worksheet.addRow([]);
    const totalRow = worksheet.addRow(['', '', '', '', '', 'Total:', totalAmount]);
    totalRow.getCell('F').font = { bold: true };
    totalRow.getCell('G').font = { bold: true };
    totalRow.getCell('G').numFmt = '#,##0.00';

    // Style the header row
    const headerRow = worksheet.getRow(6);
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
