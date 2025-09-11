import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SimpleReactValidator from "simple-react-validator";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import type { FirebaseError } from "firebase/app";
import { db, storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import useAuthUser from "../hooks/useAuthUser";
import { toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";

// Estructura de datos del producto
export interface ProductInput {
  name: string;
  description: string;
  imageUrl?: string;
}

// Props del componente
interface Props {
  onSaved?: () => void;
}

// Componente de formulario para agregar productos
const ProductForm: React.FC<Props> = ({ onSaved }) => {
  // Estados del formulario
  const [form, setForm] = useState<ProductInput>({ name: "", description: "" });
  // Estado de la imagen
  const [imageFile, setImageFile] = useState<File | null>(null);
  // Vista previa de la imagen
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  // Error de la imagen
  const [imageError, setImageError] = useState<string>("");
  // Forzar re-render para validador
  const [, setTick] = useState(false);
  // Estado para saber si se ha intentado enviar el formulario
  const [submitted, setSubmitted] = useState(false);
  // Estado de guardado
  const [saving, setSaving] = useState(false);
  // Validador de formularios
  const validator = useRef(
    new SimpleReactValidator({
      autoForceUpdate: { forceUpdate: () => setTick((x) => !x) },
      element: (message: string) => <div className="text-danger small">{message}</div>,
      messages: {
        required: "Este campo es obligatorio",
        min: "Debe tener al menos :min caracteres",
      },
    })
  );
  // Usuario autenticado
  const user = useAuthUser();
  // Navegación
  const navigate = useNavigate();

  // Efecto para mostrar mensajes de validación si se ha intentado enviar
  useEffect(() => {
    if (submitted) {
      validator.current.showMessages();
      setTick((x) => !x);
    }
  }, [submitted, form]);

  // Manejar cambios en los campos del formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // Obtener valores del evento
    const { name, value, type, files } = e.target as HTMLInputElement;
    // Si es un input file, actualizar estado de imagen
    if (type === "file" && files && files[0]) {
      // Validar tipo de archivo
      if (!files[0].type.startsWith("image/")) {
        setImageError("El archivo debe ser una imagen");
        return;
      }
      // Actualizar estado
      setImageFile(files[0]);
      // Generar vista previa
      setImagePreview(URL.createObjectURL(files[0]));
    } else {
      // Actualizar estado del formulario
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Manejar blur para mostrar mensajes de validación
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // Mostrar mensaje de validación para el campo
    validator.current.showMessageFor(e.target.name);
    setTick((x) => !x);
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // Prevenir comportamiento por defecto
    e.preventDefault();
    // Marcar que se ha intentado enviar
    setSubmitted(true);
    // Validar formulario
    if (!validator.current.allValid()) {
      // Mostrar mensajes de validación
      validator.current.showMessages();
      // Forzar re-render
      setTick((x) => !x);
      // Detener envío
      return;
    }
    // Validar imagen
    if (!imageFile) {
      // Mostrar error si no hay imagen
      setImageError("La imagen es obligatoria");
      // Detener envío
      return;
      // Si hay imagen, limpiar error
    } else {
      setImageError("");
    }
    // Si no hay usuario, mostrar error y detener
    if (!user) {
      toast.error("Debes iniciar sesión para agregar productos (no autenticado)");
      return;
    }
    // Procesar guardado
    setSaving(true);
    // Mostrar notificación de guardado
    toast.info("Agregando producto...", { autoClose: 1200, toastId: "saving-product" });
    // Intentar guardar en Firestore y Storage
    try {
      // Subir imagen a Firebase Storage
      let imageUrl = undefined;
      // Si hay imagen, subir a Storage
      if (imageFile) {
        // Crear referencia de imagen
        let fileToUpload: Blob = imageFile;
        // Comprimir si es mayor a 1MB
        if (imageFile.size > 1024 * 1024) {
          const img = document.createElement("img");
          img.src = URL.createObjectURL(imageFile);
          await new Promise((resolve) => {
            img.onload = () => {
              const canvas = document.createElement("canvas");
              const ctx = canvas.getContext("2d");
              if (!ctx) {
                resolve(null);
                return;
              }
              const maxDim = 1024;
              let { width, height } = img;
              if (width > height) {
                if (width > maxDim) {
                  height = (height * maxDim) / width;
                  width = maxDim;
                }
              } else {
                if (height > maxDim) {
                  width = (width * maxDim) / height;
                  height = maxDim;
                }
              }
              canvas.width = width;
              canvas.height = height;
              ctx.drawImage(img, 0, 0, width, height);
              canvas.toBlob((blob) => {
                if (blob) {
                  fileToUpload = blob;
                }
                resolve(null);
              }, "image/jpeg", 0.6);
            };
          });
        }
        // Subir archivo (comprimido o no) a Storage
        const imgRef = ref(storage, `products/${user.uid}/${Date.now()}_${imageFile.name}`);
        // Subir archivo
        await uploadBytes(imgRef, fileToUpload);
        // Obtener URL de descarga
        imageUrl = await getDownloadURL(imgRef);
      }
      // Guardar producto en Firestore
      await addDoc(collection(db, "products"), { ...form, imageUrl, createdAt: serverTimestamp(), uid: user.uid });
      // Mostrar éxito
      toast.success("Producto agregado correctamente", { autoClose: 1200 });
      // Resetear formulario
      setSubmitted(false);
      // Limpiar estado del formulario
      setForm({ name: "", description: "" });
      // Limpiar imagen
      setImageFile(null);
      // Limpiar vista previa
      setImagePreview(null);
      // Limpiar error de imagen
      setImageError("");
      // Limpiar mensajes de validación
      validator.current.hideMessages();
      // Forzar re-render
      setTick((x) => !x);
      // Detener estado de guardado y navegar tras breve delay
      setTimeout(() => {
        setSaving(false);
        navigate("/");
      }, 500); // Breve delay para UX y ver toast
      onSaved?.();
      // Capturar errores
    } catch (err) {
      const error = err as FirebaseError;
      const msg = error?.message || "Error al agregar el producto";
      toast.error(msg, { autoClose: 4000 });
      setSaving(false);
    }
  };

  // Renderizar formulario
  return (
    <form className="card p-3 mb-3 mx-auto" onSubmit={handleSubmit}>
      <h5 className="mb-3">Nuevo producto</h5>
      <div className="mb-3">
        <label htmlFor="name" className="form-label">Nombre</label>
        <input
          id="name"
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          onBlur={handleBlur}
          className="form-control"
          placeholder="Ej: Notebook"
          autoComplete="off"
        />
        {validator.current.message("name", form.name, "required|min:3")}
      </div>
      <div className="mb-3">
        <label htmlFor="description" className="form-label">Descripción</label>
        <textarea
          id="description"
          name="description"
          value={form.description}
          onChange={handleChange}
          onBlur={handleBlur}
          className="form-control"
          placeholder="Describe el producto (mínimo 10 caracteres)"
          rows={3}
        />
        {validator.current.message("description", form.description, "required|min:10")}
      </div>
      <div className="mb-3">
        <label htmlFor="image" className="form-label">Imagen <span className="text-danger">*</span></label>
        <input
          id="image"
          type="file"
          name="image"
          accept="image/*"
          className="form-control"
          onChange={e => {
            handleChange(e);
            setImageError("");
          }}
        />
        {imagePreview && (
          <img src={imagePreview} alt="Vista previa" className="img-fluid mt-2" style={{ maxHeight: 180 }} />
        )}
        {imageError && <div className="text-danger small mt-1">{imageError}</div>}
      </div>
      <button type="submit" className="btn btn-primary" disabled={saving}>
        {saving ? "Agregando..." : "Guardar producto"}
      </button>
    </form>
  );
};

export default ProductForm;
