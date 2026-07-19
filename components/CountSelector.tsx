'use client';

import { useRouter } from 'next/navigation';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
  href: string; // e.g. "/category/asset" or "/random"
}

export default function CountSelector({ open, onClose, title, subtitle, icon, iconBg, href }: Props) {
  const router = useRouter();
  if (!open) return null;

  const handleSelect = (n: number) => {
    router.push(`${href}?count=${n}`);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in">
        <div className="text-center">
          {/* Icon */}
          <div className={`w-14 h-14 rounded-2xl ${iconBg} flex items-center justify-center mx-auto mb-4`}>
            {icon}
          </div>

          <h2 className="text-lg font-bold text-slate-800 mb-1">{title}</h2>
          <p className="text-sm text-slate-500 mb-6">{subtitle}</p>

          {/* Count buttons */}
          <div className="flex justify-center gap-3 mb-4">
            {[5, 10, 15, 20].map((n) => (
              <button key={n} onClick={() => handleSelect(n)}
                className="w-16 h-16 rounded-xl border-2 border-slate-200 bg-white text-slate-700 font-bold text-lg hover:border-blue-400 hover:text-blue-600 hover:shadow-md transition-all active:scale-95">
                {n}
              </button>
            ))}
          </div>
          <button onClick={onClose}
            className="mt-4 px-6 py-2 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700 transition-all">
            取消
          </button>
        </div>
      </div>
    </div>
  );
}
