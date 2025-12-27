import { useState, useEffect } from 'react'
import { useToast } from '../context/ToastContext'
import { Sparkles, Calendar, Edit2, Trash2, Zap, Save, X, Activity, Search, Loader2 } from 'lucide-react'
import { ConfirmModal } from '../components/ConfirmModal'
import { energyService } from '../services/localStorage';

const DailyEnergy = () => {
  const { addToast } = useToast()
  const [energy, setEnergy] = useState(5)
  const [mood, setMood] = useState('')
  const [notes, setNotes] = useState('')
  const [history, setHistory] = useState<any[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isMoodOpen, setIsMoodOpen] = useState(false)
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    id: null as string | null
  });

  const fetchHistory = async () => {
    try {
      const data = await energyService.getAll();
      setHistory(data);
    } catch (error) {
      console.error('Error fetching history:', error);
      addToast('Error al cargar el historial', 'error');
    } finally {
      setLoading(false);
    }
  }

  const moods = [
    { value: 'radiante', label: 'Radiante', icon: '🌟', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'tranquila', label: 'Tranquila', icon: '🍃', color: 'bg-green-100 text-green-700' },
    { value: 'cansada', label: 'Cansada', icon: '💤', color: 'bg-slate-100 text-slate-700' },
    { value: 'bloqueada', label: 'Bloqueada', icon: '🔒', color: 'bg-red-100 text-red-700' },
    { value: 'intuitiva', label: 'Intuitiva', icon: '🔮', color: 'bg-purple-100 text-purple-700' }
  ];

  const getMoodLabel = (val: string) => {
    const m = moods.find(m => m.value === val);
    return m ? (
      <div className="flex items-center gap-2">
        <span>{m.icon}</span>
        <span>{m.label}</span>
      </div>
    ) : 'Selecciona cómo te sientes...';
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        await energyService.update(editingId, { energyLevel: energy, mood, notes });
        addToast('Registro actualizado', 'success');
      } else {
        await energyService.create({ energyLevel: energy, mood, notes });
        addToast('Registro guardado exitosamente', 'success');
      }

      setNotes('');
      setMood('');
      setEnergy(5);
      setEditingId(null);
      fetchHistory();
    } catch (error) {
      addToast('Error al guardar el registro', 'error');
    }
  }

  const handleEdit = (item: any) => {
    setEnergy(item.energyLevel);
    setMood(item.mood);
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
        await energyService.delete(confirmModal.id);
        addToast('Registro eliminado', 'success');
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
    setNotes('');
    setMood('');
    setEnergy(5);
  };

  const filteredHistory = history.filter(item => {
    const term = searchTerm.toLowerCase();
    const moodMatch = item.mood?.toLowerCase().includes(term) || false;
    const notesMatch = item.notes?.toLowerCase().includes(term) || false;
    const dateMatch = new Date(item.date).toLocaleDateString().includes(term);
    return moodMatch || notesMatch || dateMatch;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header Moderno con Gradiente */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="relative p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <Sparkles className="w-6 h-6 text-purple-300" />
              </div>
              <h1 className="text-3xl font-serif font-bold">Energía Diaria</h1>
            </div>
            <p className="text-purple-200 text-lg max-w-xl">
              Registra y monitorea tu vibración personal y estado de ánimo.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 min-w-[140px] flex flex-col items-center text-center">
              <p className="text-purple-200 text-xs font-medium uppercase tracking-wider">Promedio Energía</p>
              <p className="text-3xl font-bold">
                {history.length > 0 
                  ? (history.reduce((acc, curr) => acc + curr.energyLevel, 0) / history.length).toFixed(1)
                  : '0.0'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Formulario */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden sticky top-8">
            <div className="p-6 bg-gradient-to-r from-purple-50 to-white border-b border-purple-100/50">
              <h2 className="text-lg font-bold text-purple-900 flex items-center gap-2">
                {editingId ? <Edit2 size={18} /> : <Zap size={18} />}
                {editingId ? 'Editar Registro' : 'Nuevo Registro'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-4 flex justify-between">
                  <span>Nivel de Energía</span>
                  <span className="text-purple-600 font-bold">{energy}/10</span>
                </label>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={energy} 
                  onChange={(e) => setEnergy(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-2 px-1">
                  <span>Baja</span>
                  <span>Alta</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Estado de Ánimo</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsMoodOpen(!isMoodOpen)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all flex items-center justify-between text-left text-slate-700"
                  >
                    {getMoodLabel(mood)}
                    <svg className={`w-4 h-4 text-slate-400 transition-transform ${isMoodOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </button>
                  
                  {isMoodOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden animate-fade-in-up">
                      <div className="p-2 space-y-1">
                        {moods.map((m) => (
                          <button
                            key={m.value}
                            type="button"
                            onClick={() => {
                              setMood(m.value);
                              setIsMoodOpen(false);
                            }}
                            className={`w-full p-3 rounded-lg flex items-center gap-3 transition-colors ${mood === m.value ? 'bg-purple-50 text-purple-900 font-medium' : 'hover:bg-slate-50 text-slate-700'}`}
                          >
                            <span className="text-xl">{m.icon}</span>
                            <span>{m.label}</span>
                            {mood === m.value && <div className="ml-auto w-2 h-2 rounded-full bg-purple-500"></div>}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {isMoodOpen && (
                    <div className="fixed inset-0 z-40" onClick={() => setIsMoodOpen(false)}></div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Notas / Señales</label>
                <textarea 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none"
                  placeholder="¿Qué sentiste hoy? ¿Hubo alguna señal?"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="submit" 
                  className="flex-1 bg-purple-600 text-white py-3 px-4 rounded-xl hover:bg-purple-700 transition-all font-medium shadow-lg shadow-purple-200 flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  {editingId ? 'Actualizar' : 'Guardar'}
                </button>
                {editingId && (
                  <button 
                    type="button" 
                    onClick={handleCancelEdit}
                    className="bg-slate-100 text-slate-600 py-3 px-4 rounded-xl hover:bg-slate-200 transition-colors font-medium"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Historial */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[500px]">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800 font-serif flex items-center gap-2">
                <Activity size={18} className="text-purple-500" />
                Historial de Registros
              </h2>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Buscar en notas o estado..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
            
            <div className="divide-y divide-slate-50">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <Loader2 className="w-10 h-10 animate-spin mb-3 text-purple-400" />
                  <p>Cargando energía...</p>
                </div>
              ) : filteredHistory.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-800 mb-1">No se encontraron registros</h3>
                  <p className="text-slate-500">
                    {searchTerm ? 'Intenta con otros términos de búsqueda.' : 'Comienza registrando tu energía de hoy.'}
                  </p>
                </div>
              ) : (
                filteredHistory.map((item: any) => (
                  <div key={item.id} className="p-6 hover:bg-slate-50 transition-colors group flex gap-5 items-start">
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <div className={`
                        w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold shadow-sm
                        ${item.energyLevel >= 8 ? 'bg-green-100 text-green-600' : 
                          item.energyLevel >= 5 ? 'bg-purple-100 text-purple-600' : 
                          'bg-orange-100 text-orange-600'}
                      `}>
                        {item.energyLevel}
                      </div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Nivel</span>
                    </div>

                    <div className="flex-1 min-w-0 pt-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-slate-800 capitalize text-lg flex items-center gap-2">
                          {item.mood || 'Sin estado'}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded-full shadow-sm">
                          <Calendar size={12} />
                          {new Date(item.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                      </div>
                      
                      <p className="text-slate-600 text-sm leading-relaxed mb-3">
                        {item.notes || <span className="text-slate-400 italic">Sin notas adicionales.</span>}
                      </p>
                      
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                        <button 
                          onClick={() => handleEdit(item)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
                        >
                          <Edit2 size={14} /> Editar
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(item.id)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
                        >
                          <Trash2 size={14} /> Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
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

export default DailyEnergy
