const express = require('express');
const cors = require('cors');
const ExcelJS = require('exceljs');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Test endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Invoice generation endpoint
app.post('/api/generate-invoice', async (req, res) => {
  try {
    console.log('Received invoice generation request');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const { invoiceNumber, vendorName, vendorAddress, customerName, customerAddress, products } = req.body;
    
    // Validate required fields
    if (!vendorName) {
      return res.status(400).json({ error: 'Vendor name is required' });
    }
    
    if (!products || !Array.isArray(products)) {
      return res.status(400).json({ error: 'Products array is required' });
    }
    
    const date = new Date().toLocaleDateString();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Invoice');

    // Set column widths manually (no headers yet)
    worksheet.getColumn(1).width = 25; // Item Name
    worksheet.getColumn(2).width = 12; // Item Code
    worksheet.getColumn(3).width = 15; // Category
    worksheet.getColumn(4).width = 12; // HSN
    worksheet.getColumn(5).width = 15; // Packaging Type
    worksheet.getColumn(6).width = 20; // Quantity (wider for detailed calculation)
    worksheet.getColumn(7).width = 12; // Final Amount
    worksheet.getColumn(8).width = 15; // Purchase Price
    worksheet.getColumn(9).width = 10; // MRP
    worksheet.getColumn(10).width = 12; // Opening Stock

    let currentRow = 1;

    // Add title
    worksheet.getCell(`A${currentRow}`).value = 'INVOICE';
    worksheet.mergeCells(`A${currentRow}:J${currentRow}`);
    const titleCell = worksheet.getCell(`A${currentRow}`);
    titleCell.font = { bold: true, size: 18 };
    titleCell.alignment = { horizontal: 'center' };
    currentRow++;

    // Add invoice details
    worksheet.getCell(`A${currentRow}`).value = `Invoice Number: ${invoiceNumber}`;
    worksheet.mergeCells(`A${currentRow}:J${currentRow}`);
    currentRow++;
    
    worksheet.getCell(`A${currentRow}`).value = `Date: ${date}`;
    worksheet.mergeCells(`A${currentRow}:J${currentRow}`);
    currentRow++;

    // Add vendor details
    worksheet.getCell(`A${currentRow}`).value = 'Vendor Details:';
    worksheet.mergeCells(`A${currentRow}:J${currentRow}`);
    worksheet.getCell(`A${currentRow}`).font = { bold: true };
    currentRow++;
    
    worksheet.getCell(`A${currentRow}`).value = `Name: ${vendorName}`;
    worksheet.mergeCells(`A${currentRow}:J${currentRow}`);
    currentRow++;
    
    worksheet.getCell(`A${currentRow}`).value = `Address: ${vendorAddress || 'N/A'}`;
    worksheet.mergeCells(`A${currentRow}:J${currentRow}`);
    currentRow++;
    
    // Add customer details
    worksheet.getCell(`A${currentRow}`).value = 'Customer Details:';
    worksheet.mergeCells(`A${currentRow}:J${currentRow}`);
    worksheet.getCell(`A${currentRow}`).font = { bold: true };
    currentRow++;
    
    worksheet.getCell(`A${currentRow}`).value = `Name: ${customerName}`;
    worksheet.mergeCells(`A${currentRow}:J${currentRow}`);
    currentRow++;
    
    worksheet.getCell(`A${currentRow}`).value = `Address: ${customerAddress || 'N/A'}`;
    worksheet.mergeCells(`A${currentRow}:J${currentRow}`);
    currentRow++;

    // Add empty row for spacing
    currentRow++;

    // Add table headers
    const headers = ['Item Name', 'Item Code', 'Category', 'HSN', 'Packaging Type', 'Quantity', 'Final Amount', 'Purchase Price', 'MRP', 'Opening Stock'];
    headers.forEach((header, index) => {
      const cell = worksheet.getCell(`${String.fromCharCode(65 + index)}${currentRow}`);
      cell.value = header;
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
    });
    currentRow++;

    // Add products
    products.forEach(product => {
      const rowData = [
        product.itemName,
        product.itemCode || 'N/A',
        product.category || 'N/A',
        product.hsn || 'N/A',
        product.packagingType || 'simple',
        product.quantity || `${product.totalQuantity || 1} units`,
        parseFloat(product.total || product.finalAmount || 0), // Ensure number
        parseFloat(product.purchasePrice) || 0, // Ensure number, default to 0
        parseFloat(product.mrp) || 0, // Ensure number, default to 0  
        parseInt(product.openingStock) || 0 // Ensure integer, default to 0
      ];
      
      rowData.forEach((value, index) => {
        const cell = worksheet.getCell(`${String.fromCharCode(65 + index)}${currentRow}`);
        cell.value = value;
        
        // Format numeric columns as numbers
        if (index >= 6 && index <= 9 && typeof value === 'number') {
          cell.numFmt = index === 6 || index === 7 || index === 8 ? '#,##0.00' : '#,##0';
        }
      });
      currentRow++;
    });

    // Calculate and add total
    const totalAmount = products.reduce((sum, product) => {
      const amount = parseFloat(product.total || product.finalAmount || 0);
      return sum + amount;
    }, 0);
    
    // Add empty row before total
    currentRow++;
    
    // Add total row
    worksheet.getCell(`A${currentRow}`).value = 'Total Amount';
    worksheet.getCell(`G${currentRow}`).value = totalAmount;
    worksheet.getCell(`G${currentRow}`).numFmt = '#,##0.00'; // Format as currency
    worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
    worksheet.getCell(`A${currentRow}`).font = { bold: true };
    worksheet.getCell(`A${currentRow}`).alignment = { horizontal: 'right' };
    worksheet.getCell(`G${currentRow}`).font = { bold: true };
    
    // Style all cells
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        
        // Align numbers to right
        if (typeof cell.value === 'number') {
          cell.alignment = { horizontal: 'right' };
        }
      });
    });

    // Generate excel file
    const buffer = await workbook.xlsx.writeBuffer();
    
    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Invoice-${invoiceNumber}.xlsx`);
    
    // Send the file
    res.send(Buffer.from(buffer));

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error generating invoice. Please try again.' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Error generating invoice. Please try again.' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
