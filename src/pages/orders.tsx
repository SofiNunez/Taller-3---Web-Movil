import { useState, useEffect } from 'react';

interface Product {
  id: number;
  name: string;
  description: string | null;
  price: string;
  stock: number;
  imageUrl: string | null;
}

interface Order {
  id: number;
  userId: number;
  status: "pending" | "completed" | "canceled";
  createdAt: string;
  user: User;
  orderItems: OrderItem[];
}

interface User {
    id: number,
    name: string,
    email: string
}

interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  product: Product;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [filterName, setFilterName] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterMinItems, setFilterMinItems] = useState("");


  // Fetch orders
  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders/all');
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const filtered = orders
      .filter(o => filterName ? o.user.name == filterName : true)
      .filter(o => filterStatus ? o.status == filterStatus : true)
      .filter(o => filterMinItems ? o.orderItems.map(o => o.quantity).reduce((acc, item) => acc + item, 0) >= parseInt(filterMinItems) : true)
      
      setFilteredOrders(filtered);
  }, [orders, filterName, filterStatus, filterMinItems]); 

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    completed: 'bg-green-100 text-green-800 border-green-300',
    cancelled: 'bg-red-100 text-red-800 border-red-300'
  };

  const statusLabels: Record<string, string> = {
    pending: 'Pendiente',
    completed: 'Completado',
    cancelled: 'Cancelado'
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F0E8' }}>
        <div className="text-xl" style={{ color: '#6B5744' }}>Cargando pedidos...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#F5F0E8' }}>
      <div className="max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#3D2817' }}>Pedidos</h1>
          <p style={{ color: '#8B7355' }}>Gestiona y visualiza todos los pedidos</p>
        </div>
      </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {['pending', 'completed', 'cancelled'].map((status) => {
            const count = orders.filter(o => o.status === status).length;
            return (
              <div 
                key={status} 
                className={`${statusColors[status]} border-2 rounded-xl p-4 shadow-sm`}
              >
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-sm font-medium">{statusLabels[status]}</div>
              </div>
            );
          })}
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">

          {/* Buscar por nombre de cliente */}
          <select
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            className="p-3 rounded-lg border"
            style={{
              backgroundColor: "#FAF7F2",
              borderColor: "#E5DCC8",
              color: "#3D2817",
            }}
          > 
            <option value={""}>Nombre</option> 
            {[...new Set(filteredOrders.map(i => i.user.name))].map(n => (
              <option value={n}>{n}</option>
            ))};
            
          </select>

          {/* Filtro por estado */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-3 rounded-lg border"
            style={{
              backgroundColor: "#FAF7F2",
              borderColor: "#E5DCC8",
              color: "#3D2817",
            }}
          >
            <option value="">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="completed">Completado</option>
            <option value="cancelled">Cancelado</option>
          </select>

          {/* Filtro por mínimo de productos */}
          <input
            type="number"
            placeholder="Min. productos"
            value={filterMinItems}
            onChange={(e) => setFilterMinItems(e.target.value)}
            className="p-3 rounded-lg border"
            style={{
              backgroundColor: "#FAF7F2",
              borderColor: "#E5DCC8",
              color: "#3D2817",
            }}
          />
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="rounded-xl shadow-sm p-12 text-center" style={{ backgroundColor: '#FAF7F2' }}>
            <div className="text-6xl mb-4">☕</div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: '#3D2817' }}>No hay pedidos</h3>
            <p style={{ color: '#8B7355' }}>No se han encontrado pedidos</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className={`rounded-xl shadow-md hover:shadow-xl transition cursor-pointer ${
                  selectedOrder?.id === order.id ? 'ring-2' : ''
                }`}
                style={{ 
                  backgroundColor: '#FAF7F2',
                  ...(selectedOrder?.id === order.id && { borderColor: '#A67C52' })
                }}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold" style={{ color: '#3D2817' }}>
                        Order #{order.id}
                      </h3>
                      <p className="text-sm mt-1" style={{ color: '#6B5744' }}>
                        {order.user.name}
                      </p>
                      <p className="text-xs" style={{ color: '#A0896F' }}>
                        {order.user.email}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${statusColors[order.status]}`}>
                      {statusLabels[order.status]}
                    </span>
                  </div>

                  {/* Items count */}
                  <div className="mb-4 pb-4 border-b" style={{ borderColor: '#E5DCC8' }}>
                    <p className="text-sm" style={{ color: '#8B7355' }}>
                      {order.orderItems.reduce((acc, item) => acc + item.quantity, 0)} producto{order.orderItems.reduce((acc, item) => acc + item.quantity, 0) !== 1 ? 's' : ''}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs" style={{ color: '#A0896F' }}>Total</p>
                      <p className="text-2xl font-bold" style={{ color: '#3D2817' }}>
                      </p>
                    </div>
                    <p className="text-xs" style={{ color: '#A0896F' }}>
                      {new Date(order.createdAt).toLocaleDateString('es-CL', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
            <div className="rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" style={{ backgroundColor: '#FAF7F2' }}>
              {/* Modal Header */}
              <div className="sticky top-0 border-b px-6 py-4 flex justify-between items-center" style={{ backgroundColor: '#FAF7F2', borderColor: '#E5DCC8' }}>
                <h2 className="text-2xl font-bold" style={{ color: '#3D2817' }}>
                  Order #{selectedOrder.id}
                </h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-2xl hover:opacity-70 transition"
                  style={{ color: '#8B7355' }}
                >
                  ×
                </button>
              </div>

              <div className="p-6">
                {/* Customer Info */}
                <div className="rounded-lg p-4 mb-6" style={{ backgroundColor: '#F5F0E8' }}>
                  <h3 className="font-semibold mb-2" style={{ color: '#3D2817' }}>Cliente</h3>
                  <p style={{ color: '#6B5744' }}>{selectedOrder.user.name}</p>
                  <p className="text-sm" style={{ color: '#8B7355' }}>{selectedOrder.user.email}</p>
                </div>

                {/* Status Update */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2" style={{ color: '#6B5744' }}>
                    Estado del pedido
                  </label>
                  <div className='w-full border-2 rounded-lg'>
                    <p className={`px-4 py-2 font-medium ${statusColors[selectedOrder.status]}`}> {statusLabels[selectedOrder.status]} </p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3" style={{ color: '#3D2817' }}>Productos</h3>
                  <div className="space-y-3">
                    {selectedOrder.orderItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 rounded-lg p-4" style={{ backgroundColor: '#F5F0E8' }}>
                        {item.product.imageUrl && (
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium" style={{ color: '#3D2817' }}>{item.product.name}</h4>
                          {item.product.description && (
                            <p className="text-sm" style={{ color: '#8B7355' }}>{item.product.description}</p>
                          )}
                          <p className="text-sm mt-1" style={{ color: '#A0896F' }}>
                            Cantidad: {item.quantity} × ${item.price.toLocaleString('es-CL')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold" style={{ color: '#3D2817' }}>
                            ${(item.price * item.quantity).toLocaleString('es-CL')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="border-t pt-4 mb-6" style={{ borderColor: '#E5DCC8' }}>
                  <div className="flex justify-between items-center text-xl font-bold" style={{ color: '#3D2817' }}>
                    <span>Total</span>
                    <span>
                        {selectedOrder.orderItems.reduce((total, item) => total + Number(item.price) * item.quantity, 0)
                        .toLocaleString("es-CL", { style: "currency", currency: "CLP" })}
                    </span>
                  </div>
                </div>

                {/* Order Info */}
                <div className="rounded-lg p-4 mb-6" style={{ backgroundColor: '#F5F0E8' }}>
                  <p className="text-sm" style={{ color: '#8B7355' }}>
                    Creado el {new Date(selectedOrder.createdAt).toLocaleString('es-CL', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="flex-1 py-3 rounded-lg transition font-medium"
                    style={{ backgroundColor: '#E5DCC8', color: '#6B5744' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#D4C5B0'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#E5DCC8'}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}