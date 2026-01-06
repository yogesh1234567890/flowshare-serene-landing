
import JSZip from 'jszip';

export class FolderService {
  /**
   * Processes a list of FileSystemEntry items (from drag and drop).
   * If folders are found, it zips them.
   * If single files are found, it returns them as is.
   */
  static async processEntries(items: DataTransferItemList): Promise<File[]> {
    const files: File[] = [];
    
    // We need to use recursion to handle nested folders
    // But DataTransferItemList is NOT a standard array, so we convert it
    const entries: FileSystemEntry[] = [];
    for (let i = 0; i < items.length; i++) {
        const entry = items[i].webkitGetAsEntry();
        if (entry) {
            entries.push(entry);
        } else {
             // Fallback for non-entry items (rare in modern browsers for drag-drop)
             const file = items[i].getAsFile();
             if (file) files.push(file);
        }
    }

    for (const entry of entries) {
      if (entry.isFile) {
         const fileIdx = await this.getFileFromEntry(entry as FileSystemFileEntry);
         if(fileIdx) files.push(fileIdx);
      } else if (entry.isDirectory) {
        console.log('Processing directory:', entry.name);
        // It's a directory, we need to zip it
        try {
            const zipFile = await this.zipDirectory(entry as FileSystemDirectoryEntry);
            files.push(zipFile);
        } catch (e) {
            console.error("Failed to zip directory", entry.name, e);
        }
      }
    }

    return files;
  }

  private static getFileFromEntry(entry: FileSystemFileEntry): Promise<File> {
      return new Promise((resolve, reject) => {
          entry.file(resolve, reject);
      });
  }

  private static async zipDirectory(dirEntry: FileSystemDirectoryEntry): Promise<File> {
      const zip = new JSZip();
      await this.addDirectoryToZip(zip, dirEntry, "");
      
      const blob = await zip.generateAsync({ type: "blob" });
      const filename = `${dirEntry.name}.zip`;
      
      return new File([blob], filename, { type: "application/zip" });
  }

  private static async addDirectoryToZip(zip: JSZip, dirEntry: FileSystemDirectoryEntry, userPath: string): Promise<void> {
      const entries = await this.readEntries(dirEntry);
      
      for (const entry of entries) {
          if (entry.isFile) {
              const file = await this.getFileFromEntry(entry as FileSystemFileEntry);
              // userPath is relative path inside the zip
              zip.file(userPath + entry.name, file);
          } else if (entry.isDirectory) {
              const newPath = userPath + entry.name + "/";
              // Create folder in zip (implied by adding files with path, but we can be explicit)
              zip.folder(newPath);
              await this.addDirectoryToZip(zip, entry as FileSystemDirectoryEntry, newPath);
          }
      }
  }

  private static readEntries(dirEntry: FileSystemDirectoryEntry): Promise<FileSystemEntry[]> {
      return new Promise((resolve, reject) => {
          const reader = dirEntry.createReader();
          const entries: FileSystemEntry[] = [];
          
          const readBatch = () => {
              reader.readEntries((batch) => {
                  if (batch.length > 0) {
                      entries.push(...batch);
                      readBatch(); // Continue reading until empty
                  } else {
                      resolve(entries);
                  }
              }, reject);
          };
          
          readBatch();
      });
  }
}
