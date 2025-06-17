const ExcelJS = require('exceljs');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { invoiceData } = req.body;

    if (!invoiceData || !invoiceData.items || invoiceData.items.length === 0) {
      return res.status(400).json({ error: 'No invoice data provided' });
    }

    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Invoice');

    // Set column widths
    worksheet.columns = [
      { header: 'Item Name', key: 'itemName', width: 20 },
      { header: 'Packaging Type', key: 'packagingType', width: 15 },
      { header: 'Quantity Details', key: 'quantityDetails', width: 15 },
      { header: 'Rate', key: 'rate', width: 10 },
      { header: 'Amount', key: 'amount', width: 12 },
      { header: 'Discount %', key: 'discount', width: 12 },
      { header: 'Final Amount', key: 'finalAmount', width: 15 },
      { header: 'Opening Stock', key: 'openingStock', width: 15 }
    ];

    // Add invoice header
    if (invoiceData.shopName) {
      worksheet.addRow([]);
      worksheet.addRow([invoiceData.shopName]);
      worksheet.getCell('A2').font = { bold: true, size: 16 };
    }
    if (invoiceData.customerName) {
      worksheet.addRow([`Customer: ${invoiceData.customerName}`]);
    }
    if (invoiceData.date) {
      worksheet.addRow([`Date: ${invoiceData.date}`]);
    }
    worksheet.addRow([]);

    // Add items
    invoiceData.items.forEach(item => {
      const row = worksheet.addRow({
        itemName: item.itemName || '',
        packagingType: item.packagingType || '',
        quantityDetails: item.quantityDetails || '',
        rate: typeof item.rate === 'number' ? item.rate : parseFloat(item.rate) || 0,
        amount: typeof item.amount === 'number' ? item.amount : parseFloat(item.amount) || 0,
        discount: typeof item.discount === 'number' ? item.discount : parseFloat(item.discount) || 0,
        finalAmount: typeof item.finalAmount === 'number' ? item.finalAmount : parseFloat(item.finalAmount) || 0,
        openingStock: typeof item.openingStock === 'number' ? item.openingStock : parseFloat(item.openingStock) || 0
      });

      // Format number columns
      row.getCell('rate').numFmt = '#,##0.00';
      row.getCell('amount').numFmt = '#,##0.00';
      row.getCell('discount').numFmt = '#,##0.00';
      row.getCell('finalAmount').numFmt = '#,##0.00';
      row.getCell('openingStock').numFmt = '#,##0.00';
    });

    // Add totals
    const totalAmount = invoiceData.items.reduce((sum, item) => sum + (parseFloat(item.finalAmount) || 0), 0);
    worksheet.addRow([]);
    const totalRow = worksheet.addRow(['', '', '', '', '', '', 'Total:', totalAmount]);
    totalRow.getCell('G').font = { bold: true };
    totalRow.getCell('H').font = { bold: true };
    totalRow.getCell('H').numFmt = '#,##0.00';

    // Style the header row
    const headerRow = worksheet.getRow(invoiceData.shopName ? 6 : 2);
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
    res.send(buffer);

  } catch (error) {
    console.error('Error generating Excel:', error);
    res.status(500).json({ error: 'Failed to generate Excel file', details: error.message });
  }
}
