import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Plus, Trash2, CheckCircle, XCircle, User } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { ConfirmModal } from '../components/ConfirmModal';
import { appointmentService, clientService } from '../services/localStorage';

export function Agenda() {
  const { addToast } = useToast();
  const [appointments, setAppointments] = useState<any[]>([]);
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
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    ConsultantId: '',
    notes: '',
    status: 'scheduled'
  });

  useEffect(() => {
    fetchAppointments();
    fetchConsultants();
  }, []);

  const fetchAppointments = async () => {
    try {
      const [appointmentsData, clientsData] = await Promise.all([
        appointmentService.getAll(),
        clientService.getAll()
      ]);

      const enrichedAppointments = appointmentsData.map(apt => {
        const consultant = clientsData.find(c => c.id.toString() === apt.ConsultantId?.toString());
        return {
          ...apt,
          Consultant: consultant
        };
      });

      setAppointments(enrichedAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      addToast('Error al cargar citas', 'error');
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
    const fullDate = new Date(`${formData.date}T${formData.time}`);
    
    try {
      await appointmentService.create({
        ...formData,
        date: fullDate.toISOString(),
        status: formData.status as 'scheduled' | 'completed' | 'cancelled'
      });

      setIsModalOpen(false);
      fetchAppointments();
      setFormData({
        title: '',
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
        ConsultantId: '',
        notes: '',
        status: 'scheduled'
      });
      addToast('Cita creada exitosamente', 'success');
    } catch (error) {
      console.error('Error creating appointment:', error);
      addToast('Error al crear la cita', 'error');
    }
  };

  const handleDeleteClick = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Eliminar Cita',
      message: '¿Estás seguro de que deseas eliminar esta cita? Esta acción no se puede deshacer.',
      id
    });
  };

  const handleConfirmDelete = async () => {
    if (!confirmModal.id) return;

    try {
      await appointmentService.delete(confirmModal.id);
      addToast('Cita eliminada', 'success');
      fetchAppointments();
    } catch (error) {
      addToast('Error al eliminar', 'error');
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await appointmentService.update(id.toString(), { status: newStatus as any });
      fetchAppointments();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      default: return 'Programada';
    }
  };

  // Group appointments by date
  const groupedAppointments = appointments.reduce((groups: any, appointment) => {
    const date = new Date(appointment.date).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(appointment);
    return groups;
  }, {});

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold mb-2">Agenda & Planificación</h1>
            <p className="text-slate-400">Organiza tus sesiones y eventos importantes.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl shadow-lg shadow-purple-900/20 flex items-center gap-2 transition-all hover:scale-105 font-medium"
          >
            <Plus size={20} />
            Nueva Cita
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : Object.keys(groupedAppointments).length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="inline-block p-4 bg-slate-50 rounded-full mb-4">
            <CalendarIcon size={32} className="text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-700">Agenda vacía</h3>
          <p className="text-slate-500 mt-2">No tienes citas programadas. ¡Agrega una nueva para comenzar!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedAppointments).map(([date, items]: [string, any]) => (
            <div key={date} className="animate-fade-in-up bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                 <div className="w-1.5 h-6 bg-purple-500 rounded-full"></div>
                 <h3 className="text-lg font-bold text-slate-700 capitalize">
                  {new Date(items[0].date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                 </h3>
              </div>
              
              <div className="divide-y divide-slate-100">
                {items.map((apt: any) => (
                  <div key={apt.id} className="p-4 hover:bg-slate-50 transition-colors flex flex-col md:flex-row gap-4 items-center group">
                    {/* Time & Status Badge */}
                    <div className="flex items-center gap-4 min-w-[140px]">
                      <span className="text-lg font-bold text-slate-700 font-mono">
                        {new Date(apt.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${getStatusColor(apt.status)}`}>
                        {getStatusLabel(apt.status)}
                      </span>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 text-center md:text-left">
                      <h4 className="font-bold text-slate-800">{apt.title}</h4>
                      {apt.Consultant && (
                        <div className="flex items-center justify-center md:justify-start gap-1.5 text-slate-500 text-sm mt-0.5">
                          <User size={12} className="text-purple-400" />
                          <span>{apt.Consultant.name}</span>
                        </div>
                      )}
                      {apt.notes && (
                        <p className="text-slate-400 text-xs mt-1 line-clamp-1 italic">{apt.notes}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all">
                      {apt.status === 'scheduled' && (
                        <>
                          <button 
                            onClick={() => handleStatusChange(apt.id, 'completed')}
                            className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg tooltip transition-colors"
                            title="Marcar como completada"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button 
                            onClick={() => handleStatusChange(apt.id, 'cancelled')}
                            className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg tooltip transition-colors"
                            title="Cancelar cita"
                          >
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => handleDeleteClick(apt.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-1"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
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

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-xl text-slate-800">Nueva Cita</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
                <input 
                  required
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  placeholder="Ej. Lectura de Tarot"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
                  <input 
                    required
                    type="date" 
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Hora</label>
                  <input 
                    required
                    type="time" 
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cliente (Opcional)</label>
                <select 
                  value={formData.ConsultantId}
                  onChange={(e) => setFormData({...formData, ConsultantId: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                >
                  <option value="">Seleccionar cliente...</option>
                  {consultants.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notas</label>
                <textarea 
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all h-24 resize-none"
                  placeholder="Detalles adicionales..."
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-purple-600 text-white py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200"
              >
                Agendar Cita
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
