import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import { Sparkles, Users, ScrollText, Moon, ArrowRight, Activity, Calendar, Loader2, DollarSign } from 'lucide-react'
import { energyService, clientService, ritualService, spreadService, appointmentService, transactionService } from '../services/localStorage';

const Dashboard = () => {
  const { addToast } = useToast()
  const [stats, setStats] = useState({
    energyAvg: 0,
    clientCount: 0,
    ritualCount: 0,
    spreadCount: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [todaysAppointments, setTodaysAppointments] = useState<any[]>([]);
  const [financials, setFinancials] = useState({ income: 0, balance: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [energyData, clientsData, ritualsData, spreadsData, appointmentsData, transactionsData] = await Promise.all([
          energyService.getAll(),
          clientService.getAll(),
          ritualService.getAll(),
          spreadService.getAll(),
          appointmentService.getAll(),
          transactionService.getAll()
        ]);

        // Calculate Stats
        const avg = energyData.length > 0 
          ? (energyData.reduce((acc: number, curr: any) => acc + curr.energyLevel, 0) / energyData.length).toFixed(1) 
          : 0;

        setStats({
          energyAvg: Number(avg),
          clientCount: clientsData.length,
          ritualCount: ritualsData.length,
          spreadCount: spreadsData.length
        });

        // Today's Appointments
        const now = new Date();
        const todays = appointmentsData
          .filter((apt: any) => {
            if (apt.status === 'cancelled') return false;
            const aptDate = new Date(apt.date);
            return (
              aptDate.getDate() === now.getDate() &&
              aptDate.getMonth() === now.getMonth() &&
              aptDate.getFullYear() === now.getFullYear()
            );
          })
          .map((apt: any) => {
            const consultant = clientsData.find((c: any) => c.id.toString() === apt.ConsultantId?.toString());
            return { ...apt, Consultant: consultant };
          });

        setTodaysAppointments(todays);

        // Financials (Current Month)
        const currentMonth = new Date().getMonth();
        const monthlyTransactions = transactionsData.filter((t: any) => {
          const d = new Date(t.date);
          return d.getMonth() === currentMonth;
        });
        const income = monthlyTransactions.filter((t: any) => t.type === 'income').reduce((acc: number, curr: any) => acc + curr.amount, 0);
        const expense = monthlyTransactions.filter((t: any) => t.type === 'expense').reduce((acc: number, curr: any) => acc + curr.amount, 0);
        setFinancials({ income, balance: income - expense });

        // Merge and sort for Recent Activity
        const allActivities = [
          ...energyData.map((i: any) => ({ ...i, type: 'energy', date: i.date || i.createdAt })),
          ...ritualsData.map((i: any) => ({ ...i, type: 'ritual', date: i.date })),
          ...spreadsData.map((i: any) => ({ ...i, type: 'spread', date: i.date || i.createdAt }))
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

        setRecentActivity(allActivities);
      } catch (error) {
        console.error('Error loading dashboard:', error);
        addToast('Error al cargar el panel de control', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-purple-600 mb-4" />
        <p className="text-slate-500 font-medium">Cargando tu espacio sagrado...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-purple-900 to-indigo-900 text-white shadow-lg">
        {/* Subtle background effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>

        <div className="relative p-6 md:px-8 md:py-8 flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Text Content */}
          <div className="space-y-2 text-center md:text-left z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-medium text-purple-200 uppercase tracking-wider mb-2">
              <Sparkles size={10} /> Panel de Control
            </div>
            
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-tight">
              Bienvenido a tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-indigo-200">Espacio Sagrado</span>
            </h1>
            
            <p className="text-slate-300 text-sm leading-relaxed max-w-lg mx-auto md:mx-0">
              "La energía fluye hacia donde va la intención." Gestiona tu práctica mágica hoy.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 z-10 shrink-0">
            <Link to="/agenda" className="px-5 py-2.5 bg-white text-indigo-950 rounded-lg text-sm font-semibold hover:bg-indigo-50 transition-colors shadow-sm flex items-center gap-2 group">
              <Calendar size={16} className="group-hover:-translate-y-0.5 transition-transform" />
              Agenda
            </Link>
            <Link to="/consultant" className="px-5 py-2.5 bg-white/10 text-white border border-white/10 rounded-lg text-sm font-medium hover:bg-white/20 transition-all backdrop-blur-sm flex items-center gap-2 group">
              <Users size={16} className="group-hover:scale-110 transition-transform" />
              Nueva Sesión
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-lg transition-all group">
          <div className="p-4 bg-purple-50 text-purple-600 rounded-xl group-hover:scale-110 transition-transform">
            <Activity className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium uppercase tracking-wide">Nivel Energía</p>
            <h3 className="text-3xl font-bold text-slate-800">{stats.energyAvg}<span className="text-sm text-slate-400 font-normal">/10</span></h3>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-lg transition-all group">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
            <DollarSign className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium uppercase tracking-wide">Ingresos Mes</p>
            <h3 className="text-3xl font-bold text-slate-800">${financials.income}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-lg transition-all group">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-110 transition-transform">
            <ScrollText className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium uppercase tracking-wide">Tiradas</p>
            <h3 className="text-3xl font-bold text-slate-800">{stats.spreadCount}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-lg transition-all group">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-110 transition-transform">
            <Moon className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium uppercase tracking-wide">Rituales</p>
            <h3 className="text-3xl font-bold text-slate-800">{stats.ritualCount}</h3>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Activity */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800 font-serif">Actividad Reciente</h2>
            </div>
            <div className="divide-y divide-slate-50">
              {recentActivity.length === 0 ? (
                <div className="p-12 text-center text-slate-500">
                  <p>No hay actividad reciente.</p>
                </div>
              ) : (
                recentActivity.map((item, index) => (
                  <div key={index} className="p-4 hover:bg-slate-50 transition-colors flex items-center gap-4 group">
                    <div className={`
                      w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm
                      ${item.type === 'energy' ? 'bg-purple-100 text-purple-600' : 
                        item.type === 'ritual' ? 'bg-amber-100 text-amber-600' : 
                        'bg-indigo-100 text-indigo-600'}
                    `}>
                      {item.type === 'energy' ? <Sparkles size={20} /> : 
                       item.type === 'ritual' ? <Moon size={20} /> : 
                       <ScrollText size={20} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">
                        {item.type === 'energy' ? `Energía registrada: ${item.energyLevel}/10` :
                         item.type === 'ritual' ? item.intention :
                         item.question || 'Nueva Tirada'}
                      </p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <Calendar size={12} />
                        {new Date(item.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    <Link 
                      to={item.type === 'energy' ? '/energy' : item.type === 'ritual' ? '/rituals' : '/spreads'} 
                      className="p-2 text-slate-300 hover:text-purple-600 transition-colors bg-slate-50 hover:bg-purple-50 rounded-lg opacity-0 group-hover:opacity-100"
                    >
                      <ArrowRight size={18} />
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Agenda & Moon */}
        <div className="space-y-6">
          {/* Today's Agenda Widget */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-500" />
                Agenda de Hoy
              </h3>
              <Link to="/agenda" className="text-xs text-purple-600 hover:underline">Ver todo</Link>
            </div>
            <div className="p-4">
              {todaysAppointments.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-sm">
                  <p>No tienes citas para hoy.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todaysAppointments.map((apt: any) => (
                    <div key={apt.id} className="p-3 bg-purple-50 rounded-xl border border-purple-100 flex items-start gap-3">
                      <div className="bg-white p-2 rounded-lg text-purple-600 text-xs font-bold text-center min-w-[3rem]">
                        {(() => {
                          const d = new Date(apt.date);
                          return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
                        })()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{apt.title}</p>
                        {apt.Consultant ? (
                           <p className="text-xs text-slate-500">{apt.Consultant.name}</p>
                        ) : (
                           <p className="text-xs text-slate-400 italic">Sin cliente asignado</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-8 rounded-2xl border border-amber-100 shadow-sm">
            <h3 className="font-serif font-bold text-amber-900 mb-2 flex items-center gap-2">
              <Moon className="w-5 h-5" /> Fase Lunar
            </h3>
            <div className="flex items-center gap-4 my-6">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-200 to-orange-200 rounded-full flex items-center justify-center text-amber-800 shadow-inner">
                <Moon className="w-8 h-8 fill-current" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-900">Cuarto Creciente</p>
                <p className="text-sm text-amber-700 font-medium">Iluminación 45%</p>
              </div>
            </div>
            <p className="text-sm text-amber-800/80 italic border-t border-amber-200/50 pt-4 mt-2">
              "Momento ideal para sembrar intenciones y comenzar nuevos proyectos."
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}


export default Dashboard
