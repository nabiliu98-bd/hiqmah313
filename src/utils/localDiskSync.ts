import { AppState } from '../types';

const LAST_SYNC_KEY = 'youth_of_hiqmah_last_disk_sync';

/**
 * Returns formatted timestamp of the last local disk persistence
 */
export function getLastLocalSyncTime(): string {
  try {
    const saved = localStorage.getItem(LAST_SYNC_KEY);
    if (!saved) return 'স্বয়ংক্রিয় অফলাইন লোকাল স্টোরেজে সংরক্ষিত';
    const d = new Date(saved);
    return `${d.toLocaleDateString('bn-BD')} ${d.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}`;
  } catch {
    return 'অফলাইন লোকাল ডিস্কে সংরক্ষিত';
  }
}

/**
 * Records the current time as the last local sync timestamp
 */
export function recordLocalSyncTime(): void {
  try {
    localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
  } catch (e) {
    console.error('Error saving local disk timestamp:', e);
  }
}

/**
 * Saves state directly to a local disk file using File System Access API if supported,
 * otherwise triggers a direct local disk file download.
 */
export async function saveDirectToDisk(state: AppState): Promise<{ success: boolean; filename: string }> {
  const jsonContent = JSON.stringify(state, null, 2);
  const now = new Date();
  const dateSuffix = now.toISOString().split('T')[0];
  const filename = `youth_of_hiqmah_disk_backup_${dateSuffix}.json`;

  // 1. Try File System Access API (Supported in Chrome/Edge/Desktop browsers)
  if ('showSaveFilePicker' in window) {
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: filename,
        types: [
          {
            description: 'Youth of hiqmah Local Disk Backup (JSON)',
            accept: {
              'application/json': ['.json'],
            },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(jsonContent);
      await writable.close();
      recordLocalSyncTime();
      return { success: true, filename: handle.name || filename };
    } catch (err: any) {
      // If user cancelled the picker dialog, return gracefully
      if (err.name === 'AbortError') {
        return { success: false, filename: '' };
      }
      console.warn('Native File System API failed, falling back to download blob:', err);
    }
  }

  // 2. Fallback: Native Browser File Download to local disk
  try {
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    recordLocalSyncTime();
    return { success: true, filename };
  } catch (err) {
    console.error('Error saving to local disk file:', err);
    return { success: false, filename: '' };
  }
}

/**
 * Reads a backup JSON file directly from local disk
 */
export async function loadDirectFromDisk(): Promise<AppState | null> {
  // 1. Try File System Access API
  if ('showOpenFilePicker' in window) {
    try {
      const [handle] = await (window as any).showOpenFilePicker({
        types: [
          {
            description: 'Youth of hiqmah Local Disk Backup (JSON)',
            accept: {
              'application/json': ['.json'],
            },
          },
        ],
        multiple: false,
      });
      const file = await handle.getFile();
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (parsed && parsed.categories && parsed.dailyLogs) {
        recordLocalSyncTime();
        return parsed;
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return null;
      console.warn('Native Open File Picker fallback:', err);
    }
  }

  // 2. Fallback using hidden input element
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        if (parsed && parsed.categories && parsed.dailyLogs) {
          recordLocalSyncTime();
          resolve(parsed);
        } else {
          console.warn('ফাইলের কাঠামো সঠিক নয়।');
          resolve(null);
        }
      } catch (err) {
        console.error('ফাইল লোড করতে সমস্যা হয়েছে:', err);
        resolve(null);
      }
    };
    input.click();
  });
}
