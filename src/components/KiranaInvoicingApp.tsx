import { useState } from 'react';
import { Plus, Trash2, Save, Download, Globe } from 'lucide-react';

const KiranaInvoicingApp = () => {
  const [language, setLanguage] = useState<'en' | 'hi'>('en'); // 'en' for English, 'hi' for Hindi
  
  // Initialize with 5 empty rows (keeping your requirement)
  const createEmptyItem = (id: number) => ({
    id,
    itemName: '',
    itemCode: '',
    category: '',
    hsn: '',
    mrp: '',
    purchasePrice: '',
    discountType: 'percentage',
    saleDiscount: '',
    openingStock: '',
    autoCalculateStock: true, // New field to control auto-calculation
    packagingType: 'simple',
    totalUnits: '', // For simple: total quantity, For others: boxes/cartons/pieces
    unitsPerPack: '', // For carton/pieces: units per pack, For boxPiecesPacks: pieces per box
    packsPerUnit: '', // New field for boxPiecesPacks: packs per piece
    finalAmount: ''
  });

  const [items, setItems] = useState(() => {
    return Array.from({ length: 5 }, (_, index) => createEmptyItem(index + 1));
  });

  const [vendorInfo, setVendorInfo] = useState({
    vendorName: '',
    vendorCode: '',
    invoiceNumber: `INV-${Date.now().toString().slice(-6)}`, // Auto-generate
    date: new Date().toISOString().split('T')[0]
  });

  const [loading, setLoading] = useState(false);

  // Translation object
  const translations = {
    en: {
      title: "Kirana Vendor Invoice",
      vendorName: "Vendor Name",
      vendorCode: "Vendor Code",
      invoiceNumber: "Invoice Number",
      date: "Date",
      itemName: "Item Name",
      itemCode: "Item Code",
      category: "Category",
      hsn: "HSN",
      packagingType: "Packaging Type",
      quantityDetails: "Quantity Details",
      finalAmount: "Final Amount",
      purchasePrice: "Purchase Price",
      mrp: "MRP",
      openingStock: "Opening Stock",
      action: "Action",
      addItem: "Add Item",
      saveAsJSON: "Save as JSON",
      generateExcel: "Generate Excel",
      totalAmount: "Total Amount",
      instructions: {
        title: "How to use this invoice generator:",
        step1: "Fill in vendor details (Vendor Name is required)",
        step2: "Add items: Enter item name, select packaging type, and specify quantities",
        step3: "Enter the final amount you paid for each item",
        step4: "Opening stock can be auto-calculated from quantities or entered manually - then click Generate Excel"
      },
      packagingTypes: {
        simple: { label: "Simple Quantity (no packs)", example: "e.g., 20 pieces only" },
        carton: { label: "Carton/Box with Packs", example: "e.g., 4 cartons × 5 packs each" },
        pieces: { label: "Pieces with Packs Inside", example: "e.g., 4 pieces × 30 packs each" },
        boxPiecesPacks: { label: "Box/Carton → Pieces → Packs", example: "e.g., 2 boxes × 12 pieces × 10 packs each" }
      },
      categories: ['Grocery', 'Beverages', 'Snacks', 'Personal Care', 'Household', 'Dairy', 'Frozen', 'Other'],
      placeholders: {
        vendorName: "Enter vendor name",
        vendorCode: "V001",
        invoiceNumber: "INV001",
        itemName: "Item name",
        code: "Code",
        hsn: "HSN",
        totalQuantity: "Total quantity",
        cartons: "Cartons",
        pieces: "Pieces",
        boxes: "Boxes",
        piecesPerBox: "Pieces per box",
        packsPerPiece: "Packs per piece",
        unitsPerPack: "Units per pack",
        amount: "₹ Amount",
        autoCalculated: "Auto-calculated",
        mrp: "MRP",
        stock: "Stock"
      },
      sharing: {
        title: "Export Options:",
        description: "Save as JSON for data backup or Generate Excel for professional invoices."
      },
      total: "Total",
      perUnit: "per unit"
    },
    hi: {
      title: "किराना विक्रेता चालान",
      vendorName: "विक्रेता का नाम",
      vendorCode: "विक्रेता कोड",
      invoiceNumber: "चालान संख्या",
      date: "दिनांक",
      itemName: "वस्तु का नाम",
      itemCode: "वस्तु कोड",
      category: "श्रेणी",
      hsn: "HSN",
      packagingType: "पैकेजिंग प्रकार",
      quantityDetails: "मात्रा विवरण",
      finalAmount: "अंतिम राशि",
      purchasePrice: "खरीद मूल्य",
      mrp: "MRP",
      openingStock: "शुरुआती स्टॉक",
      action: "कार्य",
      addItem: "वस्तु जोड़ें",
      saveAsJSON: "JSON के रूप में सहेजें",
      generateExcel: "Excel बनाएं",
      totalAmount: "कुल राशि",
      instructions: {
        title: "इस चालान जेनरेटर का उपयोग कैसे करें:",
        step1: "विक्रेता विवरण भरें (विक्रेता का नाम आवश्यक है)",
        step2: "वस्तुएं जोड़ें: वस्तु का नाम, पैकेजिंग प्रकार और मात्रा दर्ज करें",
        step3: "प्रत्येक वस्तु के लिए आपने जो अंतिम राशि का भुगतान किया है वह दर्ज करें",
        step4: "शुरुआती स्टॉक मात्रा से स्वचालित गणना या मैनुअल भरा जा सकता है - फिर Excel बनाएं पर क्लिक करें"
      },
      packagingTypes: {
        simple: { label: "सरल मात्रा (कोई पैक नहीं)", example: "जैसे, केवल 20 टुकड़े" },
        carton: { label: "कार्टन/बॉक्स के साथ पैक", example: "जैसे, 4 कार्टन × 5 पैक प्रत्येक" },
        pieces: { label: "टुकड़ों के अंदर पैक", example: "जैसे, 4 टुकड़े × 30 पैक प्रत्येक" },
        boxPiecesPacks: { label: "बॉक्स/कार्टन → टुकड़े → पैक", example: "जैसे, 2 बॉक्स × 12 टुकड़े × 10 पैक प्रत्येक" }
      },
      categories: ['किराना', 'पेय पदार्थ', 'स्नैक्स', 'व्यक्तिगत देखभाल', 'घरेलू', 'डेयरी', 'जमे हुए', 'अन्य'],
      placeholders: {
        vendorName: "विक्रेता का नाम दर्ज करें",
        vendorCode: "V001",
        invoiceNumber: "INV001",
        itemName: "वस्तु का नाम",
        code: "कोड",
        hsn: "HSN",
        totalQuantity: "कुल मात्रा",
        cartons: "कार्टन",
        pieces: "टुकड़े",
        boxes: "बॉक्स",
        piecesPerBox: "प्रति बॉक्स टुकड़े",
        packsPerPiece: "प्रति टुकड़े पैक",
        unitsPerPack: "प्रति पैक यूनिट",
        amount: "₹ राशि",
        autoCalculated: "स्वतः गणित",
        mrp: "MRP",
        stock: "स्टॉक"
      },
      sharing: {
        title: "निर्यात विकल्प:",
        description: "डेटा बैकअप के लिए JSON के रूप में सहेजें या पेशेवर चालान के लिए Excel बनाएं।"
      },
      total: "कुल",
      perUnit: "प्रति यूनिट"
    }
  };

  const t = translations[language];

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  const addItem = () => {
    const newId = Math.max(...items.map(item => item.id)) + 1;
    setItems([...items, createEmptyItem(newId)]);
  };

  const deleteItem = (id: number) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  // Calculate total quantity based on packaging type
  const calculateTotalQuantity = (item: any) => {
    const totalUnits = parseInt(item.totalUnits) || 0;
    const unitsPerPack = parseInt(item.unitsPerPack) || 1;
    const packsPerUnit = parseInt(item.packsPerUnit) || 1;
    
    switch (item.packagingType) {
      case 'simple':
        return totalUnits;
      case 'carton':
      case 'pieces':
        return totalUnits * unitsPerPack;
      case 'boxPiecesPacks':
        return totalUnits * unitsPerPack * packsPerUnit;
      default:
        return totalUnits;
    }
  };

  const updateItem = (id: number, field: string, value: string | boolean) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Auto-calculate opening stock when quantity-related fields change AND auto-calc is enabled
        if (['totalUnits', 'unitsPerPack', 'packsPerUnit', 'packagingType'].includes(field) && updatedItem.autoCalculateStock) {
          const totalQuantity = calculateTotalQuantity(updatedItem);
          updatedItem.openingStock = totalQuantity.toString();
        }
        
        // If toggling auto-calc ON, calculate immediately
        if (field === 'autoCalculateStock' && value === true) {
          const totalQuantity = calculateTotalQuantity(updatedItem);
          updatedItem.openingStock = totalQuantity.toString();
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => {
      const amount = parseFloat(item.finalAmount) || 0;
      return total + amount;
    }, 0).toFixed(2);
  };

  const calculatePurchasePrice = (item: any) => {
    const finalAmount = parseFloat(item.finalAmount) || 0;
    const totalQuantity = calculateTotalQuantity(item);

    if (totalQuantity > 0 && finalAmount > 0) {
      return (finalAmount / totalQuantity).toFixed(2);
    }
    return '0.00';
  };

  const saveAsJSON = () => {
    const data = {
      vendorInfo,
      items,
      total: calculateTotal(),
      exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice_${vendorInfo.invoiceNumber}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const generateExcel = async () => {
    if (!vendorInfo.vendorName.trim()) {
      alert('Please enter vendor name');
      return;
    }

    setLoading(true);
    try {
      // Prepare data in the format expected by the server
      const data = {
        invoiceNumber: vendorInfo.invoiceNumber,
        vendorName: vendorInfo.vendorName,
        vendorAddress: '', // Not in current form, but server expects it
        customerName: 'N/A', // Not in current form, but server expects it
        customerAddress: '', // Not in current form, but server expects it
        products: items.filter(item => item.itemName.trim()).map(item => {
          const totalQuantity = calculateTotalQuantity(item);
          let quantityDescription = '';
          
          switch (item.packagingType) {
            case 'simple':
              quantityDescription = `${item.totalUnits} units`;
              break;
            case 'carton':
              quantityDescription = `${item.totalUnits} cartons × ${item.unitsPerPack} units each`;
              break;
            case 'pieces':
              quantityDescription = `${item.totalUnits} pieces × ${item.unitsPerPack} units each`;
              break;
            case 'boxPiecesPacks':
              quantityDescription = `${item.totalUnits} boxes × ${item.unitsPerPack} pieces × ${item.packsPerUnit} packs each`;
              break;
            default:
              quantityDescription = `${item.totalUnits} units`;
          }
          
          return {
            itemName: item.itemName,
            itemCode: item.itemCode,
            category: item.category,
            hsn: item.hsn,
            packagingType: item.packagingType,
            quantity: quantityDescription,
            totalQuantity: totalQuantity,
            finalAmount: parseFloat(item.finalAmount) || 0,
            total: parseFloat(item.finalAmount) || 0,
            purchasePrice: calculatePurchasePrice(item),
            mrp: parseFloat(item.mrp) || 0,
            openingStock: parseInt(item.openingStock) || 0
          };
        })
      };

      // Use Vercel API route when deployed, fallback to local server for development
      const apiUrl = process.env.NODE_ENV === 'production' 
        ? '/api/generate-excel' 
        : 'http://localhost:3001/api/generate-invoice';
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to generate Excel');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice_${vendorInfo.invoiceNumber}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating Excel:', error);
      alert('Error generating Excel file. Please make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 font-inter">
      <div className="max-w-7xl mx-auto p-4">
        <div className="glass-effect rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header with Language Toggle */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 px-8 py-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-blue-600/20 backdrop-blur-sm"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-3">
                <h1 className="text-4xl font-bold font-poppins tracking-wide bg-gradient-to-r from-white to-indigo-100 bg-clip-text text-transparent drop-shadow-sm">{t.title}</h1>
                <button
                  onClick={toggleLanguage}
                  className="flex items-center gap-2 bg-white/20 backdrop-blur-lg text-white px-5 py-3 rounded-xl hover:bg-white/30 transition-all duration-300 font-medium border border-white/30 hover:scale-105 shadow-lg"
                >
                  <Globe size={18} />
                  {language === 'en' ? 'हिंदी' : 'English'}
                </button>
              </div>
              <p className="text-indigo-100 text-lg opacity-90 font-medium">Professional invoice generation for modern businesses</p>
            </div>
          </div>

          <div className="p-8">
            {/* Vendor Info */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-slate-800 font-poppins mb-6 flex items-center gap-3">
                <div className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full"></div>
                Vendor Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3 font-poppins">{t.vendorName}*</label>
                  <input
                    type="text"
                    value={vendorInfo.vendorName}
                    onChange={(e) => setVendorInfo({...vendorInfo, vendorName: e.target.value})}
                    className="w-full p-4 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 bg-white shadow-sm hover:border-indigo-300"
                    placeholder={t.placeholders.vendorName}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3 font-poppins">{t.vendorCode}</label>
                  <input
                    type="text"
                    value={vendorInfo.vendorCode}
                    onChange={(e) => setVendorInfo({...vendorInfo, vendorCode: e.target.value})}
                    className="w-full p-4 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 bg-white shadow-sm hover:border-indigo-300"
                    placeholder={t.placeholders.vendorCode}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3 font-poppins">{t.invoiceNumber}</label>
                  <input
                    type="text"
                    value={vendorInfo.invoiceNumber}
                    onChange={(e) => setVendorInfo({...vendorInfo, invoiceNumber: e.target.value})}
                    className="w-full p-4 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 bg-white shadow-sm hover:border-indigo-300"
                    placeholder={t.placeholders.invoiceNumber}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3 font-poppins">{t.date}</label>
                  <input
                    type="date"
                    value={vendorInfo.date}
                    onChange={(e) => setVendorInfo({...vendorInfo, date: e.target.value})}
                    className="w-full p-4 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 bg-white shadow-sm hover:border-indigo-300"
                  />
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-6 mb-8 shadow-lg">
              <h3 className="font-bold text-blue-900 mb-4 font-poppins flex items-center gap-3 text-lg">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white text-sm font-bold">i</span>
                </div>
                {t.instructions.title}
              </h3>
              <ol className="text-sm text-blue-800 space-y-3 ml-11 font-medium">
                <li className="flex items-start gap-2">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                  {t.instructions.step1}
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                  {t.instructions.step2}
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                  {t.instructions.step3}
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5">4</span>
                  {t.instructions.step4}
                </li>
              </ol>
            </div>

            {/* Items Table */}
            <div className="overflow-x-auto rounded-2xl border-2 border-slate-200 shadow-xl">
              <table className="w-full border-collapse bg-white">
                <thead>
                  <tr className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white">
                    <th className="p-5 text-left text-sm font-bold tracking-wide">{t.itemName}*</th>
                    <th className="p-5 text-left text-sm font-bold tracking-wide">{t.itemCode}</th>
                    <th className="p-5 text-left text-sm font-bold tracking-wide">{t.category}</th>
                    <th className="p-5 text-left text-sm font-bold tracking-wide">{t.hsn}</th>
                    <th className="p-5 text-left text-sm font-bold tracking-wide">{t.packagingType}</th>
                    <th className="p-5 text-left text-sm font-bold tracking-wide">{t.quantityDetails}</th>
                    <th className="p-5 text-left text-sm font-bold tracking-wide">{t.finalAmount}*</th>
                    <th className="p-5 text-left text-sm font-bold tracking-wide">{t.purchasePrice}</th>
                    <th className="p-5 text-left text-sm font-bold tracking-wide">{t.mrp}</th>
                    <th className="p-5 text-left text-sm font-bold tracking-wide">{t.openingStock}</th>
                    <th className="p-5 text-center text-sm font-bold tracking-wide">{t.action}</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={item.id} className={`hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50 transition-all duration-200 border-b border-slate-100 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                      {/* Item Name */}
                      <td className="p-4">
                        <input
                          type="text"
                          value={item.itemName}
                          onChange={(e) => updateItem(item.id, 'itemName', e.target.value)}
                          className="w-full p-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 bg-white hover:border-indigo-300"
                          placeholder={t.placeholders.itemName}
                        />
                      </td>

                      {/* Item Code */}
                      <td className="p-4">
                        <input
                          type="text"
                          value={item.itemCode}
                          onChange={(e) => updateItem(item.id, 'itemCode', e.target.value)}
                          className="w-full p-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 bg-white hover:border-indigo-300"
                          placeholder={t.placeholders.code}
                        />
                      </td>

                      {/* Category */}
                      <td className="p-4">
                        <select
                          value={item.category}
                          onChange={(e) => updateItem(item.id, 'category', e.target.value)}
                          className="w-full p-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 bg-white hover:border-indigo-300"
                        >
                          <option value="">Select</option>
                          {t.categories.map((cat: string) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </td>

                      {/* HSN */}
                      <td className="p-4">
                        <input
                          type="text"
                          value={item.hsn}
                          onChange={(e) => updateItem(item.id, 'hsn', e.target.value)}
                          className="w-full p-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 bg-white hover:border-indigo-300"
                          placeholder={t.placeholders.hsn}
                        />
                      </td>

                      {/* Packaging Type */}
                      <td className="p-4">
                        <select
                          value={item.packagingType}
                          onChange={(e) => updateItem(item.id, 'packagingType', e.target.value)}
                          className="w-full p-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 bg-white hover:border-indigo-300"
                        >
                          <option value="simple">{t.packagingTypes.simple.label}</option>
                          <option value="carton">{t.packagingTypes.carton.label}</option>
                          <option value="pieces">{t.packagingTypes.pieces.label}</option>
                          <option value="boxPiecesPacks">{t.packagingTypes.boxPiecesPacks.label}</option>
                        </select>
                      </td>

                      {/* Quantity Details */}
                      <td className="p-4">
                        <div className="space-y-3">
                          {item.packagingType === 'simple' ? (
                            <input
                              type="number"
                              value={item.totalUnits}
                              onChange={(e) => updateItem(item.id, 'totalUnits', e.target.value)}
                              className="w-full p-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 bg-white hover:border-indigo-300"
                              placeholder={t.placeholders.totalQuantity}
                            />
                          ) : item.packagingType === 'boxPiecesPacks' ? (
                            <>
                              <input
                                type="number"
                                value={item.totalUnits}
                                onChange={(e) => updateItem(item.id, 'totalUnits', e.target.value)}
                                className="w-full p-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 bg-white hover:border-indigo-300"
                                placeholder={t.placeholders.boxes}
                              />
                              <input
                                type="number"
                                value={item.unitsPerPack}
                                onChange={(e) => updateItem(item.id, 'unitsPerPack', e.target.value)}
                                className="w-full p-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 bg-white hover:border-indigo-300"
                                placeholder={t.placeholders.piecesPerBox}
                              />
                              <input
                                type="number"
                                value={item.packsPerUnit}
                                onChange={(e) => updateItem(item.id, 'packsPerUnit', e.target.value)}
                                className="w-full p-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 bg-white hover:border-indigo-300"
                                placeholder={t.placeholders.packsPerPiece}
                              />
                              <div className="text-xs text-green-600 font-medium bg-green-50 p-2 rounded">
                                Total: {calculateTotalQuantity(item)} units
                              </div>
                            </>
                          ) : (
                            <>
                              <input
                                type="number"
                                value={item.totalUnits}
                                onChange={(e) => updateItem(item.id, 'totalUnits', e.target.value)}
                                className="w-full p-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 bg-white hover:border-indigo-300"
                                placeholder={item.packagingType === 'carton' ? t.placeholders.cartons : t.placeholders.pieces}
                              />
                              <input
                                type="number"
                                value={item.unitsPerPack}
                                onChange={(e) => updateItem(item.id, 'unitsPerPack', e.target.value)}
                                className="w-full p-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 bg-white hover:border-indigo-300"
                                placeholder={t.placeholders.unitsPerPack}
                              />
                              <div className="text-xs text-green-600 font-medium bg-green-50 p-2 rounded">
                                Total: {calculateTotalQuantity(item)} units
                              </div>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Final Amount */}
                      <td className="p-3">
                        <input
                          type="number"
                          value={item.finalAmount}
                          onChange={(e) => updateItem(item.id, 'finalAmount', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                          placeholder={t.placeholders.amount}
                        />
                      </td>

                      {/* Purchase Price (Calculated) */}
                      <td className="p-3">
                        <div className="p-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800 font-medium">
                          ₹{calculatePurchasePrice(item)}
                          <div className="text-xs text-green-600">{t.perUnit}</div>
                        </div>
                      </td>

                      {/* MRP */}
                      <td className="p-3">
                        <input
                          type="number"
                          value={item.mrp}
                          onChange={(e) => updateItem(item.id, 'mrp', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                          placeholder={t.placeholders.mrp}
                        />
                      </td>

                      {/* Opening Stock - Auto/Manual Dropdown */}
                      <td className="p-4">
                        <div className="space-y-2">
                          {/* Mode selection dropdown */}
                          <select
                            value={item.autoCalculateStock ? 'auto' : 'manual'}
                            onChange={(e) => updateItem(item.id, 'autoCalculateStock', e.target.value === 'auto')}
                            className="w-full p-2 border-2 border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 bg-white"
                          >
                            <option value="auto">Auto</option>
                            <option value="manual">Manual</option>
                          </select>
                          
                          {/* Opening stock input/display */}
                          {item.autoCalculateStock ? (
                            <div className="p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800 font-medium text-center">
                              {item.openingStock || '0'}
                            </div>
                          ) : (
                            <input
                              type="number"
                              value={item.openingStock}
                              onChange={(e) => updateItem(item.id, 'openingStock', e.target.value)}
                              className="w-full p-2 border-2 border-slate-200 rounded-lg text-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 bg-white hover:border-indigo-300"
                              placeholder="Enter stock"
                            />
                          )}
                        </div>
                      </td>

                      {/* Action */}
                      <td className="p-3 text-center">
                        <button
                          onClick={() => deleteItem(item.id)}
                          disabled={items.length === 1}
                          className="text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed p-2 rounded-lg hover:bg-red-50 transition-all duration-200"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-6 mt-10">
              <button
                onClick={addItem}
                className="flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-8 py-4 rounded-2xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg font-semibold tracking-wide hover:shadow-green-500/25"
              >
                <Plus size={20} />
                {t.addItem}
              </button>
              
              <button
                onClick={saveAsJSON}
                className="flex items-center gap-3 bg-gradient-to-r from-slate-600 to-gray-700 text-white px-8 py-4 rounded-2xl hover:from-slate-700 hover:to-gray-800 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg font-semibold tracking-wide hover:shadow-gray-500/25"
              >
                <Save size={20} />
                {t.saveAsJSON}
              </button>

              <button
                onClick={generateExcel}
                disabled={loading || !vendorInfo.vendorName.trim()}
                className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-md font-semibold tracking-wide hover:shadow-blue-500/25"
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    <span>Generating...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Download size={20} />
                    <span>{t.generateExcel}</span>
                  </div>
                )}
              </button>
            </div>

            {/* Total */}
            <div className="mt-10 pt-8 border-t-2 border-slate-200">
              <div className="flex justify-end">
                <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-purple-50 border-2 border-indigo-200 p-8 rounded-2xl shadow-xl">
                  <div className="text-2xl font-bold text-indigo-900 font-poppins flex items-center gap-3">
                    <div className="w-3 h-8 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full"></div>
                    {t.totalAmount}: ₹{calculateTotal()}
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions for sharing */}
            <div className="mt-8 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6 shadow-lg">
              <h3 className="font-bold text-amber-800 mb-3 font-poppins text-lg flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white text-sm font-bold">💡</span>
                </div>
                {t.sharing.title}
              </h3>
              <p className="text-amber-700 font-medium">
                {t.sharing.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KiranaInvoicingApp;
