import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Sparkles, User, ScrollText, Moon, Users, Settings, X, Save, Calendar, DollarSign, Menu } from 'lucide-react'
import CustomCursor from './CustomCursor'

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [user, setUser] = useState({ name: 'Practicante', status: 'En línea' });
  const [isEditing, setIsEditing] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [tempUser, setTempUser] = useState({ name: '', status: '' });
  const [appTitle, setAppTitle] = useState('Bitácora');
  const modalRef = useRef<HTMLDivElement>(null);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const savedUser = localStorage.getItem('bitacora_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    const updateTitle = (e?: Event) => {
        if (e && (e as CustomEvent).detail) {
            const newTitle = (e as CustomEvent).detail;
            setAppTitle(newTitle);
            document.title = newTitle;
            return;
        }
        const savedTitle = localStorage.getItem('bitacora_app_title');
        if (savedTitle !== null) {
            setAppTitle(savedTitle);
            document.title = savedTitle;
        }
    };
    
    updateTitle();
    window.addEventListener('app-title-change', updateTitle);
    
    return () => {
        window.removeEventListener('app-title-change', updateTitle);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsEditing(false);
      }
    };

    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditing]);

  const handleEditClick = () => {
    setTempUser(user);
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setUser(tempUser);
    localStorage.setItem('bitacora_user', JSON.stringify(tempUser));
    setIsEditing(false);
  };

  const isActive = (path: string) => location.pathname.startsWith(path) && path !== '/' ? true : location.pathname === path;
  const linkClass = (path: string) => `flex items-center p-3 rounded-lg mb-2 transition-all duration-200 ${
    isActive(path) 
      ? 'bg-purple-600/20 text-purple-300 font-medium border-l-4 border-purple-400 pl-2' 
      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
  }`;

  const getTitleSizeClass = (title: string) => {
    if (title.length > 22) return 'text-sm';
    if (title.length > 16) return 'text-base';
    if (title.length > 12) return 'text-lg';
    if (title.length > 8) return 'text-xl';
    return 'text-2xl';
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <CustomCursor />
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-slate-900 border-b border-slate-800 z-30 px-4 py-3 flex items-center justify-between shadow-md">
        <h1 className="text-white font-bold font-serif flex items-center gap-2">
          <span className="text-2xl">🔮</span>
          <span className="text-lg truncate max-w-[200px]">{appTitle}</span>
        </h1>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-slate-300 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar (Desktop & Mobile) */}
      <aside className={`
        fixed md:sticky top-0 h-full w-64 bg-slate-900 border-r border-slate-800 flex flex-col shadow-xl z-30 transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="px-6 py-8 border-b border-slate-800/50 hidden md:block">
          <h1 className={`${getTitleSizeClass(appTitle)} font-bold text-white flex items-center gap-3 font-serif tracking-wide transition-all duration-300 overflow-hidden`}>
            <span className="text-3xl filter drop-shadow-lg shrink-0">🔮</span> 
            <span className="whitespace-nowrap overflow-hidden text-ellipsis">{appTitle}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-2 tracking-widest uppercase">Panel de Control</p>
        </div>
        
        <nav className="mt-8 px-4 flex-1 overflow-y-auto">
          <div className="mb-4 text-xs font-semibold text-slate-600 uppercase tracking-wider px-3">Principal</div>
          <Link to="/" className={linkClass('/')}>
            <LayoutDashboard className="w-5 h-5 mr-3" />
            Dashboard
          </Link>
          <Link to="/agenda" className={linkClass('/agenda')}>
            <Calendar className="w-5 h-5 mr-3" />
            Agenda
          </Link>
          <Link to="/energy" className={linkClass('/energy')}>
            <Sparkles className="w-5 h-5 mr-3" />
            Mi Energía
          </Link>
          
          <div className="mt-8 mb-4 text-xs font-semibold text-slate-600 uppercase tracking-wider px-3">Gestión</div>
          <Link to="/clients" className={linkClass('/clients')}>
            <Users className="w-5 h-5 mr-3" />
            Clientes
          </Link>
          <Link to="/consultant" className={linkClass('/consultant')}>
            <User className="w-5 h-5 mr-3" />
            Sesión
          </Link>
          <Link to="/finance" className={linkClass('/finance')}>
            <DollarSign className="w-5 h-5 mr-3" />
            Finanzas
          </Link>
          
          <div className="mt-8 mb-4 text-xs font-semibold text-slate-600 uppercase tracking-wider px-3">Herramientas</div>
          <Link to="/spreads" className={linkClass('/spreads')}>
            <ScrollText className="w-5 h-5 mr-3" />
            Tiradas
          </Link>
          <Link to="/rituals" className={linkClass('/rituals')}>
            <Moon className="w-5 h-5 mr-3" />
            Rituales
          </Link>
          <div className="mt-8 mb-4 text-xs font-semibold text-slate-600 uppercase tracking-wider px-3">Sistema</div>
          <Link to="/settings" className={linkClass('/settings')}>
            <Settings className="w-5 h-5 mr-3" />
            Configuración
          </Link>
          
          {/* Mobile User Info in Nav */}
          <div className="md:hidden mt-8 border-t border-slate-800 pt-4 pb-8">
            <div className="flex items-center gap-3 px-3">
               <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white border-2 border-slate-800 shadow-lg relative">
                 <span className="font-serif font-bold text-lg">{user.name.charAt(0).toUpperCase()}</span>
                 <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></div>
               </div>
               <div className="flex-1 min-w-0">
                 <p className="text-sm font-medium text-slate-200 truncate">{user.name}</p>
                 <p className="text-xs text-slate-500 truncate">{user.status}</p>
               </div>
            </div>
          </div>
        </nav>
        
        <div className="relative hidden md:block">
          <div 
            className="p-4 border-t border-slate-800 bg-slate-900/50 cursor-pointer hover:bg-slate-800 transition-colors group"
            onClick={handleEditClick}
          >
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white border-2 border-slate-800 shadow-lg relative">
                 <span className="font-serif font-bold text-lg">{user.name.charAt(0).toUpperCase()}</span>
                 <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></div>
               </div>
               <div className="flex-1 min-w-0">
                 <p className="text-sm font-medium text-slate-200 truncate group-hover:text-white transition-colors">{user.name}</p>
                 <p className="text-xs text-slate-500 truncate group-hover:text-purple-300 transition-colors">{user.status}</p>
               </div>
               <Settings size={16} className="text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
             </div>
          </div>

          {/* Profile Edit Popover */}
          {isEditing && (
            <div 
              ref={modalRef}
              className="absolute bottom-20 left-4 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 p-4 animate-fade-in-up z-50 before:content-[''] before:absolute before:bottom-[-8px] before:left-8 before:w-4 before:h-4 before:bg-white before:rotate-45 before:border-b before:border-r before:border-slate-200"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800">Editar Perfil</h3>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X size={16} />
                </button>
              </div>
              
              <form onSubmit={handleSave} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Nombre</label>
                  <input 
                    type="text" 
                    value={tempUser.name}
                    onChange={(e) => setTempUser({...tempUser, name: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    autoFocus
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Estado</label>
                  <input 
                    type="text" 
                    value={tempUser.status}
                    onChange={(e) => setTempUser({...tempUser, status: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-purple-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Save size={14} />
                  Guardar Cambios
                </button>
              </form>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 pt-24 md:pt-8 bg-slate-50/50 min-h-screen transition-all duration-300">
        <div className="max-w-6xl mx-auto animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  )
}

export default Layout
