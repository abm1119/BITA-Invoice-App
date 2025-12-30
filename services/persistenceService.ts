
/**
 * BITA High-Performance Persistence Layer
 * Uses IndexedDB for binary SQLite storage and localStorage for light metadata.
 */

const DB_NAME = 'BITA_STORAGE';
const STORE_NAME = 'ledger_data';
const KEY_NAME = 'sqlite_binary';

const getIDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

export const persistenceService = {
    saveDB: async (data: Uint8Array) => {
        try {
            const db = await getIDB();
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            await new Promise((resolve, reject) => {
                const req = store.put(data, KEY_NAME);
                req.onsuccess = resolve;
                req.onerror = reject;
            });
            // Also store a small revision marker in localStorage for fast checks
            localStorage.setItem('bita_rev', Date.now().toString());
        } catch (err) {
            console.error("BITA Persistence Error:", err);
        }
    },

    loadDB: async (): Promise<Uint8Array | null> => {
        try {
            const db = await getIDB();
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const data: any = await new Promise((resolve, reject) => {
                const req = store.get(KEY_NAME);
                req.onsuccess = () => resolve(req.result);
                req.onerror = reject;
            });
            return data || null;
        } catch (err) {
            console.error("BITA Load Error:", err);
            return null;
        }
    },

    clearAll: async () => {
        const db = await getIDB();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).clear();
        localStorage.removeItem('bita_rev');
    }
};
