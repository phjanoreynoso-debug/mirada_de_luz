import { useState, useEffect } from 'react'
import { useToast } from '../context/ToastContext'
import { Sparkles, Save, Trash2, Edit2, X, Search, Calendar, User, FileText, Moon, Heart } from 'lucide-react'
import { ConfirmModal } from '../components/ConfirmModal'
import { ritualService, clientService } from '../services/localStorage';

const Rituals = () => {
  const { addToast } = useToast()
  const [clients, setClients] = useState<any[]>([])
  const [consultantId, setConsultantId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [intention, setIntention] = useState('')
  const [result, setResult] = useState('')
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
      const data = await ritualService.getAll();
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
        ConsultantId: consultantId || null, 
        date, 
        intention, 
        result 
      };

      if (editingId) {
        await ritualService.update(editingId, payload);
        addToast('Ritual actualizado', 'success');
      } else {
        await ritualService.create(payload);
        addToast('Ritual guardado exitosamente', 'success');
      }

      setConsultantId('');
      setIntention('');
      setResult('');
      setEditingId(null);
      fetchHistory();
    } catch (error) {
      addToast('Error al guardar el ritual', 'error');
    }
  }

  const handleEdit = (item: any) => {
    setConsultantId(item.ConsultantId || '');
    setDate(item.date);
    setIntention(item.intention);
    setResult(item.result);
    setEditingId(item.id);
    addToast('Modo edición activado', 'info');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Eliminar Ritual',
      message: '¿Estás seguro de que deseas eliminar este registro de ritual?',
      id
    });
  };

  const handleConfirmDelete = async () => {
    if (!confirmModal.id) return;
    try {
        await ritualService.delete(confirmModal.id);
        addToast('Ritual eliminado', 'success');
        fetchHistory();
        if (editingId === confirmModal.id) {
            handleCancelEdit();
        }
    } catch (error) {
        addToast('Error al eliminar', 'error');
    }
  };



  const handleCancelEdit = () => {
    setEditingId(null);
    setConsultantId('');
    setIntention('');
    setResult('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  const filteredHistory = history.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    const intentionLower = item.intention?.toLowerCase() || '';
    const resultLower = item.result?.toLowerCase() || '';
    const consultantName = item.Consultant?.name?.toLowerCase() || '';
    return intentionLower.includes(searchLower) || resultLower.includes(searchLower) || consultantName.includes(searchLower);
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-900 via-orange-900 to-slate-900 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>
        
        <div className="relative p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <Moon className="w-6 h-6 text-amber-300" />
              </div>
              <h1 className="text-3xl font-serif font-bold">Registro de Rituales</h1>
            </div>
            <p className="text-amber-200 text-lg max-w-xl">
              Documenta ceremonias, limpiezas y trabajos energéticos.
            </p>
          </div>
          
          <div className="flex gap-3">
             <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 min-w-[140px] flex flex-col items-center text-center">
               <p className="text-amber-200 text-xs font-medium uppercase tracking-wider">Total Rituales</p>
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
                    Editando Ritual
                  </>
                ) : (
                  <>
                    <Heart className="w-5 h-5 text-amber-500" />
                    Nuevo Ritual
                  </>
                )}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              {/* Client Select */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <User size={16} className="text-slate-400" />
                  Consultante (Opcional)
                </label>
                <div className="relative">
                  <select 
                    value={consultantId} 
                    onChange={(e) => setConsultantId(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all appearance-none"
                  >
                    <option value="">-- Personal / Sin Consultante --</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Calendar size={16} className="text-slate-400" />
                  Fecha
                </label>
                <input 
                  type="date"
                  value={date} 
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* Intention */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Sparkles size={16} className="text-slate-400" />
                  Intención
                </label>
                <textarea 
                  value={intention} 
                  onChange={(e) => setIntention(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all resize-none"
                  placeholder="¿Cuál es el propósito de este ritual?"
                />
              </div>

              {/* Result */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <FileText size={16} className="text-slate-400" />
                  Resultado / Observaciones
                </label>
                <textarea 
                  value={result} 
                  onChange={(e) => setResult(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all resize-none"
                  placeholder="¿Qué sucedió después? ¿Cómo te sentiste?"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex gap-3">
                <button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 text-white py-3 px-6 rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  {editingId ? <Save size={18} /> : <Moon size={18} />}
                  {editingId ? 'Actualizar' : 'Guardar Ritual'}
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
              <Moon className="w-5 h-5 text-slate-400" />
              Rituales Pasados
            </h2>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Buscar rituales..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none w-full sm:w-64 shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600 mx-auto mb-4"></div>
                <p className="text-slate-500">Cargando historial...</p>
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-slate-300">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Moon className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-medium text-slate-800 mb-1">No se encontraron rituales</h3>
                <p className="text-slate-500">Registra tu primer ritual o ceremonia.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredHistory.map((item) => (
                  <div 
                    key={item.id} 
                    className="group bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-amber-100 transition-all duration-200 relative overflow-hidden"
                  >
                    {/* Status Indicator Bar */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 font-bold text-sm border border-amber-100">
                          {item.Consultant ? item.Consultant.name.charAt(0) : <User size={16} />}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800">
                            {item.intention || 'Sin intención definida'}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Calendar size={12} />
                            {new Date(item.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            {item.Consultant && (
                              <>
                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                <span className="text-amber-600 font-medium">{item.Consultant.name}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 duration-200">
                        <button 
                          onClick={() => handleEdit(item)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(item.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {item.result && (
                      <div className="bg-slate-50 rounded-xl p-3 flex gap-2 items-start">
                         <FileText size={14} className="text-slate-400 mt-0.5 shrink-0" />
                         <p className="text-slate-600 text-sm italic leading-relaxed">
                           "{item.result}"
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

export default Rituals
