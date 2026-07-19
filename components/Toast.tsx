'use client';

import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type = 'success', onClose, duration = 2000 }: ToastProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setShow(true));
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bg = type === 'success'
    ? 'bg-emerald-600'
    : 'bg-red-500';

  return (
    <div className={`fixed top-6 left-1/2 z-[100] -translate-x-1/2 transition-all duration-300 ${
      show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
    }`}>
      <div className={`${bg} text-white px-5 py-3 rounded-xl shadow-lg shadow-black/20 text-sm font-medium flex items-center gap-2`}>
        <span>{type === 'success' ? '✓' : '✕'}</span>
        {message}
      </div>
    </div>
  );
}

// Hook for managing toasts
export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  return { toast, showToast: setToast, clearToast: () => setToast(null) };
}
