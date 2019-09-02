import { defaults } from "@/store/modules/settings";

let storePromise: Promise<IDBDatabase>;

function init() {
  requestPersistent();
  const request = indexedDB.open("settings", 1);
  storePromise = new Promise((resolve, reject) => {
    request.onerror = event => {
      console.log("Error opening indexedDB: ", request.error);
      reject(request.error);
    };
    request.onsuccess = event => {
      resolve(request.result);
    };
    request.onupgradeneeded = event => {
      const db: IDBDatabase = request.result;
      const objectStore = db.createObjectStore("settings");

      objectStore.transaction.oncomplete = event => {
        addSave("default", defaults);
        resolve(request.result);
      };
    };
  });
}

function requestPersistent() {
  navigator.storage.persisted().then(isPersisting => {
    if (!isPersisting)
      navigator.storage.persist().then(success => {
        if (success) {
          console.log("Successfully got persistent storage");
        } else {
          console.log("Did not get got persistent storage");
        }
      });
  });
}

init();

async function getTransaction(
  mode: IDBTransactionMode
): Promise<IDBObjectStore> {
  const db = await storePromise;
  return db.transaction("settings", mode).objectStore("settings");
}

export async function addSave(name: string, settings: object) {
  const store = await getTransaction("readwrite");
  store.put(settings, name);
}

export async function getSavesList() {
  const store = await getTransaction("readwrite");
  const request = store.getAllKeys();
  return new Promise<IDBValidKey[]>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function loadSave(name: string) {
  const store = await getTransaction("readwrite");
  const request = store.get(name);
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function removeSave(name: string) {
  const store = await getTransaction("readwrite");
  const request = store.delete(name);
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
