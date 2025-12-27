import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Wallet, Plus, Trash2, Calendar, Tag, ArrowUpRight, ArrowDownRight, XCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { ConfirmModal } from '../components/ConfirmModal';
import { transactionService, clientService } from '../services/localStorage';

export function Finance() {
  const { addToast } = useToast();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [consultants, setConsultants] = useState<any[]>([]);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    id: null as string | null
  });
  
  // Form State
  const [formData, setFormData] = useState({
    amount: '',
    type: 'income',
    category: 'consultation',
    description: '',
    date: new Date().toISOString().split('T')[0],
    ConsultantId: ''
  });

  useEffect(() => {
    fetchTransactions();
    fetchConsultants();
  }, []);

  const fetchTransactions = async () => {
    try {
      const data = await transactionService.getAll();
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConsultants = async () => {
    try {
      const data = await clientService.getAll();
      setConsultants(data);
    } catch (error) {
      console.error('Error fetching consultants:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await transactionService.create({
        ...formData,
        amount: parseFloat(formData.amount),
        type: formData.type as 'income' | 'expense'
      });

      setIsModalOpen(false);
      fetchTransactions();
      setFormData({
        amount: '',
        type: 'income',
        category: 'consultation',
        description: '',
        date: new Date().toISOString().split('T')[0],
        ConsultantId: ''
      });
    } catch (error) {
      console.error('Error creating transaction:', error);
    }
  };

  const handleDeleteClick = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Eliminar Movimiento',
      message: '¿Estás seguro de que deseas eliminar este registro financiero? El balance se recalculará.',
      id
    });
  };

  const handleConfirmDelete = async () => {
    if (!confirmModal.id) return;

    try {
      await transactionService.delete(confirmModal.id);
      addToast('Movimiento eliminado', 'success');
      fetchTransactions();
    } catch (error) {
      addToast('Error al eliminar', 'error');
    }
  };

  // Calculate Stats (Current Month)
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalIncome = monthlyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold mb-2">Finanzas & Resultados</h1>
            <p className="text-emerald-200">Control de ingresos y gastos mensuales.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 rounded-xl shadow-lg shadow-emerald-900/20 flex items-center gap-2 transition-all hover:scale-105 font-medium"
          >
            <Plus size={20} />
            Nuevo Movimiento
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp size={64} className="text-emerald-600" />
          </div>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Ingresos (Mes)</p>
          <h3 className="text-3xl font-bold text-slate-800">{formatCurrency(totalIncome)}</h3>
          <div className="flex items-center gap-1 text-emerald-600 text-sm mt-2 font-medium">
            <ArrowUpRight size={16} />
            <span>Entradas registradas</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingDown size={64} className="text-rose-600" />
          </div>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Gastos (Mes)</p>
          <h3 className="text-3xl font-bold text-slate-800">{formatCurrency(totalExpense)}</h3>
          <div className="flex items-center gap-1 text-rose-600 text-sm mt-2 font-medium">
            <ArrowDownRight size={16} />
            <span>Salidas registradas</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wallet size={64} className="text-blue-600" />
          </div>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Balance Neto</p>
          <h3 className={`text-3xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
            {formatCurrency(balance)}
          </h3>
          <div className="flex items-center gap-1 text-slate-500 text-sm mt-2">
            <span>Disponible</span>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-lg text-slate-800">Movimientos Recientes</h3>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-200"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No hay transacciones registradas.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-medium">
                <tr>
                  <th className="px-6 py-4 text-left">Fecha</th>
                  <th className="px-6 py-4 text-left">Descripción</th>
                  <th className="px-6 py-4 text-left">Categoría</th>
                  <th className="px-6 py-4 text-right">Monto</th>
                  <th className="px-6 py-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((t: any) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-400" />
                        {new Date(t.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">{t.description || 'Sin descripción'}</div>
                      {t.Consultant && (
                        <div className="text-xs text-slate-500 mt-0.5">Cliente: {t.Consultant.name}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        <Tag size={12} />
                        {t.category}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-right font-mono font-medium ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleDeleteClick(t.id)}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={handleConfirmDelete}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="Eliminar"
        isDestructive={true}
      />

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-xl text-slate-800">Registrar Movimiento</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div 
                  className={`border-2 rounded-xl p-3 cursor-pointer transition-all text-center ${formData.type === 'income' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-500'}`}
                  onClick={() => setFormData({...formData, type: 'income'})}
                >
                  <span className="font-bold block">Ingreso</span>
                </div>
                <div 
                  className={`border-2 rounded-xl p-3 cursor-pointer transition-all text-center ${formData.type === 'expense' ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-slate-200 text-slate-500'}`}
                  onClick={() => setFormData({...formData, type: 'expense'})}
                >
                  <span className="font-bold block">Gasto</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Monto</label>
                <div className="relative">
                  <span className="absolute left-4 top-2.5 text-slate-400">$</span>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full pl-8 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-mono"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
                  <input 
                    required
                    type="date" 
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  >
                    <option value="consultation">Consulta</option>
                    <option value="ritual">Ritual</option>
                    <option value="product">Producto</option>
                    <option value="material">Materiales</option>
                    <option value="other">Otro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cliente (Opcional)</label>
                <select 
                  value={formData.ConsultantId}
                  onChange={(e) => setFormData({...formData, ConsultantId: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                >
                  <option value="">Seleccionar cliente...</option>
                  {consultants.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                <input 
                  type="text" 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  placeholder="Detalles del movimiento..."
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-emerald-600 text-white py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
              >
                Registrar Movimiento
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
