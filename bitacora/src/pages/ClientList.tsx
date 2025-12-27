import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserPlus, Users, Search, MoreVertical, Edit2, Trash2, Mail, FileText, X, Save } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { ConfirmModal } from '../components/ConfirmModal';
import { clientService } from '../services/localStorage';

export function ClientList() {
  const { addToast } = useToast();
  const location = useLocation();
  const [clients, setClients] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newClient, setNewClient] = useState({ name: '', email: '', notes: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    id: null as string | null
  });

  const fetchClients = async () => {
    try {
      const data = await clientService.getAll();
      setClients(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (location.state && (location.state as any).openNew) {
      setShowForm(true);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await clientService.update(editingId, newClient);
        addToast('Consultante actualizado', 'success');
      } else {
        await clientService.create(newClient);
        addToast('Consultante registrado exitosamente', 'success');
      }

      setNewClient({ name: '', email: '', notes: '' });
      setShowForm(false);
      setEditingId(null);
      fetchClients();
    } catch (error) {
      addToast('Error al guardar consultante', 'error');
    }
  };

  const handleEdit = (client: any) => {
    setNewClient({ name: client.name, email: client.email || '', notes: client.notes || '' });
    setEditingId(client.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Eliminar Consultante',
      message: '¿Estás seguro de que deseas eliminar este consultante? Se borrará TODO su historial permanentemente.',
      id
    });
  };

  const handleConfirmDelete = async () => {
    if (!confirmModal.id) return;

    try {
      await clientService.delete(confirmModal.id);
      addToast('Consultante eliminado', 'success');
      fetchClients();
    } catch (error) {
      addToast('Error al eliminar', 'error');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setNewClient({ name: '', email: '', notes: '' });
  };

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-800 flex items-center gap-3">
            <Users className="text-purple-600" size={32} />
            Consultantes
          </h1>
          <p className="text-slate-500 mt-1">Gestiona los perfiles y el historial de tus consultantes.</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setNewClient({ name: '', email: '', notes: '' });
          }}
          className="bg-purple-600 text-white px-5 py-3 rounded-xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 flex items-center gap-2 font-medium"
        >
          {showForm && !editingId ? <X size={20} /> : <UserPlus size={20} />}
          {showForm && !editingId ? 'Cerrar Formulario' : 'Nuevo Consultante'}
        </button>
      </div>

      {/* Formulario (Expandible) */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden animate-fade-in-down">
          <div className="p-6 bg-gradient-to-r from-purple-50 to-white border-b border-purple-100/50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-purple-900 flex items-center gap-2">
              {editingId ? <Edit2 size={18} /> : <UserPlus size={18} />}
              {editingId ? 'Editar Consultante' : 'Registrar Nuevo Consultante'}
            </h2>
            <button onClick={handleCancel} className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  placeholder="Ej. María Pérez"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email / Contacto</label>
                <input
                  type="text"
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  placeholder="ejemplo@email.com"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notas Generales</label>
                <textarea
                  value={newClient.notes}
                  onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none h-[120px]"
                  placeholder="Notas iniciales sobre el consultante..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 text-white px-6 py-2 rounded-xl hover:bg-purple-700 transition-all shadow-md shadow-purple-200 font-medium flex items-center gap-2"
                >
                  <Save size={18} />
                  {editingId ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none shadow-sm transition-all text-lg"
        />
      </div>

      {/* Grid de Tarjetas */}
      {filteredClients.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
          <div className="bg-white p-4 rounded-full inline-block shadow-sm mb-4">
            <Users className="text-slate-300" size={48} />
          </div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">No se encontraron consultantes</h3>
          <p className="text-slate-500">Intenta con otro término de búsqueda o agrega uno nuevo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <div key={client.id} className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:border-purple-100 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-10">
                <button 
                  onClick={(e) => { e.preventDefault(); handleEdit(client); }}
                  className="p-2 bg-white text-blue-600 rounded-lg shadow-sm hover:bg-blue-50 transition-colors"
                  title="Editar"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={(e) => { e.preventDefault(); handleDeleteClick(client.id); }}
                  className="p-2 bg-white text-red-600 rounded-lg shadow-sm hover:bg-red-50 transition-colors"
                  title="Eliminar"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <Link to={`/clients/${client.id}`} className="block">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center text-purple-700 font-bold text-xl shadow-inner">
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-800 mb-1 group-hover:text-purple-700 transition-colors">{client.name}</h3>
                
                {client.email && (
                  <div className="flex items-center gap-2 text-slate-500 text-sm mb-3">
                    <Mail size={14} />
                    {client.email}
                  </div>
                )}

                {client.notes && (
                  <div className="flex items-start gap-2 text-slate-400 text-sm bg-slate-50 p-3 rounded-xl mb-4 line-clamp-2 min-h-[60px]">
                    <FileText size={14} className="shrink-0 mt-0.5" />
                    <span className="italic">"{client.notes}"</span>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100 flex justify-between items-center mt-auto">
                  <span className="text-xs font-bold text-purple-600 uppercase tracking-wider flex items-center gap-1">
                    Ver Perfil
                  </span>
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-purple-600 group-hover:text-white transition-all">
                    <MoreVertical size={16} className="rotate-90" />
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

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
    </div>
  );
}
