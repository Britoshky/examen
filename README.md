
# Sistema de Gestión de Productos (React + Firebase)

Aplicación web profesional para gestión de productos con autenticación, almacenamiento de imágenes y carrito, desarrollada con React, TypeScript, Vite y Firebase (Firestore, Auth, Storage).

## Características
- Registro e inicio de sesión de usuarios
- CRUD de productos (cada usuario solo ve y gestiona sus productos)
- Subida y visualización de imágenes de productos (privadas por usuario)
- Carrito de compras local
- Interfaz moderna y responsiva (Bootstrap)

## Tecnologías principales
- React 19 + TypeScript
- Vite
- Firebase Auth, Firestore y Storage
- Bootstrap 5
- React Router DOM
- React Toastify

## Instalación y uso
1. Clona el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/tu-repo.git
   cd tu-repo
   ```
2. Instala dependencias:
   ```bash
   npm install
   ```
3. Configura tu archivo `.env` con las credenciales de Firebase (ver `.env.example`).
4. Inicia la app en modo desarrollo:
   ```bash
   npm run dev
   ```

## Estructura principal
- `src/components/` Componentes reutilizables (formularios, listas, carrito, etc.)
- `src/pages/` Vistas principales (Home, Login, Detalle)
- `src/services/` Lógica de acceso a datos
- `src/firebase.ts` Configuración de Firebase

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
