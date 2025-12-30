import initSqlJs from 'sql.js';
import { Vendor, Invoice, PaymentStatus } from '../types';
import { persistenceService } from './persistenceService';

let db: any = null;
const SQL_WASM_URL = 'https://sql.js.org/dist/sql-wasm.wasm';

export const sqliteService = {
    init: async (initialData?: Uint8Array) => {
        if (db && !initialData) return; // Already initialized

        const initSqlJsFunc = (initSqlJs as any).default || initSqlJs;
        const SQL = await initSqlJsFunc({
            locateFile: () => SQL_WASM_URL
        });

        if (initialData) {
            db = new SQL.Database(initialData);
        } else {
            const saved = await persistenceService.loadDB();
            if (saved) {
                db = new SQL.Database(saved);
            } else {
                db = new SQL.Database();
                sqliteService.createTables();
            }
        }
    },

    createTables: () => {
        if (!db) return;
        db.run(`
      CREATE TABLE IF NOT EXISTS vendors (
        id TEXT PRIMARY KEY,
        name TEXT,
        contactPerson TEXT,
        phone TEXT,
        email TEXT
      );
      CREATE TABLE IF NOT EXISTS invoices (
        id TEXT PRIMARY KEY,
        vendorId TEXT,
        invoiceNumber TEXT,
        issueDate TEXT,
        paymentDate TEXT,
        totalAmount REAL,
        paidAmount REAL,
        status TEXT,
        lineItems TEXT
      );
    `);
        sqliteService.persist();
    },

    persist: async () => {
        if (!db) return;
        const data = db.export();
        await persistenceService.saveDB(data);
        return data;
    },

    getVendors: async (): Promise<Vendor[]> => {
        if (!db) await sqliteService.init();
        const res = db.exec("SELECT * FROM vendors");
        if (res.length === 0) return [];
        const columns = res[0].columns;
        return res[0].values.map((row: any) => {
            const v: any = {};
            columns.forEach((col: string, i: number) => { v[col] = row[i]; });
            return v as Vendor;
        });
    },

    addVendor: async (vendor: Vendor) => {
        if (!db) await sqliteService.init();
        db.run("INSERT OR REPLACE INTO vendors (id, name, contactPerson, phone, email) VALUES (?, ?, ?, ?, ?)", [
            vendor.id, vendor.name, vendor.contactPerson, vendor.phone, vendor.email
        ]);
        await sqliteService.persist();
    },

    deleteVendor: async (id: string) => {
        if (!db) await sqliteService.init();
        db.run("DELETE FROM vendors WHERE id = ?", [id]);
        db.run("DELETE FROM invoices WHERE vendorId = ?", [id]);
        await sqliteService.persist();
    },

    getInvoices: async (): Promise<Invoice[]> => {
        if (!db) await sqliteService.init();
        const res = db.exec("SELECT * FROM invoices");
        if (res.length === 0) return [];
        const columns = res[0].columns;
        return res[0].values.map((row: any) => {
            const inv: any = {};
            columns.forEach((col: string, i: number) => {
                if (col === 'lineItems') inv[col] = JSON.parse(row[i]);
                else inv[col] = row[i];
            });
            return inv as Invoice;
        });
    },

    addInvoice: async (invoice: Invoice) => {
        if (!db) await sqliteService.init();
        db.run("INSERT OR REPLACE INTO invoices (id, vendorId, invoiceNumber, issueDate, paymentDate, totalAmount, paidAmount, status, lineItems) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [
            invoice.id, invoice.vendorId, invoice.invoiceNumber, invoice.issueDate, invoice.paymentDate || null, invoice.totalAmount, invoice.paidAmount, invoice.status, JSON.stringify(invoice.lineItems)
        ]);
        await sqliteService.persist();
    },

    updateInvoiceStatus: async (id: string, paidAmount: number, status: PaymentStatus, paymentDate?: string) => {
        if (!db) await sqliteService.init();
        db.run("UPDATE invoices SET paidAmount = ?, status = ?, paymentDate = ? WHERE id = ?", [
            paidAmount, status, paymentDate || null, id
        ]);
        await sqliteService.persist();
    },

    deleteInvoice: async (id: string) => {
        if (!db) await sqliteService.init();
        db.run("DELETE FROM invoices WHERE id = ?", [id]);
        await sqliteService.persist();
    },

    exportDB: () => {
        if (!db) return null;
        return db.export();
    },

    importDB: async (data: Uint8Array) => {
        db = null; // Reset
        await sqliteService.init(data);
        await sqliteService.persist();
    }
};
