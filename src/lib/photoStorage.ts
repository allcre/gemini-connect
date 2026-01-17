/**
 * IndexedDB utilities for photo storage
 * Photos are stored separately from profile data to avoid localStorage quota limits
 */

const DB_NAME = "biomatch_photos";
const DB_VERSION = 1;
const STORE_NAME = "photos";

let dbPromise: Promise<IDBDatabase> | null = null;

/**
 * Initialize IndexedDB database
 */
function initDB(): Promise<IDBDatabase> {
  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });

  return dbPromise;
}

/**
 * Save a photo to IndexedDB
 * @param photoId - Unique identifier for the photo
 * @param dataUrl - Base64 data URL of the photo
 */
export async function savePhoto(photoId: string, dataUrl: string): Promise<void> {
  try {
    const db = await initDB();

    // Convert data URL to Blob for more efficient storage
    const response = await fetch(dataUrl);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(blob, photoId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.error("Error saving photo to IndexedDB:", error);
    throw error;
  }
}

/**
 * Load a photo from IndexedDB
 * @param photoId - Unique identifier for the photo
 * @returns Base64 data URL of the photo, or null if not found
 */
export async function loadPhoto(photoId: string): Promise<string | null> {
  try {
    const db = await initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(photoId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const blob = request.result;
        if (!blob) {
          resolve(null);
          return;
        }

        // Convert Blob back to data URL
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
      };
    });
  } catch (error) {
    console.error("Error loading photo from IndexedDB:", error);
    return null;
  }
}

/**
 * Delete a photo from IndexedDB
 * @param photoId - Unique identifier for the photo
 */
export async function deletePhoto(photoId: string): Promise<void> {
  try {
    const db = await initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(photoId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.error("Error deleting photo from IndexedDB:", error);
    throw error;
  }
}

/**
 * Delete multiple photos from IndexedDB
 * @param photoIds - Array of photo IDs to delete
 */
export async function deletePhotos(photoIds: string[]): Promise<void> {
  try {
    await Promise.all(photoIds.map(id => deletePhoto(id)));
  } catch (error) {
    console.error("Error deleting photos from IndexedDB:", error);
    throw error;
  }
}
