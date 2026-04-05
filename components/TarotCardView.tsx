
import React, { useRef, useEffect, useState } from 'react';
import { DeckCard, DrawEffect } from '../types';
import gsap from 'gsap';

interface Props {
  card: DeckCard;
  index: number;
  isFlipped: boolean;
  isSelected: boolean;
  isHovered: boolean;
  hoverProgress: number; // 0 to 1
  position: { x: number; y: number; rotation: number; zIndex: number };
  id: string;
  drawEffect: DrawEffect;
  onClick?: () => void;
}

export const TarotCardView: React.FC<Props> = ({ 
  card, 
  isFlipped, 
  isSelected, 
  isHovered,
  hoverProgress,
  position, 
  id,
  drawEffect,
  onClick
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null); // For Resonance
  const particlesRef = useRef<HTMLDivElement>(null); // For Stardust
  const threadPathRef = useRef<SVGPathElement>(null); // For Thread
  const threadWrapRef = useRef<HTMLDivElement>(null); // For Thread
  
  const [hasError, setHasError] = useState(false);
  
  // Track if this is the first time animating to avoid initial load weirdness
  const isFirstRender = useRef(true);

  // Animate position changes based on Effect
  useEffect(() => {
    if (!cardRef.current) return;
    
    const el = cardRef.current;
    gsap.set(el, { xPercent: -50, yPercent: -50, transformOrigin: '50% 50%' });
    
    // Default Animation State
    let target = {
        x: position.x,
        y: position.y,
        rotation: position.rotation,
        zIndex: position.zIndex,
        scale: isSelected ? 1.2 : (isHovered && !isSelected ? 1.1 : 1),
        opacity: 1,
        filter: 'none'
    };
    
    let duration = 0.5;
    let ease = "power2.out";
    
    // --- EFFECT SPECIFIC LOGIC ---
    
    if (isSelected && !isFirstRender.current) {
        // --- 1. ETHEREAL RESONANCE ---
        if (drawEffect === 'resonance') {
            ease = "back.out(0.8)"; 
        }
        
        // --- 2. STARDUST MATERIALIZATION ---
        else if (drawEffect === 'stardust') {
            gsap.killTweensOf(el);
            target.filter = 'blur(0px)'; // End state
            target.scale = 1.2;
            
             gsap.fromTo(el, 
                { filter: 'blur(20px) brightness(2)', scale: 0.2, opacity: 0.8 },
                { 
                    x: position.x, 
                    y: position.y, 
                    rotation: position.rotation, 
                    zIndex: position.zIndex, 
                    scale: 1.2, 
                    opacity: 1,
                    filter: 'blur(0px) brightness(1)',
                    duration: 1.5,
                    ease: "power2.inOut" 
                }
            );
            return; 
        }
        
        // --- 3. ABYSSAL PULL ---
        else if (drawEffect === 'abyss') {
             gsap.killTweensOf(el);
             gsap.fromTo(el,
                { y: position.y + 200, opacity: 0, x: position.x, rotation: position.rotation, zIndex: position.zIndex },
                { y: position.y, opacity: 1, duration: 2.5, ease: "power3.out", delay: 0.2 }
             );
             return;
        }

        // --- 4. THREAD OF FATE ---
        else if (drawEffect === 'thread') {
            duration = 1.05;
            ease = "power3.out";
            target.rotation = 0; // Keep selected card upright for thread effect
        }
    }

    gsap.to(el, {
        ...target,
        boxShadow: (drawEffect === 'resonance' && isSelected)
            ? "0 0 50px 10px rgba(255, 255, 255, 0.6), 0 0 100px 20px rgba(100, 200, 255, 0.4)" 
            : ((isHovered || isSelected) && drawEffect === 'resonance')
                ? "0 0 20px 2px rgba(100, 200, 255, 0.6)"
                : isSelected ? "0 20px 50px rgba(0,0,0,0.8)" : "2px 2px 5px rgba(0,0,0,0.5)",
        duration: duration,
        ease: ease,
        onComplete: () => {
            if (drawEffect === 'resonance' && isSelected && glowRef.current) {
                gsap.fromTo(glowRef.current, { opacity: 1 }, { opacity: 0, duration: 0.5 });
            }
        }
    });

    isFirstRender.current = false;

  }, [position.x, position.y, position.rotation, position.zIndex, isHovered, isSelected, drawEffect]);

  // Handle Flip
  useEffect(() => {
    if (cardRef.current) {
        const inner = cardRef.current.querySelector('.card-inner');
        gsap.to(inner, {
            rotationY: isFlipped ? 180 : 0,
            duration: 0.8,
            ease: "back.out(1.2)"
        });
        
        if (isFlipped && drawEffect === 'resonance' && glowRef.current) {
             gsap.fromTo(glowRef.current, { opacity: 0.8, scale: 1.5 }, { opacity: 0, scale: 1, duration: 0.8 });
        }
    }
  }, [isFlipped, drawEffect]);

  useEffect(() => {
    if (drawEffect !== 'thread' || !isSelected || isFlipped) {
      if (threadPathRef.current) {
        gsap.killTweensOf(threadPathRef.current);
      }
      if (threadWrapRef.current) {
        gsap.killTweensOf(threadWrapRef.current);
      }
      return;
    }

    if (threadPathRef.current) {
      gsap.killTweensOf(threadPathRef.current);
      gsap.fromTo(
        threadPathRef.current,
        { strokeDashoffset: 120, opacity: 0.45 },
        { strokeDashoffset: 0, opacity: 0.95, duration: 1.3, ease: 'none', repeat: -1 }
      );
    }

    if (threadWrapRef.current) {
      gsap.killTweensOf(threadWrapRef.current);
      gsap.fromTo(
        threadWrapRef.current,
        { x: -2 },
        { x: 2, duration: 1.8, ease: 'sine.inOut', yoyo: true, repeat: -1 }
      );
    }
  }, [drawEffect, isSelected, isFlipped]);


  return (
    <div 
      ref={cardRef}
      id={id}
      onClick={onClick}
      className="absolute w-32 h-56 sm:w-40 sm:h-72 card-3d-container cursor-pointer will-change-transform"
      style={{ 
        left: '50%',
        top: '50%',
      }}
    >
      {/* THREAD EFFECT LINE */}
      {drawEffect === 'thread' && isSelected && !isFlipped && (
          <div ref={threadWrapRef} className="absolute top-full left-1/2 -translate-x-1/2 pointer-events-none z-[-1]">
              <svg width="84" height="980" viewBox="0 0 84 980" className="overflow-visible opacity-85">
                  <path
                    d="M42 0 C 58 130, 26 280, 42 440 C 58 610, 24 790, 42 980"
                    stroke="rgba(239, 68, 68, 0.35)"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <path
                    ref={threadPathRef}
                    d="M42 0 C 58 130, 26 280, 42 440 C 58 610, 24 790, 42 980"
                    stroke="rgba(248, 113, 113, 0.95)"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray="18 10"
                  />
              </svg>
          </div>
      )}

      {/* RESONANCE GLOW OVERLAY */}
      {drawEffect === 'resonance' && (
          <div ref={glowRef} className="absolute inset-0 bg-white rounded-xl pointer-events-none opacity-0 mix-blend-overlay z-50 transition-opacity" />
      )}

      <div className="card-inner w-full h-full relative transition-all duration-500">
        
        {/* Front Face (Content) */}
        <div 
          className="absolute w-full h-full backface-hidden bg-slate-900 rounded-xl border border-amber-600/50 overflow-hidden shadow-2xl flex flex-col"
          style={{ 
              transform: 'rotateY(180deg)',
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)'
          }}
        >
            <div className={`w-full h-full flex flex-col transition-transform duration-0 bg-[#0c0c0c]`} style={{ transform: card.isReversed ? 'rotate(180deg)' : 'none' }}>
                <div className="h-[85%] overflow-hidden relative">
                    {hasError ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 p-4 text-center">
                            <span className="text-amber-500/50 text-4xl mb-2">?</span>
                            <span className="text-amber-100/50 font-serif text-[10px] uppercase tracking-widest">Image Unavailable</span>
                        </div>
                    ) : (
                        <img 
                            src={card.image} 
                            alt={card.name} 
                            onError={() => setHasError(true)}
                            className="object-cover w-full h-full opacity-90" 
                        />
                    )}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-black/60 pointer-events-none"></div>
                    <div className="absolute inset-1 border border-amber-500/30 rounded-lg pointer-events-none"></div>
                </div>
                <div className="h-[15%] flex items-center justify-center bg-[#111] border-t border-amber-800/50">
                    <span className="text-amber-100/90 text-xs sm:text-sm font-serif tracking-widest text-center px-1">
                        {card.nameEn}
                    </span>
                </div>
            </div>
        </div>

        {/* Back Face (Standard) */}
        <div className="absolute w-full h-full backface-hidden bg-[#0f172a] rounded-xl border border-amber-700/60 shadow-xl overflow-hidden">
             
             {/* STARDUST PARTICLES (Visual Simulation) */}
             {drawEffect === 'stardust' && (isHovered || isSelected) && (
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-50 animate-pulse mix-blend-overlay"></div>
             )}

             {/* ABYSS RIPPLE (Visual Simulation) */}
             {drawEffect === 'abyss' && isHovered && (
                 <div className="absolute -bottom-10 -left-10 -right-10 h-20 bg-black/80 blur-xl rounded-[100%] transform scale-x-150 animate-pulse z-[-1]"></div>
             )}

             {/* CSS Pattern for Card Back */}
             <div className="w-full h-full relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 to-slate-950"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 border border-amber-500/20 rotate-45"></div>
                    <div className="w-16 h-16 border border-amber-500/20 rotate-45 absolute"></div>
                    <div className="w-1 h-24 bg-amber-500/10 absolute"></div>
                    <div className="h-1 w-24 bg-amber-500/10 absolute"></div>
                </div>
                <div className="absolute inset-2 border-2 border-double border-amber-600/40 rounded-lg"></div>
                <div className="absolute inset-1 border border-amber-900/30 rounded-lg"></div>
             </div>
             
             {/* Progress Overlay */}
             {isHovered && !isSelected && (
                 <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                     {/* RESONANCE: Glowing Ring */}
                     {drawEffect === 'resonance' ? (
                        <div className="w-16 h-16 rounded-full border-2 border-cyan-400/50 shadow-[0_0_15px_cyan] animate-ping opacity-50"></div>
                     ) : (
                         <svg className="w-16 h-16 transform -rotate-90">
                             <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-700" />
                             <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={175} strokeDashoffset={175 - (175 * hoverProgress)} className="text-amber-500 transition-all duration-75"/>
                         </svg>
                     )}
                 </div>
             )}
        </div>
      </div>
    </div>
  );
};
