import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, MousePointer, Check, Move, Palette, Type, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import penduloImage from '../assets/pendulo.png';

const Settings = () => {
  const [selectedCursor, setSelectedCursor] = useState('pendulum');
  const [cursorSize, setCursorSize] = useState(1);
  const [cursorColor, setCursorColor] = useState('#9333ea'); // Default purple
  // Removed appTitle state since it's only used for saving
  const [inputTitle, setInputTitle] = useState('Bitácora');
  const [customLogo, setCustomLogo] = useState<string | null>(null);

  const cursorOptions = [
    { id: 'pendulum', name: 'Péndulo', icon: '🔮', type: 'image', src: penduloImage },
    { id: 'arrow-simple', name: 'Flecha Simple', icon: '➤', type: 'arrow' },
    { id: 'arrow-mystic', name: 'Flecha Mística', icon: '⚜️', type: 'arrow' },
    { id: 'crystal', name: 'Cuarzo', icon: '💎', type: 'emoji' },
    { id: 'moon', name: 'Luna', icon: '🌙', type: 'emoji' },
    { id: 'sun', name: 'Sol', icon: '☀️', type: 'emoji' },
    { id: 'star', name: 'Estrella', icon: '✨', type: 'emoji' },
    { id: 'feather', name: 'Pluma', icon: '🪶', type: 'emoji' },
    { id: 'eye', name: 'Ojo', icon: '🧿', type: 'emoji' },
    { id: 'hand', name: 'Hamsa', icon: '✋', type: 'emoji' },
    { id: 'candle', name: 'Vela', icon: '🕯️', type: 'emoji' },
    { id: 'lotus', name: 'Loto', icon: '🪷', type: 'emoji' },
  ];

  useEffect(() => {
    const savedCursor = localStorage.getItem('bitacora_cursor');
    const savedSize = localStorage.getItem('bitacora_cursor_size');
    const savedColor = localStorage.getItem('bitacora_cursor_color');
    const savedTitle = localStorage.getItem('bitacora_app_title');
    const savedLogo = localStorage.getItem('bitacora_custom_logo');
    
    if (savedCursor) setSelectedCursor(savedCursor);
    if (savedSize) setCursorSize(parseFloat(savedSize));
    if (savedColor) setCursorColor(savedColor);
    if (savedTitle) {
      // setAppTitle(savedTitle); - Removed as unused
      setInputTitle(savedTitle);
    }
    if (savedLogo) setCustomLogo(savedLogo);
  }, []);

  const handleSelect = (id: string) => {
    setSelectedCursor(id);
    localStorage.setItem('bitacora_cursor', id);
    window.dispatchEvent(new Event('cursor-change'));
  };

  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const size = parseFloat(e.target.value);
    setCursorSize(size);
    localStorage.setItem('bitacora_cursor_size', size.toString());
    window.dispatchEvent(new Event('cursor-change'));
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCursorColor(color);
    localStorage.setItem('bitacora_cursor_color', color);
    window.dispatchEvent(new Event('cursor-change'));
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputTitle(e.target.value);
  };

  const handleSaveTitle = () => {
    // setAppTitle(inputTitle); - Removed as unused
    localStorage.setItem('bitacora_app_title', inputTitle);
    window.dispatchEvent(new CustomEvent('app-title-change', { detail: inputTitle }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        alert('El archivo es demasiado grande. Máximo 2MB.');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setCustomLogo(base64String);
        localStorage.setItem('bitacora_custom_logo', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setCustomLogo(null);
    localStorage.removeItem('bitacora_custom_logo');
  };

  const isArrow = selectedCursor.startsWith('arrow');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <SettingsIcon size={120} />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-serif font-bold mb-2 flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-purple-400" />
            Configuración
          </h1>
          <p className="text-slate-300 max-w-xl">
            Personaliza tu experiencia en la Bitácora. Elige el cursor que mejor resuene con tu energía actual.
          </p>
        </div>
      </div>

      {/* App Title Control */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-50 rounded-xl">
            <Type className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Nombre de la Aplicación</h2>
            <p className="text-sm text-slate-500">Personaliza el título de la barra lateral</p>
          </div>
        </div>
        <div className="px-4 flex gap-3 items-center">
          <input 
            type="text" 
            value={inputTitle}
            onChange={handleTitleChange}
            className="max-w-xs w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-700"
            placeholder="Ej: Bitácora"
          />
          <button
            onClick={handleSaveTitle}
            className="p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center"
            title="Guardar nombre"
          >
            <Check size={20} />
          </button>
        </div>
      </div>

      {/* Logo Control */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-amber-50 rounded-xl">
            <ImageIcon className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Logo Personalizado</h2>
            <p className="text-sm text-slate-500">Sube tu logo para los informes impresos (Max 2MB)</p>
          </div>
        </div>
        
        <div className="px-4 flex flex-col sm:flex-row gap-6 items-center">
            <div className="relative w-32 h-32 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden group hover:border-amber-400 transition-colors">
                {customLogo ? (
                    <img src={customLogo} alt="Logo" className="w-full h-full object-contain p-2" />
                ) : (
                    <div className="text-slate-400 text-center p-2">
                        <Upload size={24} className="mx-auto mb-1" />
                        <span className="text-xs">Subir imagen</span>
                    </div>
                )}
                
                <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                />
            </div>

            <div className="flex flex-col gap-2">
                {customLogo && (
                    <button 
                        onClick={removeLogo}
                        className="flex items-center gap-2 text-red-500 hover:text-red-700 text-sm font-medium px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                    >
                        <Trash2 size={16} /> Eliminar logo
                    </button>
                )}
                <div className="text-xs text-slate-500 max-w-xs">
                    Recomendamos una imagen PNG con fondo transparente. Este logo aparecerá en el encabezado de tus informes impresos.
                </div>
            </div>
        </div>
      </div>

      {/* Customization Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Size Control */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-50 rounded-xl">
              <Move className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Tamaño</h2>
              <p className="text-sm text-slate-500">Ajusta la dimensión del cursor</p>
            </div>
          </div>
          <div className="px-4">
             <input 
               type="range" 
               min="0.5" 
               max="2.5" 
               step="0.1" 
               value={cursorSize}
               onChange={handleSizeChange}
               className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
             />
             <div className="flex justify-between text-xs text-slate-400 mt-2">
               <span>Pequeño</span>
               <span>Normal</span>
               <span>Grande</span>
             </div>
          </div>
        </div>

        {/* Color Control (Only for Arrows) */}
        <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 p-6 transition-opacity duration-300 ${isArrow ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-pink-50 rounded-xl">
              <Palette className="w-6 h-6 text-pink-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Color</h2>
              <p className="text-sm text-slate-500">Personaliza el color de la flecha</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <input 
              type="color" 
              value={cursorColor}
              onChange={handleColorChange}
              className="w-12 h-12 rounded-lg cursor-pointer border-0 p-0 overflow-hidden"
            />
            <div className="text-sm text-slate-600">
              <p className="font-medium">Color Seleccionado</p>
              <p className="opacity-70">{cursorColor}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cursor Selection */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-purple-50 rounded-xl">
            <MousePointer className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Estilo del Cursor</h2>
            <p className="text-sm text-slate-500">Selecciona el puntero que te guiará</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {cursorOptions.map((cursor) => (
            <button
              key={cursor.id}
              onClick={() => handleSelect(cursor.id)}
              className={`relative p-4 rounded-xl border-2 transition-all duration-200 group flex flex-col items-center gap-3 hover:shadow-md ${
                selectedCursor === cursor.id
                  ? 'border-purple-500 bg-purple-50/50'
                  : 'border-slate-100 bg-slate-50 hover:border-purple-200'
              }`}
            >
              {selectedCursor === cursor.id && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white shadow-sm animate-fade-in">
                  <Check size={14} />
                </div>
              )}
              
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-4xl shadow-inner transition-transform duration-300 group-hover:scale-110 ${
                selectedCursor === cursor.id ? 'bg-white' : 'bg-white'
              }`}>
                {cursor.type === 'image' ? (
                  <img src={cursor.src} alt={cursor.name} className="w-10 h-auto" />
                ) : cursor.type === 'arrow' ? (
                  <div style={{ color: cursorColor }}>
                    {cursor.id === 'arrow-simple' && (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="transform -rotate-45">
                            <path d="M12 2L2 22l10-2 10 2L12 2z" />
                        </svg>
                    )}
                    {cursor.id === 'arrow-mystic' && (
                         <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="transform -rotate-45">
                            <path d="M12 2L2 22l10-4 10 4L12 2z" />
                            <circle cx="12" cy="12" r="3" className="text-white mix-blend-overlay" />
                        </svg>
                    )}
                  </div>
                ) : (
                  <span>{cursor.icon}</span>
                )}
              </div>
              
              <span className={`font-medium text-center text-sm ${
                selectedCursor === cursor.id ? 'text-purple-700' : 'text-slate-600'
              }`}>
                {cursor.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Settings;
