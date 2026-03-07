# Casa de los Granos - Frontend

## Descripcion

Este es el sistema de interfaz de usuario para "La Casa de los Granos", una aplicacion de gestion de inventario y control de precios. La plataforma esta diseñada para ofrecer una experiencia fluida, moderna y eficiente en la gestion de productos, categorias, proveedores y el monitoreo del tipo de cambio del dolar en tiempo real.

## Tecnologias Utilizadas

- Framework: Vue.js 3 (Composition API)
- Herramienta de Construccion: Vite
- Estilos: Tailwind CSS
- Gestion de Estado: Pinia
- Cliente HTTP: Axios
- Almacenamiento Local: IndexedDB (via Offline Service)
- Iconografia: Lucide Icons (SVG)

## Caracteristicas Principales

- Panel de Control: Visualizacion de estadisticas generales, estado del sistema y reloj en tiempo real.
- Gestion de Productos: Listado paginado, busqueda avanzada, filtrado por categorias y creacion/edicion mediante formularios dinamicos.
- Gestion de Categorias y Proveedores: Administracion completa de entidades relacionadas con el inventario.
- Control de Divisas: Integracion con tasas de cambio y calculo automatico de precios en bolivares (Bs.).
- Soporte Offline: Cache de datos mediante IndexedDB para permitir la consulta de informacion sin conexion a internet.
- Diseño Responsivo: Interfaz optimizada para dispositivos moviles, tablets y computadoras de escritorio.

## Requisitos Previos

- Node.js (Version 16 o superior recomendada)
- npm (Version 7 o superior)

## Instalacion

1. Clonar el repositorio.
2. Navegar al directorio del frontend:

   ```bash
   cd "CDG Frontend"
   ```

3. Instalar las dependencias:

   ```bash
   npm install
   ```

## Configuracion

Cree un archivo `.env` en la raiz del proyecto para configurar la URL de la API:

```env
VITE_API_URL=http://localhost/api
```

## Scripts Disponibles

- Desarrollo: Inicia el servidor de desarrollo con recarga en caliente.

  ```bash
  npm run dev
  ```

- Produccion: Compila y optimiza la aplicacion para su despliegue.

  ```bash
  npm run build
  ```

- Previsualizacion: Permite ver la compilacion de produccion localmente.

  ```bash
  npm run preview
  ```

## Estructura del Proyecto

- src/assets: Archivos multimedia y estilos globales.
- src/components: Componentes reutilizables (NavBar, StatCard, DynamicForm).
- src/services: Logica de comunicacion con la API y servicio offline.
- src/stores: Gestion de estado global con Pinia (Autenticacion).
- src/views: Paginas principales de la aplicacion.

## Notas de Implementacion

La aplicacion utiliza un sistema de formularios dinamicos para mantener la consistencia visual y reducir la duplicacion de codigo. Ademas, se implemento una capa de servicio offline que sincroniza automaticamente los datos mas importantes para garantizar la operatividad en condiciones de baja conectividad.
