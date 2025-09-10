

# Examen: Sistema de Gestión de Productos (React + Firebase)

Aplicación web profesional y responsiva para la gestión de productos, con autenticación, almacenamiento de imágenes, y carrito sincronizado en tiempo real entre dispositivos, desarrollada con React, TypeScript, Vite y Firebase (Firestore, Auth, Storage).

## Características principales

- **Autenticación de usuarios**: Registro e inicio de sesión seguro con Firebase Auth.
- **Gestión de productos**: Cada usuario puede crear, ver y eliminar sus propios productos.
- **Subida de imágenes**: Las imágenes de productos se almacenan en Firebase Storage, privadas por usuario.
- **Carrito sincronizado**: El carrito de compras se guarda y sincroniza en tiempo real en Firestore, reflejando los cambios en todos los dispositivos donde el usuario esté autenticado (web y mobile).
- **Interfaz moderna y responsiva**: Uso de Bootstrap 5 para una experiencia óptima en desktop, tablet y móvil.
- **Validaciones**: Formularios con validación en tiempo real usando simple-react-validator.
- **Notificaciones**: Mensajes claros y amigables con React Toastify.

## Tecnologías utilizadas

- React 19 + TypeScript
- Vite
- Firebase (Auth, Firestore, Storage)
- Bootstrap 5
- React Router DOM
- React Toastify
- simple-react-validator

## Estructura del proyecto

- `src/components/` Componentes reutilizables: formularios, listas, carrito, navegación, etc.
- `src/pages/` Vistas principales: Home, Login, Detalle de producto.
- `src/hooks/` Hooks personalizados (ej: autenticación).
- `src/firebase.ts` Configuración de Firebase.

## Instalación y ejecución

1. Clona el repositorio:
   ```bash
   git clone https://github.com/Britoshky/examen.git
   cd tu-repo
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Configura el archivo `.env` con tus credenciales de Firebase (ver ejemplo `.env.example`).
4. Inicia la app en modo desarrollo:
   ```bash
   npm run dev
   ```

## Seguridad y reglas de Storage

Las imágenes se almacenan en subcarpetas privadas por usuario. Solo el usuario dueño puede ver, editar o eliminar sus imágenes:

```plaintext
service firebase.storage {
  match /b/{bucket}/o {
    match /products/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Despliegue

Puedes desplegar la app fácilmente en Vercel, Netlify o Firebase Hosting.

---

Desarrollado para fines académicos y profesionales.
