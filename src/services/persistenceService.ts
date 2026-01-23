
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface ChunkStore extends DBSchema {
  transfers: {
    key: string;
    value: {
      fileId: string;
      fileName: string;
      fileSize: number;
      fileType: string;
      totalChunks: number;
      receivedChunks: number[]; // Array of chunk indices received
      lastUpdated: number;
    };
    indexes: { 'by-date': number };
  };
  chunks: {
    key: string; // Composite key: fileId_chunkIndex
    value: {
        fileId: string;
        chunkIndex: number;
        data: ArrayBuffer;
    };
  };
}

export class PersistenceService {
  private dbPromise: Promise<IDBPDatabase<ChunkStore>>;

  constructor() {
    this.dbPromise = openDB<ChunkStore>('p2p-file-transfer', 1, {
      upgrade(db) {
        const transferStore = db.createObjectStore('transfers', { keyPath: 'fileId' });
        transferStore.createIndex('by-date', 'lastUpdated');
        
        db.createObjectStore('chunks', { keyPath: 'key' }); // Custom key
      },
    });
  }

  async saveTransferMetadata(fileId: string, metadata: { name: string, size: number, type: string, totalChunks: number }) {
      const db = await this.dbPromise;
      await db.put('transfers', {
          fileId,
          fileName: metadata.name,
          fileSize: metadata.size,
          fileType: metadata.type,
          totalChunks: metadata.totalChunks,
          receivedChunks: [],
          lastUpdated: Date.now()
      });
  }

  async saveChunk(fileId: string, chunkIndex: number, data: ArrayBuffer) {
      const db = await this.dbPromise;
      
      // Save chunk data
      await db.put('chunks', {
          fileId,
          chunkIndex,
          data
      } as any);

      // Update metadata received list (optimize this if performance issue)
      const tx = db.transaction('transfers', 'readwrite');
      const store = tx.objectStore('transfers');
      const transfer = await store.get(fileId);
      
      if (transfer) {
          if (!transfer.receivedChunks.includes(chunkIndex)) {
              transfer.receivedChunks.push(chunkIndex);
              // Keep sorted for easy offset calculation
              transfer.receivedChunks.sort((a,b) => a - b); 
              transfer.lastUpdated = Date.now();
              await store.put(transfer);
          }
      }
      await tx.done;
  }

  async getTransferProgress(fileId: string): Promise<number[]> {
      const db = await this.dbPromise;
      const transfer = await db.get('transfers', fileId);
      return transfer ? transfer.receivedChunks : [];
  }

  async getAllChunks(fileId: string): Promise<ArrayBuffer[]> {
       const db = await this.dbPromise;
       const transfer = await db.get('transfers', fileId);
       if (!transfer) return [];

       const chunks: ArrayBuffer[] = [];
       // This assumes we have contiguous chunks 0..N, or we construct partial
       // But usually we call this when 'done'.
       // Realistically, for huge files, we don't load ALL into memory at once like this.
       // But for the limit of browser memory, this aligns with current webrtcService logic.
       
       for(let i=0; i<transfer.totalChunks; i++) {
           const key = `${fileId}_${i}`;
           const chunk = await db.get('chunks', key);
           if (chunk) {
               chunks.push(chunk.data);
           } else {
               // Missing chunk?
               console.warn(`Missing chunk ${i} for file ${fileId}`);
               chunks.push(new ArrayBuffer(0)); // Placeholder
           }
       }
       return chunks;
  }

  async clearTransfer(fileId: string) {
      const db = await this.dbPromise;
      await db.delete('transfers', fileId);
      
      // Delete all chunks - simple range query would be better if index existed or composite key was better designed
      // But for now, iterate keys
      let cursor = await db.transaction('chunks', 'readwrite').store.openCursor();
      while(cursor) {
          if (cursor.value.fileId === fileId) {
              await cursor.delete();
          }
          cursor = await cursor.continue();
      }
  }
}

export const persistenceService = new PersistenceService();
