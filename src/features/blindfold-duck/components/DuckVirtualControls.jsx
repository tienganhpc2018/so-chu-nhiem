import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Hand } from 'lucide-react';

export const DuckVirtualControls = ({ onMove, onCatch }) => {
  const triggerMove = (key) => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key, code: key }));
    setTimeout(() => {
      window.dispatchEvent(new KeyboardEvent('keyup', { key, code: key }));
    }, 120);
  };

  return (
    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none z-40 select-none">
      {/* 4 phím điều hướng D-Pad cảm ứng */}
      <div className="relative w-28 h-28 pointer-events-auto bg-slate-900/60 backdrop-blur-md rounded-full p-2 border border-white/20 shadow-xl">
        <button
          onClick={() => triggerMove('ArrowUp')}
          className="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 active:bg-amber-400 text-white active:text-slate-900 flex items-center justify-center transition-all"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
        <button
          onClick={() => triggerMove('ArrowDown')}
          className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 active:bg-amber-400 text-white active:text-slate-900 flex items-center justify-center transition-all"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
        <button
          onClick={() => triggerMove('ArrowLeft')}
          className="absolute left-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 active:bg-amber-400 text-white active:text-slate-900 flex items-center justify-center transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => triggerMove('ArrowRight')}
          className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 active:bg-amber-400 text-white active:text-slate-900 flex items-center justify-center transition-all"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Nút to BẮT VỊT */}
      <div className="pointer-events-auto">
        <button
          onClick={onCatch}
          className="w-20 h-20 rounded-full bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 text-white font-black text-xs shadow-2xl shadow-red-500/80 active:scale-90 flex flex-col items-center justify-center border-4 border-yellow-300"
        >
          <Hand className="w-7 h-7 mb-0.5" />
          <span className="tracking-tight uppercase text-[10px]">BẮT VỊT</span>
        </button>
      </div>
    </div>
  );
};
