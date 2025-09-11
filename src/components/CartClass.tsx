import { Component } from "react";

// Estructura de un ítem en el carrito
interface CartItem {
  id: string;
  name: string;
  quantity: number;
}

// Props y estado del componente
interface CartClassProps {
  items: CartItem[];
  onRemove?: (id: string) => void;
}

// Estado del componente
interface CartClassState {
  total: number;
}
// Componente de clase para el carrito
export default class CartClass extends Component<CartClassProps, CartClassState> {
  // Inicializar estado
  constructor(props: CartClassProps) {
    super(props);
    this.state = { total: 0 };
  }

  // Calcular total al montar y actualizar
  componentDidMount() {
    this.updateTotal();
  }

  // Recalcular total si cambian los items
  componentDidUpdate(prevProps: CartClassProps) {
    if (prevProps.items !== this.props.items) {
      this.updateTotal();
    }
  }

  // Función para actualizar el total de productos
  updateTotal() {
    const total = this.props.items.reduce((acc, item) => acc + item.quantity, 0);
    this.setState({ total });
  }

  // Renderizar el componente
  render() {
    return (
      <div className="card p-3 mb-3">
        <h5>Carrito</h5>
        <ul className="list-group mb-2">
          {this.props.items.map((item) => (
            <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
              <span>{item.name}</span>
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-primary rounded-pill">{item.quantity}</span>
                {this.props.onRemove && (
                  <button className="btn btn-outline-danger btn-sm" onClick={() => this.props.onRemove!(item.id)}>
                    Eliminar
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
        <div>Total de productos: <b>{this.state.total}</b></div>
      </div>
    );
  }
}
