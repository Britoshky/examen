import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SimpleReactValidator from "simple-react-validator";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import useAuthUser from "../hooks/useAuthUser";
import { toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
export interface ProductInput {
  name: string;
  description: string;
  imageUrl?: string;
}

interface Props {
  onSaved?: () => void;
}

const ProductForm: React.FC<Props> = ({ onSaved }) => {
  const [form, setForm] = useState<ProductInput>({ name: "", description: "" });
  const [imageFile, setImageFile] = useState<File|null>(null);
  const [imagePreview, setImagePreview] = useState<string|null>(null);
  const [, setTick] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
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
  const user = useAuthUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (submitted) {
      validator.current.showMessages();
      setTick((x) => !x);
    }
  }, [submitted, form]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, files } = e.target as HTMLInputElement;
    if (type === "file" && files && files[0]) {
      setImageFile(files[0]);
      setImagePreview(URL.createObjectURL(files[0]));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    validator.current.showMessageFor(e.target.name);
    setTick((x) => !x);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    if (!validator.current.allValid()) {
      validator.current.showMessages();
      setTick((x) => !x);
      return;
    }
    if (!user) {
      toast.error("Debes iniciar sesión para agregar productos (no autenticado)");
      return;
    }
    setSaving(true);
    toast.info("Agregando producto...", { autoClose: 1200, toastId: "saving-product" });
    try {
      let imageUrl = undefined;
      if (imageFile) {
        const imgRef = ref(storage, `products/${user.uid}/${Date.now()}_${imageFile.name}`);
        await uploadBytes(imgRef, imageFile);
        imageUrl = await getDownloadURL(imgRef);
      }
      await addDoc(collection(db, "products"), { ...form, imageUrl, createdAt: serverTimestamp(), uid: user.uid });
      toast.success("Producto agregado correctamente", { autoClose: 1200 });
      setSubmitted(false);
      setForm({ name: "", description: "" });
      setImageFile(null);
      setImagePreview(null);
      validator.current.hideMessages();
      setTick((x) => !x);
      setTimeout(() => {
        setSaving(false);
        navigate("/");
      }, 500); // Breve delay para UX y ver toast
      onSaved?.();
    } catch (err: any) {
      const msg = err?.message || "Error al agregar el producto";
      toast.error(msg, { autoClose: 4000 });
      setSaving(false);
    }
  };

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
        <label htmlFor="image" className="form-label">Imagen</label>
        <input
          id="image"
          type="file"
          name="image"
          accept="image/*"
          className="form-control"
          onChange={handleChange}
        />
        {imagePreview && (
          <img src={imagePreview} alt="Vista previa" className="img-fluid mt-2" style={{maxHeight: 180}} />
        )}
      </div>
      <button type="submit" className="btn btn-primary" disabled={saving}>
        {saving ? "Agregando..." : "Guardar producto"}
      </button>
    </form>
  );
};

export default ProductForm;
