
import { ref, set, get } from 'firebase/database';
import { db, auth } from '../firebase';
import { sqliteService } from './sqliteService';

export const syncService = {
    /**
     * Pushes the current local SQLite binary to Firebase
     */
    uploadBackup: async () => {
        const user = auth.currentUser;
        if (!user) return;

        const data = sqliteService.exportDB();
        if (!data) return;

        // Optimized conversion for large binaries
        let binaryStr = '';
        const bytes = new Uint8Array(data);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binaryStr += String.fromCharCode(bytes[i]);
        }
        const base64 = btoa(binaryStr);

        await set(ref(db, `users/${user.uid}/sqlite_backup`), {
            data: base64,
            timestamp: Date.now()
        });
        console.log("BITA Sync: Cloud synchronization successful.");
    },

    /**
     * Fetches the latest SQLite binary from Firebase and loads it locally
     */
    downloadBackup: async () => {
        const user = auth.currentUser;
        if (!user) return false;

        try {
            const snapshot = await get(ref(db, `users/${user.uid}/sqlite_backup`));
            if (snapshot.exists()) {
                const { data } = snapshot.val();
                const binaryStr = atob(data);
                const bytes = new Uint8Array(binaryStr.length);
                for (let i = 0; i < binaryStr.length; i++) {
                    bytes[i] = binaryStr.charCodeAt(i);
                }

                await sqliteService.importDB(bytes);
                console.log("BITA Sync: Local engine restored from cloud backup.");
                return true;
            }
        } catch (err) {
            console.error("BITA Sync: Download failed.", err);
        }
        return false;
    }
};
