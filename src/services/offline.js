// Servicio para manejar operaciones offline
class OfflineService {
  constructor() {
    this.dbName = 'CasaGranosDB'
    this.dbVersion = 2
    this.db = null
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = event.target.result

        // Si estamos actualizando desde una versión anterior, eliminamos las stores antiguas
        // para poder recrearlas con el nuevo keyPath (id en lugar de idProducto/etc)
        if (event.oldVersion < 2) {
          if (db.objectStoreNames.contains('productos')) db.deleteObjectStore('productos')
          if (db.objectStoreNames.contains('categorias')) db.deleteObjectStore('categorias')
          if (db.objectStoreNames.contains('proveedores')) db.deleteObjectStore('proveedores')
          if (db.objectStoreNames.contains('dolar')) db.deleteObjectStore('dolar')
        }

        // Store para productos
        if (!db.objectStoreNames.contains('productos')) {
          const productosStore = db.createObjectStore('productos', { keyPath: 'id' })
          productosStore.createIndex('nombre', 'nombre', { unique: false })
          productosStore.createIndex('categoria', 'idCategoria', { unique: false })
        }

        // Store para categorías
        if (!db.objectStoreNames.contains('categorias')) {
          db.createObjectStore('categorias', { keyPath: 'id' })
        }

        // Store para proveedores
        if (!db.objectStoreNames.contains('proveedores')) {
          db.createObjectStore('proveedores', { keyPath: 'id' })
        }

        // Store para dólar
        if (!db.objectStoreNames.contains('dolar')) {
          const dolarStore = db.createObjectStore('dolar', { keyPath: 'id' })
          dolarStore.createIndex('fecha', 'fecha', { unique: false })
        }

        // Store para operaciones pendientes (sync queue)
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true })
          syncStore.createIndex('type', 'type', { unique: false })
          syncStore.createIndex('timestamp', 'timestamp', { unique: false })
        }
      }
    })
  }

  // Serializar datos para IndexedDB (convierte fechas y objetos complejos a JSON)
  serialize(data) {
    if (data === null || data === undefined) return data

    if (Array.isArray(data)) {
      return data.map(item => this.serialize(item))
    }

    if (typeof data === 'object') {
      const serialized = {}
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          const value = data[key]
          // Convertir fechas a strings ISO
          if (value instanceof Date) {
            serialized[key] = value.toISOString()
          } else if (typeof value === 'object' && value !== null) {
            serialized[key] = this.serialize(value)
          } else {
            serialized[key] = value
          }
        }
      }
      return serialized
    }

    return data
  }

  // Guardar datos en IndexedDB
  async save(storeName, data) {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)

      // Serializar datos antes de guardar
      const serializedData = this.serialize(data)

      if (Array.isArray(serializedData)) {
        const requests = serializedData.map(item => {
          try {
            return store.put(item)
          } catch (error) {
            console.error('Error al guardar item en IndexedDB:', error, item)
            throw error
          }
        })
        Promise.all(requests.map(req => new Promise((res, rej) => {
          req.onsuccess = () => res()
          req.onerror = () => rej(req.error)
        }))).then(() => resolve()).catch(reject)
      } else {
        try {
          const request = store.put(serializedData)
          request.onsuccess = () => resolve()
          request.onerror = () => reject(request.error)
        } catch (error) {
          console.error('Error al guardar en IndexedDB:', error, serializedData)
          reject(error)
        }
      }
    })
  }

  // Obtener datos de IndexedDB
  async get(storeName, key = null) {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)

      if (key) {
        const request = store.get(key)
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      } else {
        const request = store.getAll()
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      }
    })
  }

  // Obtener último precio del dólar
  async getUltimoPrecioDolar() {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['dolar'], 'readonly')
      const store = transaction.objectStore('dolar')
      const index = store.index('fecha')
      const request = index.openCursor(null, 'prev')

      request.onsuccess = (event) => {
        const cursor = event.target.result
        if (cursor) {
          resolve(cursor.value)
        } else {
          resolve(null)
        }
      }
      request.onerror = () => reject(request.error)
    })
  }

  // Agregar operación a la cola de sincronización
  async addToSyncQueue(operation) {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['syncQueue'], 'readwrite')
      const store = transaction.objectStore('syncQueue')
      const request = store.add({
        ...operation,
        timestamp: Date.now()
      })
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // Verificar si hay conexión
  isOnline() {
    return navigator.onLine
  }

  // Sincronizar cola pendiente
  async syncQueue() {
    if (!this.isOnline()) return

    if (!this.db) await this.init()

    const queue = await this.get('syncQueue')
    if (queue.length === 0) return

    // Aquí implementarías la lógica para procesar cada operación pendiente
    // y sincronizarla con el servidor
    console.log('Sincronizando cola pendiente...', queue)
  }

  // Obtener conteos para el dashboard offline
  async getCounts() {
    if (!this.db) await this.init()
    const stores = ['productos', 'categorias', 'proveedores']
    const counts = {}

    await Promise.all(stores.map(storeName => {
      return new Promise((resolve, reject) => {
        try {
          const transaction = this.db.transaction([storeName], 'readonly')
          const store = transaction.objectStore(storeName)
          const request = store.count()
          request.onsuccess = () => {
            counts[storeName] = request.result
            resolve()
          }
          request.onerror = () => reject(request.error)
        } catch (e) {
          counts[storeName] = 0
          resolve()
        }
      })
    }))

    return {
      totalProductos: counts.productos || 0,
      totalCategorias: counts.categorias || 0,
      totalProveedores: counts.proveedores || 0
    }
  }
}

export default new OfflineService()

