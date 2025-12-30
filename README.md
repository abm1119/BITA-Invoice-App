# BITA Suite v3.0 | Khalid Bakers & Brothers
### The Integrated Vendor Management & Financial Ledger System

![Status](https://img.shields.io/badge/Status-Production-green) ![Stack](https://img.shields.io/badge/Stack-React%20%7C%20SQLite%20%7C%20Firebase-blue) ![AI](https://img.shields.io/badge/AI-Gemma%203%20Powered-purple)

**BITA (Bakery Intelligence & Tracking Assistant)** is a high-performance, local-first web application engineered specifically for **Khalid Bakers & Brothers**. It combines the speed of an embedded SQL database with the security of cloud synchronization, ensuring that your financial data is both instant and indestructible.

---

## 🏛️ System Architecture

BITA v3.0 utilizes a **Local-First Cloud-Sync** architecture. This means the application runs entirely on your device for zero-latency operations, while silently synchronizing a binary backup of your entire database to the cloud.

![System Architecture](/architecture_diagram.png)

---

## ✨ Core Modules

### 1. 📊 Business Hub (Dashboard)
The command center for bakery leadership.
- **Real-time Metrics**: Tracks total outstanding dues, monthly expenditure, and vendor volume.
- **Visual Analytics**: Area charts visualizing spending trends over time.
- **Critical Alerts**: Automatically highlights "Outstanding" invoices that require immediate attention.

### 2. 🤝 Vendor Directory
A comprehensive CRM for wholesale partners.
- **Onboarding**: Rapidly register new flour, sugar, or dairy suppliers.
- **Management**: Archive old partners or update contact details.
- **Direct Links**: One-click access to email and phone contacts.

### 3. 📜 Ledger Book (Invoices)
The financial heart of the system.
- **Smart Statusing**: Automatically tags invoices as `UNPAID`, `PARTIAL`, or `PAID` based on settled amounts.
- **Deep Itemization**: Stores granular line-item details (Quantity, Unit Price, Subtotal) for every invoice.
- **Audit History**: Maintains exact issue dates and payment confirmation dates.

### 4. 📷 Smart Scan (Powered by Gemma 3)
Next-generation OCR technology.
- **One-Click Digitization**: Upload or capture an invoice image.
- **AI Extraction**: Uses Google's **Gemma 3** model to extract Vendor Name, Totals, Dates, and Line Items.
- **Auto-Mapping**: Intelligently links scanned invoices to existing vendors in your directory.

### 5. ⚙️ Executive Settings
Identity and access management.
- **Profile Signature**: Customize your executive display name.
- **Security**: Force-reset access tokens (passwords) or request recovery emails.
- **Data Control**: complete account termination protocols.

---

## 🛠️ Technical Documentation

### Project Structure
The codebase is organized for scalability and maintenance.

```
/
├── src/
│   ├── components/       # UI Modules (Dashboard, Vendors, etc.)
│   ├── services/         # Core Logic Adapters
│   │   ├── sqliteService.ts      # WASM Database Engine
│   │   ├── persistenceService.ts # IndexedDB Binary Layer
│   │   ├── syncService.ts        # Cloud Backup/Restore logic
│   │   ├── firebaseService.ts    # Auth & Legacy connections
│   │   └── geminiService.ts      # AI OCR Integration
│   ├── App.tsx           # Main Application Controller
│   ├── firebase.ts       # Firebase Initialization
│   └── types.ts          # TypeScript Definitions
├── public/               # Static Assets (Logos, Icons)
└── index.html            # Application Entry Point
```

### Key Services Table
| Service | Functionality |
| :--- | :--- |
| **`sqliteService`** | Manages the in-memory SQL database. Handles all CRUD operations using simple SQL queries. |
| **`persistenceService`** | Uses `IndexedDB` to store the raw SQLite binary file (`.sqlite`) locally, overcoming `localStorage` size limits. |
| **`syncService`** | Converts the SQLite binary to Base64 and pushes it to Firebase Realtime Database under the user's UID. |
| **`geminiService`** | Interfaces with the Google GenAI SDK to send images to the Gemma 3 model for analysis. |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- NPM or Yarn

### Installation

1. **Clone the Legacy Repository**
   ```bash
   git clone https://github.com/khalid-bakers/bita-suite.git
   cd bita-suite
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env.local` file in the root directory:
   ```env
   VITE_FIREBASE_API_KEY=your_key
   VITE_FIREBASE_AUTH_DOMAIN=your_domain
   VITE_GEMINI_API_KEY=your_ai_key
   ```

4. **Launch Development Server**
   ```bash
   npm run dev
   ```

---

## 📖 User Guide

### How to Manually Add an Invoice
1. Navigate to the **"Ledger Book"**.
2. Click **"+ Register Manual Invoice"**.
3. Select an existing vendor or create a new one on the fly.
4. Enter the `Invoice #`, `Issue Date`, and add `Line Items`.
5. Click **"Register Ledger Entry"**. *The system will auto-sync.*

### How to Settle a Payment
1. Go to the **"Ledger Book"**.
2. Find the invoice with `UNPAID` or `PARTIAL` status.
3. In the **"Settled Amount"** column, enter the amount paid.
4. (Optional) Set the specific **"Paid Date"**.
5. The status badge will automatically update to `PAID` (Green) or `PARTIAL` (Yellow).

### How to Use AI Scan
1. Go to the **"Smart Scan"** tab.
2. Click **"Upload Invoice"** or **"Use Camera"**.
3. Wait for the **"Deciphering Ledger..."** animation.
4. Review the extracted JSON data.
5. Select the correct Vendor from the dropdown (or let AI auto-match).
6. Click **"Integrate into Database"**.

---

## 🔒 Security & Privacy
- **Isolation**: Each user's data is sandboxed within their Firebase path (`/users/{uid}/`).
- **Encryption**: Data in transit is secured via HTTPS. Local data involves binary storage accessible only by the application context.
- **Ownership**: You own your data. The **"Delete Account"** function in Settings permanently wipes your cloud backups.

---

> **Khalid Bakers & Brothers** • *Est. 1998*  
> Powered by BITA Suite v3.0 | Local-First • Cloud-Synced • AI-Enhanced
