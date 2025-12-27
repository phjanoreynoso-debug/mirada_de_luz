import { useEffect, useRef, useState } from 'react';
import penduloImage from '../assets/pendulo.png';

const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [cursorType, setCursorType] = useState('pendulum');
  const [cursorSize, setCursorSize] = useState(1);
  const [cursorColor, setCursorColor] = useState('#9333ea');

  const cursorOptions: any = {
    pendulum: { type: 'image', src: penduloImage, animation: 'swing 3s ease-in-out infinite alternate' },
    'arrow-simple': { type: 'arrow', id: 'arrow-simple', animation: 'none' },
    'arrow-mystic': { type: 'arrow', id: 'arrow-mystic', animation: 'none' },
    crystal: { type: 'emoji', icon: '💎', animation: 'float 3s ease-in-out infinite' },
    moon: { type: 'emoji', icon: '🌙', animation: 'pulse 2s ease-in-out infinite' },
    sun: { type: 'emoji', icon: '☀️', animation: 'spin-slow 10s linear infinite' },
    star: { type: 'emoji', icon: '✨', animation: 'twinkle 1.5s ease-in-out infinite' },
    feather: { type: 'emoji', icon: '🪶', animation: 'float 3s ease-in-out infinite' },
    eye: { type: 'emoji', icon: '🧿', animation: 'none' },
    hand: { type: 'emoji', icon: '✋', animation: 'none' },
    candle: { type: 'emoji', icon: '🕯️', animation: 'flicker 0.5s ease-in-out infinite' },
    lotus: { type: 'emoji', icon: '🪷', animation: 'float 4s ease-in-out infinite' },
  };

  useEffect(() => {
    // Load initial cursor preference
    const updateCursorState = () => {
        const savedType = localStorage.getItem('bitacora_cursor');
        const savedSize = localStorage.getItem('bitacora_cursor_size');
        const savedColor = localStorage.getItem('bitacora_cursor_color');

        if (savedType) setCursorType(savedType);
        if (savedSize) setCursorSize(parseFloat(savedSize));
        if (savedColor) setCursorColor(savedColor);
    };

    updateCursorState();

    // Listen for changes
    window.addEventListener('cursor-change', updateCursorState);
    return () => window.removeEventListener('cursor-change', updateCursorState);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true);
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, 0)`;
      }
    };

    const handleMouseOver = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const isClickable = 
          target.tagName === 'BUTTON' || 
          target.tagName === 'A' || 
          !!target.closest('button') || 
          !!target.closest('a') || 
          target.classList.contains('cursor-pointer') ||
          window.getComputedStyle(target).cursor === 'pointer';
        
        setIsHovering(isClickable);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  const currentOption = cursorOptions[cursorType as keyof typeof cursorOptions] || cursorOptions.pendulum;

  return (
    <div
      ref={cursorRef}
      className="hidden md:block fixed top-0 left-0 pointer-events-none z-[9999] will-change-transform"
    >
      <div
        className={`origin-top ${isHovering ? 'scale-125' : 'scale-100'}`}
        style={{ 
            animation: currentOption.animation,
            transform: `scale(${cursorSize}) ${isHovering ? 'scale(1.25)' : 'scale(1)'}`,
            color: currentOption.type === 'arrow' ? cursorColor : 'inherit'
        }}
      >
        {currentOption.type === 'image' ? (
          <img 
            src={currentOption.src} 
            alt="cursor" 
            className="w-32 h-auto"
          />
        ) : currentOption.type === 'arrow' ? (
             currentOption.id === 'arrow-simple' ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="transform -rotate-45" style={{ width: '32px', height: '32px' }}>
                    <path d="M12 2L2 22l10-2 10 2L12 2z" />
                </svg>
             ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="transform -rotate-45" style={{ width: '32px', height: '32px' }}>
                    <path d="M12 2L2 22l10-4 10 4L12 2z" />
                    <circle cx="12" cy="12" r="3" className="text-white mix-blend-overlay" />
                </svg>
             )
        ) : (
          <span 
            className="text-4xl block"
            style={{ fontSize: '3rem' }}
          >
            {currentOption.icon}
          </span>
        )}
      </div>
    </div>
  );
};

export default CustomCursor;
