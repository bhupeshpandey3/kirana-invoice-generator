# Kirana Invoice Generator

A modern, bilingual invoice generation application designed for Kirana-style businesses. This app allows users to create professional invoices with advanced packaging calculations and export them as Excel files or JSON data.

## Features

- **Bilingual Support**: Switch between English and Hindi
- **Advanced Packaging Logic**: Support for simple quantities, cartons, and piece-based packaging
- **Auto-calculations**: Purchase price calculated automatically based on quantity and final amount
- **Export Options**: 
  - Generate professional Excel invoices
  - Save invoice data as JSON for backup
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Calculations**: Live updates for totals and per-unit pricing

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development servers:

Backend server:
```bash
node server/server.js
```

Frontend (in a new terminal):
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## Usage

1. **Vendor Information**: Enter vendor details including name, code, invoice number, and date
2. **Add Items**: Use the table to add invoice items with packaging details
3. **Packaging Types**:
   - **Simple**: Direct quantity entry
   - **Carton/Box**: Specify cartons and items per carton
   - **Pieces**: Specify pieces and packs per piece
4. **Export**: Generate Excel files or save as JSON

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express.js
- **Excel Generation**: ExcelJS
- **Icons**: Lucide React

## Project Structure

```
├── src/
│   ├── components/
│   │   └── KiranaInvoicingApp.tsx    # Main application component
│   ├── App.tsx                       # App wrapper
│   ├── main.tsx                      # Entry point
│   └── index.css                     # Global styles
├── server/
│   └── server.js                     # Express server for Excel generation
├── public/                           # Static assets
└── package.json                      # Dependencies and scripts
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `node server/server.js` - Start backend server

## License

MIT
