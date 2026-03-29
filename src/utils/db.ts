import type { ProcessedEmail } from '../types'

const DB_NAME = 'email-inbox'
const DB_VERSION = 1
const STORE_EMAILS = 'emails'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_EMAILS)) {
        db.createObjectStore(STORE_EMAILS, { keyPath: 'id' })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function getAll(store: string): Promise<ProcessedEmail[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly')
    const req = tx.objectStore(store).getAll()
    req.onsuccess = () => resolve(req.result as ProcessedEmail[])
    req.onerror = () => reject(req.error)
  })
}

async function putAll(store: string, items: ProcessedEmail[]): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite')
    const os = tx.objectStore(store)
    items.forEach((item) => os.put(item))
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

async function putOne(store: string, item: ProcessedEmail): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite')
    tx.objectStore(store).put(item)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

async function deleteOne(store: string, id: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite')
    tx.objectStore(store).delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

async function clearStore(store: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite')
    tx.objectStore(store).clear()
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export const emailsDB = {
  getAll: () => getAll(STORE_EMAILS),
  putAll: (emails: ProcessedEmail[]) => putAll(STORE_EMAILS, emails),
  put: (email: ProcessedEmail) => putOne(STORE_EMAILS, email),
  delete: (id: string) => deleteOne(STORE_EMAILS, id),
  clear: () => clearStore(STORE_EMAILS),
}
