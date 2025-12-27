import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import { Sparkles, Save, Trash2, Edit2, X, User, Zap, History, Search, Calendar, FileText } from 'lucide-react'
import { ConfirmModal } from '../components/ConfirmModal'
import { consultantEnergyService, clientService } from '../services/localStorage';

const ConsultantEnergy = () => {
  const { addToast } = useToast()
  const [clients, setClients] = useState<any[]>([])
  const [consultantId, setConsultantId] = useState('')
  const [energyBefore, setEnergyBefore] = useState('')
  const [energyAfter, setEnergyAfter] = useState('')
  const [notes, setNotes] = useState('')
  const [history, setHistory] = useState<any[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
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
  }

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await consultantEnergyService.getAll();
      setHistory(data);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchClients();
    fetchHistory();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = { 
        ConsultantId: consultantId, 
        energyBefore, 
        energyAfter, 
        notes 
      };

      if (editingId) {
        await consultantEnergyService.update(editingId, payload);
        addToast('Sesión actualizada', 'success');
        setEditingId(null);
        setConsultantId('');
        setEnergyBefore('');
        setEnergyAfter('');
        setNotes('');
      } else {
        await consultantEnergyService.create(payload);
        addToast('Sesión registrada exitosamente', 'success');
        setConsultantId('');
        setEnergyBefore('');
        setEnergyAfter('');
        setNotes('');
      }
      fetchHistory();
    } catch (error) {
      addToast('Error al guardar el registro', 'error');
    }
  }

  const handleEdit = (item: any) => {
    setConsultantId(item.ConsultantId);
    setEnergyBefore(item.energyBefore);
    setEnergyAfter(item.energyAfter);
    setNotes(item.notes);
    setEditingId(item.id);
    addToast('Modo edición activado', 'info');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Eliminar Registro',
      message: '¿Estás seguro de que deseas eliminar este registro de energía?',
      id
    });
  };

  const handleConfirmDelete = async () => {
    if (!confirmModal.id) return;
    try {
        await consultantEnergyService.delete(confirmModal.id);
        addToast('Registro eliminado', 'success');
        fetchHistory();
    } catch (error) {
        addToast('Error al eliminar', 'error');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setConsultantId('');
    setEnergyBefore('');
    setEnergyAfter('');
    setNotes('');
  };

  const filteredHistory = history.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    const consultantName = item.Consultant?.name?.toLowerCase() || '';
    const notesLower = item.notes?.toLowerCase() || '';
    return consultantName.includes(searchLower) || notesLower.includes(searchLower);
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>
        
        <div className="relative p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <Zap className="w-6 h-6 text-yellow-300" />
              </div>
              <h1 className="text-3xl font-serif font-bold">Sesiones Energéticas</h1>
            </div>
            <p className="text-purple-200 text-lg max-w-xl">
              Registra y monitorea la evolución energética de tus consultantes.
            </p>
          </div>
          
          <div className="flex gap-3">
             <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 min-w-[140px] flex flex-col items-center text-center">
               <p className="text-purple-200 text-xs font-medium uppercase tracking-wider">Total Sesiones</p>
               <p className="text-3xl font-bold">{history.length}</p>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className={`bg-white rounded-2xl shadow-sm border transition-all duration-300 ${editingId ? 'border-yellow-400 ring-4 ring-yellow-50 shadow-xl' : 'border-slate-100'}`}>
            <div className="p-6 border-b border-slate-50">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                {editingId ? (
                  <>
                    <Edit2 className="w-5 h-5 text-yellow-500" />
                    Editando Sesión
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    Nueva Sesión
                  </>
                )}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              {/* Client Select */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <User size={16} className="text-slate-400" />
                  Consultante
                </label>
                <div className="relative">
                  <select 
                    value={consultantId} 
                    onChange={(e) => setConsultantId(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all appearance-none"
                    required
                  >
                    <option value="">Seleccionar consultante...</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
                <div className="flex justify-end">
                   <Link 
                     to="/clients" 
                     state={{ openNew: true }}
                     className="text-xs text-purple-600 hover:text-purple-700 font-medium hover:underline"
                   >
                     + Crear nuevo consultante
                   </Link>
                </div>
              </div>

              {/* Energy Before/After */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Energía Inicial</label>
                  <input 
                    type="text"
                    value={energyBefore} 
                    onChange={(e) => setEnergyBefore(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    placeholder="Ej. Densa, Pesada"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Energía Final</label>
                  <input 
                    type="text"
                    value={energyAfter} 
                    onChange={(e) => setEnergyAfter(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    placeholder="Ej. Ligera, Brillante"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <FileText size={16} className="text-slate-400" />
                  Observaciones
                </label>
                <textarea 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none"
                  placeholder="Detalles importantes de la sesión..."
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex gap-3">
                <button 
                  type="submit" 
                  disabled={!consultantId}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                >
                  {editingId ? <Save size={18} /> : <Zap size={18} />}
                  {editingId ? 'Actualizar' : 'Registrar Sesión'}
                </button>
                
                {editingId && (
                  <button 
                    type="button" 
                    onClick={handleCancelEdit}
                    className="px-4 py-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors font-medium flex items-center justify-center"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* History Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <History className="w-5 h-5 text-slate-400" />
              Historial Reciente
            </h2>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Buscar en historial..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none w-full sm:w-64 shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-slate-500">Cargando historial...</p>
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-slate-300">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <History className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-medium text-slate-800 mb-1">No se encontraron registros</h3>
                <p className="text-slate-500">Comienza registrando una nueva sesión energética.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredHistory.map((entry) => (
                  <div 
                    key={entry.id} 
                    className="group bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-purple-100 transition-all duration-200 relative overflow-hidden"
                  >
                    {/* Status Indicator Bar */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-400 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 font-bold text-sm border border-purple-100">
                          {entry.Consultant?.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800">
                            {entry.Consultant?.name || 'Consultante desconocido'}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Calendar size={12} />
                            {new Date(entry.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 duration-200">
                        <button 
                          onClick={() => handleEdit(entry)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(entry.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-3 grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Antes</span>
                        <p className="text-sm font-medium text-slate-700">{entry.energyBefore || '-'}</p>
                      </div>
                      <div className="border-l border-slate-200 pl-4">
                        <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider block mb-1">Después</span>
                        <p className="text-sm font-medium text-slate-700">{entry.energyAfter || '-'}</p>
                      </div>
                    </div>

                    {entry.notes && (
                      <div className="flex gap-2 items-start">
                         <FileText size={14} className="text-slate-400 mt-0.5 shrink-0" />
                         <p className="text-slate-600 text-sm italic leading-relaxed">
                           "{entry.notes}"
                         </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
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
    </div>
  )
}

export default ConsultantEnergy
