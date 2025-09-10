import { useParams } from "react-router-dom";

export default function ProductDetail() {
  const { id } = useParams();
  // Aquí podrías buscar el producto por id y mostrar detalles
  return (
    <div className="d-flex flex-column align-items-center justify-content-center w-100" style={{minHeight: '80vh'}}>
      <h2>Detalle del producto</h2>
      <div className="card mx-auto" style={{maxWidth: 500}}>
        <div>ID: {id}</div>
        {/* Aquí puedes mostrar más info del producto */}
      </div>
    </div>
  );
}
