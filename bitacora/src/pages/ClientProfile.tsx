import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, Link } from 'react-router-dom';
import { User, Activity, Layers, Sparkles, Calendar, ArrowLeft, Mail, Clock, FileText, Wand2, Save, Printer, Palette, Type, Smile } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { clientService } from '../services/localStorage';

export function ClientProfile() {
  const { id } = useParams();
  const { addToast } = useToast();
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, energy, spreads, rituals, report
  const [reportText, setReportText] = useState('');
  const [reportMode, setReportMode] = useState<'visual' | 'text'>('visual');
  const [diagnosis, setDiagnosis] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  
  // Design Configuration
  const [reportConfig, setReportConfig] = useState({
        theme: 'purple',
        font: 'mystical',
        decoration: 'ornate',
        showStats: true
    });

  const themes: any = {
    purple: { primary: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-100', gradient: 'from-purple-600 to-indigo-600', accent: 'text-purple-500' },
    blue: { primary: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-100', gradient: 'from-blue-600 to-cyan-600', accent: 'text-blue-500' },
    amber: { primary: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-100', gradient: 'from-amber-500 to-orange-500', accent: 'text-amber-500' },
    rose: { primary: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-100', gradient: 'from-rose-500 to-pink-500', accent: 'text-rose-500' },
    emerald: { primary: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100', gradient: 'from-emerald-600 to-teal-600', accent: 'text-emerald-500' },
    slate: { primary: 'text-slate-800', bg: 'bg-slate-100', border: 'border-slate-200', gradient: 'from-slate-700 to-slate-900', accent: 'text-slate-600' },
  };

  const fonts: any = {
    serif: 'font-serif',
    sans: 'font-sans',
    mystical: 'font-mystical',
    hand: 'font-hand',
    title: 'font-title'
  };

  const mysticalEmojis = ['✨', '🌙', '🔮', '🕯️', '🪷', '🧿', '⭐', '🌿', '🔥', '💧', '💨', '🌱', '☀️', '🌕', '🌑', '⚜️', '🗝️', '📜'];

  useEffect(() => {
    const savedLogo = localStorage.getItem('bitacora_custom_logo');
    if (savedLogo) {
        setCustomLogo(savedLogo);
    }
  }, []);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        if (!id) return;
        const data = await clientService.getById(id);
        if (data) {
          setClient(data);
          if (data.clientReport) {
            setReportText(data.clientReport);
            // Try to extract diagnosis if possible, otherwise leave empty or full text
            setDiagnosis(data.clientReport); 
          }
        } else {
            addToast('Consultante no encontrado', 'error');
        }
      } catch (error) {
        console.error('Error fetching client:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchClient();
  }, [id]);

  const generateReport = () => {
    if (!client) return;
    
    const energies = client.ConsultantEnergies || [];
    const spreads = client.Spreads || [];
    const rituals = client.Rituals || [];
    
    let report = `INFORME PROFESIONAL: ${client.name.toUpperCase()}\n`;
    report += `Fecha de Emisión: ${new Date().toLocaleDateString()}\n`;
    report += `------------------------------------------------\n\n`;
    
    report += `1. RESUMEN DE ACTIVIDAD\n`;
    report += `   - Sesiones de Energía: ${energies.length}\n`;
    report += `   - Tiradas de Tarot: ${spreads.length}\n`;
    report += `   - Rituales Realizados: ${rituals.length}\n\n`;
    
    if (energies.length > 0) {
      const lastEnergy = energies[0];
      report += `2. ANÁLISIS ENERGÉTICO RECIENTE\n`;
      report += `   Fecha: ${new Date(lastEnergy.createdAt).toLocaleDateString()}\n`;
      report += `   Evolución: ${lastEnergy.energyBefore} ➔ ${lastEnergy.energyAfter}\n`;
      report += `   Notas: ${lastEnergy.notes || 'Sin notas adicionales'}\n\n`;
    }
    
    if (spreads.length > 0) {
      const lastSpread = spreads[0];
      report += `3. ÚLTIMA LECTURA DE TAROT\n`;
      report += `   Fecha: ${new Date(lastSpread.createdAt).toLocaleDateString()}\n`;
      report += `   Consulta: "${lastSpread.question}"\n`;
      report += `   Interpretación Clave: ${lastSpread.interpretation}\n\n`;
    }
    
    report += `4. DIAGNÓSTICO Y RESULTADOS\n`;
    report += `   Se observa un progreso notable en...\n`;
    report += `   [Completa con tu análisis profesional aquí]\n\n`;
    
    report += `5. RECOMENDACIONES\n`;
    report += `   - [Recomendación 1]\n`;
    report += `   - [Recomendación 2]\n`;
    
    setReportText(report);
    
    // For visual mode, we reset the diagnosis part to a default template if it's empty
    if (!diagnosis || diagnosis === report) {
         setDiagnosis("Se observa un progreso notable en...\n\nRecomendaciones:\n- ");
    }
    
    addToast('Informe generado', 'success');
  };

  const saveReport = async () => {
    setIsSaving(true);
    try {
      if (!id) return;
      // If in visual mode, we save the diagnosis as the report text
      // Ideally we would have separate fields, but for now we reuse clientReport
      const textToSave = reportMode === 'visual' ? diagnosis : reportText;
      
      await clientService.update(id, { clientReport: textToSave });
      
      // Sync the states so switching views doesn't lose data immediately
      if (reportMode === 'visual') setReportText(textToSave);
      else setDiagnosis(textToSave);

      addToast('Informe guardado correctamente', 'success');
    } catch (error) {
      console.error('Error saving report:', error);
      addToast('Error al guardar el informe', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
    </div>
  );
  
  if (!client) return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-bold text-slate-700">Consultante no encontrado</h2>
      <Link to="/clients" className="text-purple-600 hover:underline mt-4 inline-block">Volver a la lista</Link>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden no-print">
        <div className="bg-gradient-to-r from-purple-50 to-white p-6 border-b border-purple-100/50">
          <Link to="/clients" className="text-slate-500 hover:text-purple-600 flex items-center gap-1 mb-6 text-sm font-medium transition-colors">
            <ArrowLeft size={16} /> Volver a Consultantes
          </Link>
          
          <div className="flex flex-col md:flex-row items-start justify-between gap-6">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-serif text-4xl shadow-lg shadow-purple-200">
                {client.name.charAt(0).toUpperCase()}
              </div>
              
              <div>
                <h1 className="text-3xl font-serif font-bold text-slate-800 flex items-center gap-3">
                  {client.name}
                </h1>
                
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-500">
                  {client.email && (
                    <div className="flex items-center gap-1.5">
                      <Mail size={14} />
                      {client.email}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} />
                    Registrado el {new Date(client.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {client.notes && (
          <div className="p-6 bg-slate-50/50">
            <div className="flex items-start gap-3 text-slate-600 italic">
              <FileText size={18} className="text-purple-400 shrink-0 mt-1" />
              <p>"{client.notes}"</p>
            </div>
          </div>
        )}
      </div>

      {/* Stats / Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 no-print">
        <button 
          onClick={() => setActiveTab('energy')}
          className={`p-6 rounded-2xl border transition-all text-left group ${activeTab === 'energy' ? 'bg-purple-50 border-purple-200 ring-2 ring-purple-100' : 'bg-white border-slate-100 hover:border-purple-100 hover:shadow-md'}`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-purple-100 rounded-lg text-purple-600 group-hover:scale-110 transition-transform">
              <Activity size={20} />
            </div>
            <span className="text-3xl font-bold text-slate-800">{client.ConsultantEnergies?.length || 0}</span>
          </div>
          <h3 className="font-bold text-slate-700">Sesiones</h3>
          <p className="text-xs text-slate-500 mt-1">Limpiezas y consultas</p>
        </button>

        <button 
          onClick={() => setActiveTab('spreads')}
          className={`p-6 rounded-2xl border transition-all text-left group ${activeTab === 'spreads' ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-100' : 'bg-white border-slate-100 hover:border-blue-100 hover:shadow-md'}`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600 group-hover:scale-110 transition-transform">
              <Layers size={20} />
            </div>
            <span className="text-3xl font-bold text-slate-800">{client.Spreads?.length || 0}</span>
          </div>
          <h3 className="font-bold text-slate-700">Tiradas</h3>
          <p className="text-xs text-slate-500 mt-1">Lecturas de tarot</p>
        </button>

        <button 
          onClick={() => setActiveTab('rituals')}
          className={`p-6 rounded-2xl border transition-all text-left group ${activeTab === 'rituals' ? 'bg-amber-50 border-amber-200 ring-2 ring-amber-100' : 'bg-white border-slate-100 hover:border-amber-100 hover:shadow-md'}`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-600 group-hover:scale-110 transition-transform">
              <Sparkles size={20} />
            </div>
            <span className="text-3xl font-bold text-slate-800">{client.Rituals?.length || 0}</span>
          </div>
          <h3 className="font-bold text-slate-700">Rituales</h3>
          <p className="text-xs text-slate-500 mt-1">Trabajos realizados</p>
        </button>

        <button 
          onClick={() => setActiveTab('report')}
          className={`p-6 rounded-2xl border transition-all text-left group ${activeTab === 'report' ? 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-100' : 'bg-white border-slate-100 hover:border-indigo-100 hover:shadow-md'}`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600 group-hover:scale-110 transition-transform">
              <FileText size={20} />
            </div>
          </div>
          <h3 className="font-bold text-slate-700">Informe</h3>
          <p className="text-xs text-slate-500 mt-1">Resultados y diagnóstico</p>
        </button>
      </div>

      {/* Content */}
      <div className="min-h-[300px] animate-fade-in">
        {activeTab === 'overview' && (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="inline-block p-4 bg-slate-50 rounded-full mb-4">
              <User size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700">Historial Completo</h3>
            <p className="text-slate-500 max-w-md mx-auto mt-2">
              Selecciona una de las tarjetas de arriba para ver el detalle de las sesiones, tiradas o rituales de {client.name}.
            </p>
          </div>
        )}

        {activeTab === 'energy' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-800 font-serif">Historial de Sesiones</h3>
            </div>
            {client.ConsultantEnergies?.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500">
                No hay sesiones registradas para este consultante.
              </div>
            ) : (
              client.ConsultantEnergies?.map((session: any) => (
                <div key={session.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-purple-200 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-3 py-1 rounded-full">
                      <Calendar size={14} />
                      {new Date(session.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                      <span className="text-xs font-bold text-red-600 uppercase tracking-wider block mb-1">Energía Inicial</span>
                      <p className="font-medium text-red-900">{session.energyBefore}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                      <span className="text-xs font-bold text-green-600 uppercase tracking-wider block mb-1">Energía Final</span>
                      <p className="font-medium text-green-900">{session.energyAfter}</p>
                    </div>
                  </div>
                  
                  {session.notes && (
                    <div className="pl-4 border-l-4 border-slate-200 py-1">
                      <p className="text-slate-600">{session.notes}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'spreads' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-800 font-serif">Historial de Tiradas</h3>
            </div>
            {client.Spreads?.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500">
                No hay tiradas registradas.
              </div>
            ) : (
              client.Spreads?.map((spread: any) => (
                <div key={spread.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-blue-200 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-lg font-bold text-slate-800">{spread.question}</h4>
                    <div className="text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-lg flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(spread.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cartas</span>
                    <div className="text-sm font-medium bg-slate-100 text-slate-700 px-3 py-2 rounded-lg mt-1 inline-block border border-slate-200">
                      {spread.cards}
                    </div>
                  </div>
                  
                  <div className="text-slate-600 text-sm leading-relaxed">
                    <span className="font-bold text-blue-600 block mb-1">Interpretación:</span>
                    {spread.interpretation}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'rituals' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-800 font-serif">Historial de Rituales</h3>
            </div>
            {client.Rituals?.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500">
                No hay rituales registrados.
              </div>
            ) : (
              client.Rituals?.map((ritual: any) => (
                <div key={ritual.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-amber-200 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                        <Sparkles size={16} />
                      </div>
                      <h4 className="text-lg font-bold text-slate-800">{ritual.intention}</h4>
                    </div>
                    <div className="text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-lg">
                      {new Date(ritual.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="pl-12">
                     <p className="text-slate-600 text-sm leading-relaxed">{ritual.result}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'report' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4 no-print">
              <h3 className="text-xl font-bold text-slate-800 font-serif">Informe de Resultados</h3>
              <div className="flex flex-wrap justify-center gap-2">
                 <div className="flex bg-slate-100 p-1 rounded-lg mr-2">
                    <button
                        onClick={() => setReportMode('visual')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${reportMode === 'visual' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Sparkles size={14} /> Visual
                    </button>
                    <button
                        onClick={() => setReportMode('text')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${reportMode === 'text' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <FileText size={14} /> Texto
                    </button>
                </div>

                <button 
                  onClick={generateReport}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 text-sm font-medium transition-colors"
                >
                  <Wand2 size={16} />
                  Generar
                </button>
                <button 
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 text-sm font-medium transition-colors"
                >
                  <Printer size={16} />
                  Imprimir
                </button>
                <button 
                  onClick={saveReport}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 text-sm font-medium transition-colors disabled:opacity-50"
                >
                  <Save size={16} />
                  {isSaving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
            
            {reportMode === 'text' ? (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    {/* Screen View (Editable) */}
                    <div className="no-print">
                        {/* Text Mode Toolbar */}
                         <div className="flex flex-wrap items-center gap-4 mb-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                             <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1"><Type size={14} /> Fuente</span>
                                <select 
                                    value={reportConfig.font}
                                    onChange={(e) => setReportConfig({...reportConfig, font: e.target.value})}
                                    className="text-sm border-none bg-white rounded-lg px-3 py-1.5 shadow-sm focus:ring-2 focus:ring-purple-100 cursor-pointer text-slate-700"
                                >
                                    <option value="serif">Clásica</option>
                                    <option value="sans">Moderna</option>
                                    <option value="mystical">Mística</option>
                                    <option value="hand">Manuscrita</option>
                                    <option value="title">Cinemática</option>
                                </select>
                             </div>
                             
                             <div className="w-px h-6 bg-slate-200 mx-2"></div>

                             <div className="flex items-center gap-2 overflow-x-auto">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1"><Smile size={14} /> Decorar</span>
                                <div className="flex gap-1">
                                    {mysticalEmojis.slice(0, 8).map(emoji => (
                                        <button 
                                            key={emoji}
                                            onClick={() => setReportText(prev => prev + emoji)}
                                            className="hover:bg-white hover:shadow-sm rounded-md p-1.5 transition-all text-lg leading-none"
                                            title="Insertar emoji"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                             </div>
                         </div>

                        <div className="flex justify-center bg-slate-100 p-8 rounded-2xl overflow-hidden border border-slate-200/60 shadow-inner">
                            <textarea
                                value={reportText}
                                onChange={(e) => setReportText(e.target.value)}
                                className={`w-full min-h-[297mm] p-[25mm] bg-white shadow-lg mx-auto ${fonts[reportConfig.font]} text-base focus:outline-none text-slate-800 resize-none block`}
                                style={{
                                    maxWidth: '210mm',
                                    lineHeight: '2rem',
                                    backgroundImage: 'linear-gradient(#f1f5f9 1px, transparent 1px)',
                                    backgroundSize: '100% 2rem',
                                    backgroundAttachment: 'local'
                                }}
                                placeholder="Genera un informe automático o escribe aquí tus conclusiones..."
                            />
                        </div>
                    </div>


                </div>
            ) : (
                <div className="flex flex-col gap-6">
                    {/* Design Toolbar */}
                    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-wrap items-center gap-6 no-print">
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1"><Palette size={14} /> Tema</span>
                            <div className="flex gap-1">
                                {Object.keys(themes).map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setReportConfig({...reportConfig, theme: t})}
                                        className={`w-8 h-8 rounded-full transition-all bg-gradient-to-br ${themes[t].gradient} ${reportConfig.theme === t ? 'ring-2 ring-offset-2 ring-slate-500 scale-110 shadow-lg' : 'hover:scale-110 shadow-sm opacity-80 hover:opacity-100'}`}
                                        title={t.charAt(0).toUpperCase() + t.slice(1)}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="w-px h-8 bg-slate-100"></div>

                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1"><Type size={14} /> Tipografía</span>
                            <select 
                                value={reportConfig.font}
                                onChange={(e) => setReportConfig({...reportConfig, font: e.target.value})}
                                className="text-sm border-none bg-slate-50 rounded-lg px-2 py-1 focus:ring-0 cursor-pointer"
                            >
                                <option value="serif">Clásica</option>
                                <option value="sans">Moderna</option>
                                <option value="mystical">Mística</option>
                                <option value="hand">Manuscrita</option>
                                <option value="title">Cinemática</option>
                            </select>
                        </div>
                    </div>
                    
                    {/* Visual Report Screen Preview */}
                    <div className="flex justify-center bg-slate-200/50 p-4 md:p-8 rounded-2xl overflow-x-auto border border-slate-200/60 shadow-inner">
                        <div className={`w-[210mm] shrink-0 min-h-[297mm] p-[15mm] md:p-[20mm] relative shadow-2xl mx-auto transition-all duration-300 ${fonts[reportConfig.font]}`} style={{backgroundColor: '#fdfbf7'}}>
                            
                            {/* Parchment Texture Effect (Screen) */}
                            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-sm">
                                <div className="absolute inset-0" style={{
                                    backgroundImage: 'radial-gradient(#dac4a5 1px, transparent 1px)', 
                                    backgroundSize: '30px 30px', 
                                    opacity: 0.1
                                }}></div>
                                <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(180,140,100,0.1)]"></div>
                                <div className="absolute top-2 left-2 right-2 bottom-2 border-2 border-double border-stone-300 rounded opacity-50"></div>
                            </div>

                            {/* Dynamic Decorative Elements */}
                            {reportConfig.decoration !== 'minimal' && (
                                <>
                                    {/* Removed top gradient line */}
                                    <div className={`absolute -top-20 -right-20 w-64 h-64 ${themes[reportConfig.theme].bg} rounded-full blur-3xl opacity-30 pointer-events-none`}></div>
                                    <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#f5ecd9] to-transparent pointer-events-none"></div>
                                    
                                    {reportConfig.decoration === 'modern' && (
                                        <div className={`absolute top-6 left-6 right-6 bottom-6 border ${themes[reportConfig.theme].border} pointer-events-none z-20`}></div>
                                    )}

                                    {reportConfig.decoration === 'ornate' && (
                                        <>
                                            <div className="absolute top-0 left-0 w-full h-full border-[15px] border-double border-stone-200 border-opacity-40 pointer-events-none z-20"></div>
                                            
                                            {/* Corner Ornaments */}
                                            <svg className="absolute top-6 left-6 w-16 h-16 text-stone-400 z-20 opacity-40" viewBox="0 0 100 100" fill="currentColor">
                                                <path d="M10,10 L40,10 C35,15 30,20 30,30 C30,40 40,50 50,50 L50,45 C45,45 40,40 40,30 C40,20 50,15 60,10 L90,10 L90,40 C85,35 80,30 70,30 C60,30 50,40 50,50 L55,50 C55,45 60,40 70,40 C80,40 85,50 90,60 L90,90 L60,90 C65,85 70,80 70,70 C70,60 60,50 50,50 L50,55 C55,55 60,60 60,70 C60,80 50,85 40,90 L10,90 L10,60 C15,65 20,70 30,70 C40,70 50,60 50,50 L45,50 C45,55 40,60 30,60 C20,60 15,50 10,40 L10,10 Z" fill="none" />
                                                <path d="M0,0 L40,0 L0,40 Z" fill="currentColor" />
                                            </svg>
                                            <svg className="absolute top-6 right-6 w-16 h-16 text-stone-400 z-20 opacity-40 transform scale-x-[-1]" viewBox="0 0 100 100" fill="currentColor">
                                                <path d="M0,0 L40,0 L0,40 Z" fill="currentColor" />
                                            </svg>
                                            <svg className="absolute bottom-6 left-6 w-16 h-16 text-stone-400 z-20 opacity-40 transform scale-y-[-1]" viewBox="0 0 100 100" fill="currentColor">
                                                <path d="M0,0 L40,0 L0,40 Z" fill="currentColor" />
                                            </svg>
                                            <svg className="absolute bottom-6 right-6 w-16 h-16 text-stone-400 z-20 opacity-40 transform scale-[-1]" viewBox="0 0 100 100" fill="currentColor">
                                                <path d="M0,0 L40,0 L0,40 Z" fill="currentColor" />
                                            </svg>
                                        </>
                                    )}
                                </>
                            )}

                            {/* Logo Placeholder */}
                            {reportConfig.decoration !== 'minimal' && (
                                <div className="flex justify-center mb-8 relative z-20">
                                    {customLogo ? (
                                        <img src={customLogo} alt="Logo Profesional" className="h-24 w-auto object-contain" />
                                    ) : (
                                        <div className={`border-2 border-dotted ${themes[reportConfig.theme].border} px-4 py-2 bg-white/50 text-slate-400 font-serif font-bold tracking-widest text-xs uppercase`}>
                                            TU LOGO
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Header */}
                            <div className={`flex justify-between items-end mb-12 relative z-10 border-b ${themes[reportConfig.theme].border} pb-8`}>
                                <div>
                                    <h1 className={`text-4xl font-bold tracking-tight mb-2 ${themes[reportConfig.theme].primary} ${fonts[reportConfig.font]}`}>Informe Energético</h1>
                                    <p className="text-slate-500 text-sm uppercase tracking-widest font-medium">Bitácora Profesional</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-slate-400 font-medium mb-1">Fecha de Emisión</div>
                                    <div className="text-slate-700 font-medium">{new Date().toLocaleDateString()}</div>
                                </div>
                            </div>

                            {/* Client Info */}
                            <div className={`flex items-center gap-6 mb-12 ${themes[reportConfig.theme].bg} bg-opacity-30 p-6 rounded-2xl border ${themes[reportConfig.theme].border}`}>
                                    <div className={`w-16 h-16 bg-gradient-to-br ${themes[reportConfig.theme].gradient} rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg`}>
                                    {client.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h2 className={`text-2xl font-bold ${themes[reportConfig.theme].primary}`}>{client.name}</h2>
                                    <p className="text-slate-500 text-sm mt-1">Informe de progreso y análisis espiritual</p>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            {reportConfig.showStats && (
                                <div className="grid grid-cols-3 gap-6 mb-12">
                                    <div className={`p-4 rounded-2xl ${themes[reportConfig.theme].bg} bg-opacity-40 border ${themes[reportConfig.theme].border} text-center`}>
                                        <div className={`text-3xl font-bold ${themes[reportConfig.theme].primary} mb-1`}>{client.ConsultantEnergies?.length || 0}</div>
                                        <div className={`text-xs font-bold ${themes[reportConfig.theme].accent} uppercase tracking-wider`}>Sesiones</div>
                                    </div>
                                    <div className={`p-4 rounded-2xl ${themes[reportConfig.theme].bg} bg-opacity-40 border ${themes[reportConfig.theme].border} text-center`}>
                                        <div className={`text-3xl font-bold ${themes[reportConfig.theme].primary} mb-1`}>{client.Spreads?.length || 0}</div>
                                        <div className={`text-xs font-bold ${themes[reportConfig.theme].accent} uppercase tracking-wider`}>Lecturas</div>
                                    </div>
                                    <div className={`p-4 rounded-2xl ${themes[reportConfig.theme].bg} bg-opacity-40 border ${themes[reportConfig.theme].border} text-center`}>
                                        <div className={`text-3xl font-bold ${themes[reportConfig.theme].primary} mb-1`}>{client.Rituals?.length || 0}</div>
                                        <div className={`text-xs font-bold ${themes[reportConfig.theme].accent} uppercase tracking-wider`}>Rituales</div>
                                    </div>
                                </div>
                            )}

                            {/* Recent Activity Highlight */}
                            {(client.ConsultantEnergies?.length > 0) && (
                                <div className="mb-12">
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <Activity size={16} />
                                        Última Sesión Energética
                                    </h3>
                                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                                        <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${themes[reportConfig.theme].gradient}`}></div>
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="text-xs text-slate-400 mb-1">Fecha</div>
                                                <div className="font-medium text-slate-700">{new Date(client.ConsultantEnergies[0].createdAt).toLocaleDateString()}</div>
                                            </div>
                                            <div className="flex gap-8">
                                                <div>
                                                    <div className="text-xs text-slate-400 mb-1">Antes</div>
                                                    <div className="font-medium text-slate-700">{client.ConsultantEnergies[0].energyBefore}</div>
                                                </div>
                                                <div>
                                                        <div className="text-xs text-slate-400 mb-1">Ahora</div>
                                                    <div className="font-medium text-slate-700">{client.ConsultantEnergies[0].energyAfter}</div>
                                                </div>
                                            </div>
                                        </div>
                                        {client.ConsultantEnergies[0].notes && (
                                            <p className="text-slate-600 text-sm italic bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                "{client.ConsultantEnergies[0].notes}"
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Professional Diagnosis (Editable) */}
                            <div className="mb-8">
                                <h3 className={`text-lg font-bold mb-4 flex items-center justify-center gap-2 border-b ${themes[reportConfig.theme].border} pb-2 ${themes[reportConfig.theme].primary}`}>
                                    <Sparkles size={18} className={themes[reportConfig.theme].accent} />
                                    DEVOLUCIÓN
                                </h3>
                                <textarea 
                                    className={`w-full min-h-[300px] p-2 border-0 bg-transparent text-slate-700 text-center text-base leading-relaxed whitespace-pre-wrap focus:ring-1 focus:ring-purple-200 focus:bg-purple-50/30 rounded-lg resize-none ${fonts[reportConfig.font]}`}
                                    style={{ lineHeight: '32px' }}
                                    value={diagnosis}
                                    onChange={(e) => setDiagnosis(e.target.value)}
                                    placeholder="Escribe aquí la devolución profesional..."
                                />
                            </div>

                            {/* Footer */}
                            <div className="mt-20 pt-8 border-t border-slate-100 flex justify-center items-end">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-48 h-px bg-slate-200"></div>
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Firma del Profesional</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TEXT REPORT */}
            {reportMode === 'text' && (
                <div className="print-page text bg-white w-full min-h-screen relative p-0">
                    {/* Fixed Decorative Frame (Repeats on every page) */}
                    <div className="fixed inset-0 z-0 pointer-events-none">
                        {/* Border */}
                        <div className="absolute top-4 left-4 right-4 bottom-4 border-2 border-amber-500"></div>
                        <div className="absolute top-6 left-6 right-6 bottom-6 border border-dashed border-amber-400"></div>
                        
                        {/* Corner Ornaments */}
                        <svg className="absolute top-2 left-2 w-16 h-16 text-slate-800" viewBox="0 0 100 100" fill="currentColor">
                            <path d="M10,10 L40,10 C35,15 30,20 30,30 C30,40 40,50 50,50 L50,45 C45,45 40,40 40,30 C40,20 50,15 60,10 L90,10 L90,40 C85,35 80,30 70,30 C60,30 50,40 50,50 L55,50 C55,45 60,40 70,40 C80,40 85,50 90,60 L90,90 L60,90 C65,85 70,80 70,70 C70,60 60,50 50,50 L50,55 C55,55 60,60 60,70 C60,80 50,85 40,90 L10,90 L10,60 C15,65 20,70 30,70 C40,70 50,60 50,50 L45,50 C45,55 40,60 30,60 C20,60 15,50 10,40 L10,10 Z" fill="none" />
                            <path d="M0,0 L40,0 L0,40 Z" fill="#1e293b" />
                            <path d="M5,5 L35,5 C30,10 25,25 5,35 Z" fill="#f59e0b" />
                        </svg>
                        <svg className="absolute top-2 right-2 w-16 h-16 text-slate-800 transform scale-x-[-1]" viewBox="0 0 100 100" fill="currentColor">
                            <path d="M0,0 L40,0 L0,40 Z" fill="#1e293b" />
                            <path d="M5,5 L35,5 C30,10 25,25 5,35 Z" fill="#f59e0b" />
                        </svg>
                        <svg className="absolute bottom-2 left-2 w-16 h-16 text-slate-800 transform scale-y-[-1]" viewBox="0 0 100 100" fill="currentColor">
                            <path d="M0,0 L40,0 L0,40 Z" fill="#1e293b" />
                            <path d="M5,5 L35,5 C30,10 25,25 5,35 Z" fill="#f59e0b" />
                        </svg>
                        <svg className="absolute bottom-2 right-2 w-16 h-16 text-slate-800 transform scale-[-1]" viewBox="0 0 100 100" fill="currentColor">
                            <path d="M0,0 L40,0 L0,40 Z" fill="#1e293b" />
                            <path d="M5,5 L35,5 C30,10 25,25 5,35 Z" fill="#f59e0b" />
                        </svg>
                    </div>

                    {/* Main Content Area using Table for repeatable headers/margins */}
                    <div className="relative z-10 w-full">
                        <table className="w-full">
                            <thead>
                                <tr>
                                    <td className="h-[30mm]"></td>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="px-[25mm]">
                                        {/* Logo Placeholder */}
                                        <div className="flex justify-center mb-10">
                                            {customLogo ? (
                                                <img src={customLogo} alt="Logo Profesional" className="h-20 w-auto object-contain" />
                                            ) : (
                                                <div className="border-2 border-dotted border-amber-300 px-6 py-3 bg-amber-50/30 text-amber-700 font-serif font-bold tracking-widest text-sm uppercase">
                                                    TU LOGO
                                                </div>
                                            )}
                                        </div>

                                        {/* Report Title in Print */}
                                        <div className="text-center mb-8">
                                            <h1 className={`text-2xl font-bold text-slate-900 tracking-wider mb-2 uppercase ${fonts[reportConfig.font]}`}>Informe Profesional</h1>
                                            <div className="w-24 h-px bg-amber-400 mx-auto"></div>
                                        </div>
                                        
                                        <div className={`${fonts[reportConfig.font]} text-slate-800 leading-loose text-justify whitespace-pre-wrap text-base`}>
                                            {reportText}
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td className="h-[20mm]"></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}
          </div>
        )}
      </div>

      {createPortal(
        <div className="print-portal">
            {/* VISUAL REPORT */}
            {reportMode === 'visual' && (
                <div className={`print-page visual w-full min-h-screen relative ${fonts[reportConfig.font]}`} style={{backgroundColor: '#fffcf5'}}>
                    {/* Fixed Background & Decorations (Repeats on every page) */}
                    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                        {/* Parchment Texture Effect */}
                        <div className="absolute inset-0" style={{
                            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.08\'/%3E%3C/svg%3E")',
                            opacity: 0.6
                        }}></div>
                        
                        {/* Elegant Frame - Single fine line with corner accents */}
                        <div className="absolute top-8 left-8 right-8 bottom-8 border border-stone-800 opacity-80"></div>
                        <div className="absolute top-9 left-9 right-9 bottom-9 border border-stone-400 opacity-40"></div>
                        
                        {/* Corner Accents */}
                        <div className="absolute top-8 left-8 w-4 h-4 border-t-2 border-l-2 border-stone-800"></div>
                        <div className="absolute top-8 right-8 w-4 h-4 border-t-2 border-r-2 border-stone-800"></div>
                        <div className="absolute bottom-8 left-8 w-4 h-4 border-b-2 border-l-2 border-stone-800"></div>
                        <div className="absolute bottom-8 right-8 w-4 h-4 border-b-2 border-r-2 border-stone-800"></div>

                        {reportConfig.decoration !== 'minimal' && (
                            <>
                                {/* Subtle floral watermark in corners */}
                                <div className="absolute top-0 left-0 w-32 h-32 opacity-10" style={{backgroundImage: 'radial-gradient(circle at 0 0, #d6bcfa 0%, transparent 70%)'}}></div>
                                <div className="absolute bottom-0 right-0 w-32 h-32 opacity-10" style={{backgroundImage: 'radial-gradient(circle at 100% 100%, #d6bcfa 0%, transparent 70%)'}}></div>
                            </>
                        )}
                    </div>

                    {/* Content using Table for Pagination Margins */}
                    <div className="relative z-10 w-full">
                        <table className="w-full">
                            <thead>
                                <tr>
                                    <td className="h-[25mm]"></td> {/* Top Margin Spacer to clear frame */}
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="px-[20mm] md:px-[25mm]">
                                        {/* Header */}
                                        <div className="text-center mb-12">
                                            <div className="flex justify-center mb-6">
                                                {customLogo ? (
                                                    <img src={customLogo} alt="Logo Profesional" className="h-28 w-auto object-contain" />
                                                ) : (
                                                    <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center ${themes[reportConfig.theme].secondary} ${themes[reportConfig.theme].primary.replace('text-', 'border-')}`}>
                                                        <Sparkles size={28} strokeWidth={1.5} />
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <h1 className={`text-5xl font-bold mb-4 tracking-wide ${themes[reportConfig.theme].primary} ${fonts[reportConfig.font]}`}>Informe Energético</h1>
                                            <div className="flex items-center justify-center gap-4 text-xs tracking-[0.2em] text-stone-500 uppercase font-semibold">
                                                <span>Bitácora Profesional</span>
                                                <span className={`w-1.5 h-1.5 rounded-full ${themes[reportConfig.theme].accent.replace('text-', 'bg-')}`}></span>
                                                <span>{new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                            </div>
                                        </div>

                                        {/* Client Info - Structured & Elegant */}
                                        <div className="text-center mb-12 relative max-w-2xl mx-auto w-full break-inside-avoid">
                                            <div className={`absolute top-0 left-0 w-full h-full border ${themes[reportConfig.theme].primary.replace('text-', 'border-')} opacity-20 rounded-lg`}></div>
                                            <div className="relative z-10 py-8 px-12 bg-white/50 backdrop-blur-sm rounded-lg">
                                                <span className={`italic text-lg block mb-2 ${themes[reportConfig.theme].accent}`}>Preparado para</span>
                                                <h2 className={`text-4xl ${themes[reportConfig.theme].primary} ${fonts[reportConfig.font]}`}>{client.name}</h2>
                                                <div className={`w-24 h-px mx-auto my-4 ${themes[reportConfig.theme].primary.replace('text-', 'bg-')} opacity-30`}></div>
                                                <p className="text-stone-600 italic">Análisis Espiritual y Recomendaciones</p>
                                            </div>
                                        </div>

                                        {/* Stats - Elegant Row */}
                                        {reportConfig.showStats && (
                                            <div className="flex justify-center gap-20 mb-12 py-6 relative break-inside-avoid">
                                                <div className="absolute inset-x-20 top-0 h-px bg-gradient-to-r from-transparent via-stone-300 to-transparent"></div>
                                                <div className="absolute inset-x-20 bottom-0 h-px bg-gradient-to-r from-transparent via-stone-300 to-transparent"></div>
                                                
                                                <div className="text-center">
                                                    <span className={`block text-3xl font-serif ${themes[reportConfig.theme].primary}`}>{client.ConsultantEnergies?.length || 0}</span>
                                                    <span className="text-[10px] uppercase tracking-widest text-stone-400 mt-1 block">Sesiones</span>
                                                </div>
                                                <div className="text-center">
                                                    <span className={`block text-3xl font-serif ${themes[reportConfig.theme].primary}`}>{client.Spreads?.length || 0}</span>
                                                    <span className="text-[10px] uppercase tracking-widest text-stone-400 mt-1 block">Lecturas</span>
                                                </div>
                                                <div className="text-center">
                                                    <span className={`block text-3xl font-serif ${themes[reportConfig.theme].primary}`}>{client.Rituals?.length || 0}</span>
                                                    <span className="text-[10px] uppercase tracking-widest text-stone-400 mt-1 block">Rituales</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Diagnosis / Devolución */}
                                        <div className="mb-12">
                                            <div className="mb-8 text-center break-after-avoid">
                                                <h3 className={`text-2xl italic mb-3 ${themes[reportConfig.theme].primary} ${fonts[reportConfig.font]}`}>Devolución Profesional</h3>
                                                <div className="flex justify-center items-center gap-2 opacity-50">
                                                    <div className={`w-12 h-px ${themes[reportConfig.theme].primary.replace('text-', 'bg-')}`}></div>
                                                    <div className={`w-2 h-2 rotate-45 border ${themes[reportConfig.theme].primary.replace('text-', 'border-')}`}></div>
                                                    <div className={`w-12 h-px ${themes[reportConfig.theme].primary.replace('text-', 'bg-')}`}></div>
                                                </div>
                                            </div>
                                            
                                            {/* Text without box container to allow clean page breaks */}
                                            <div className={`prose prose-stone max-w-none text-justify text-stone-800 leading-loose text-lg whitespace-pre-wrap ${fonts[reportConfig.font]}`}>
                                                {diagnosis}
                                            </div>
                                        </div>

                                        {/* Signature - Flows naturally after text */}
                                        <div className="mt-16 pt-8 flex justify-end px-12 break-inside-avoid">
                                            <div className="text-center w-64">
                                                <div className={`font-hand text-3xl mb-4 transform -rotate-2 ${themes[reportConfig.theme].primary}`}>
                                                    Mirada de Luz
                                                </div>
                                                <div className="w-full h-px bg-stone-400 mb-2"></div>
                                                <div className="text-[10px] uppercase tracking-[0.2em] text-stone-500">Firma del Profesional</div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td className="h-[25mm]"></td> {/* Bottom Margin Spacer to clear frame */}
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}

            {/* TEXT REPORT */}
            {reportMode === 'text' && (
                <div className="print-page text bg-white w-full min-h-screen relative p-0">
                    {/* Fixed Decorative Frame (Repeats on every page) */}
                    <div className="fixed inset-0 z-0 pointer-events-none">
                        {/* Border */}
                        <div className="absolute top-4 left-4 right-4 bottom-4 border-2 border-amber-500"></div>
                        <div className="absolute top-6 left-6 right-6 bottom-6 border border-dashed border-amber-400"></div>
                        
                        {/* Corner Ornaments */}
                        <svg className="absolute top-2 left-2 w-16 h-16 text-slate-800" viewBox="0 0 100 100" fill="currentColor">
                            <path d="M10,10 L40,10 C35,15 30,20 30,30 C30,40 40,50 50,50 L50,45 C45,45 40,40 40,30 C40,20 50,15 60,10 L90,10 L90,40 C85,35 80,30 70,30 C60,30 50,40 50,50 L55,50 C55,45 60,40 70,40 C80,40 85,50 90,60 L90,90 L60,90 C65,85 70,80 70,70 C70,60 60,50 50,50 L50,55 C55,55 60,60 60,70 C60,80 50,85 40,90 L10,90 L10,60 C15,65 20,70 30,70 C40,70 50,60 50,50 L45,50 C45,55 40,60 30,60 C20,60 15,50 10,40 L10,10 Z" fill="none" />
                            <path d="M0,0 L40,0 L0,40 Z" fill="#1e293b" />
                            <path d="M5,5 L35,5 C30,10 25,25 5,35 Z" fill="#f59e0b" />
                        </svg>
                        <svg className="absolute top-2 right-2 w-16 h-16 text-slate-800 transform scale-x-[-1]" viewBox="0 0 100 100" fill="currentColor">
                            <path d="M0,0 L40,0 L0,40 Z" fill="#1e293b" />
                            <path d="M5,5 L35,5 C30,10 25,25 5,35 Z" fill="#f59e0b" />
                        </svg>
                        <svg className="absolute bottom-2 left-2 w-16 h-16 text-slate-800 transform scale-y-[-1]" viewBox="0 0 100 100" fill="currentColor">
                            <path d="M0,0 L40,0 L0,40 Z" fill="#1e293b" />
                            <path d="M5,5 L35,5 C30,10 25,25 5,35 Z" fill="#f59e0b" />
                        </svg>
                        <svg className="absolute bottom-2 right-2 w-16 h-16 text-slate-800 transform scale-[-1]" viewBox="0 0 100 100" fill="currentColor">
                            <path d="M0,0 L40,0 L0,40 Z" fill="#1e293b" />
                            <path d="M5,5 L35,5 C30,10 25,25 5,35 Z" fill="#f59e0b" />
                        </svg>
                    </div>

                    {/* Main Content Area using Table for repeatable headers/margins */}
                    <div className="relative z-10 w-full">
                        <table className="w-full">
                            <thead>
                                <tr>
                                    <td className="h-[30mm]"></td>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="px-[25mm]">
                                        {/* Logo Placeholder */}
                                        <div className="flex justify-center mb-10">
                                            {customLogo ? (
                                                <img src={customLogo} alt="Logo Profesional" className="h-20 w-auto object-contain" />
                                            ) : (
                                                <div className="border-2 border-dotted border-amber-300 px-6 py-3 bg-amber-50/30 text-amber-700 font-serif font-bold tracking-widest text-sm uppercase">
                                                    TU LOGO
                                                </div>
                                            )}
                                        </div>

                                        {/* Report Title in Print */}
                                        <div className="text-center mb-8">
                                            <h1 className={`text-2xl font-bold text-slate-900 tracking-wider mb-2 uppercase ${fonts[reportConfig.font]}`}>Informe Profesional</h1>
                                            <div className="w-24 h-px bg-amber-400 mx-auto"></div>
                                        </div>
                                        
                                        <div className={`${fonts[reportConfig.font]} text-slate-800 leading-loose text-justify whitespace-pre-wrap text-base`}>
                                            {reportText}
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td className="h-[20mm]"></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}
        </div>,
        document.body
      )}

    </div>
  );
}
