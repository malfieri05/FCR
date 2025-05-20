import React, { ReactNode, useEffect } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  actions?: ReactNode;
  mascotUrl?: string;
  valueProp?: string;
  legal?: string;
}

const Modal: React.FC<ModalProps> = ({ open, onClose, title, description, children, actions, mascotUrl, valueProp, legal }) => {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-[3px] transition-all">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 px-8 pt-14 pb-8 animate-fade-in-up border border-blue-100" style={{ boxShadow: '0 8px 40px 0 rgba(16, 42, 67, 0.18), 0 1.5px 6px 0 rgba(16, 42, 67, 0.08)' }}>
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full transition"
          aria-label="Close modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {mascotUrl && (
          <div className="flex justify-center mb-4" style={{ marginTop: -64 }}>
            <img src={mascotUrl} alt="Mascot" className="w-24 h-24 rounded-full shadow-lg border-2 border-blue-200 object-cover bg-white" />
          </div>
        )}
        <div className="mb-2 text-center">
          <h2 className="text-3xl font-extrabold text-blue-600 mb-4 tracking-tight" style={{ letterSpacing: '-0.01em' }}>{title}</h2>
          {valueProp && (
            <div className="text-blue-500 font-medium mb-6 text-base">
              {(() => {
                let v = valueProp.trim();
                if (v.endsWith('.')) v = v.slice(0, -1);
                if (!v.endsWith('!')) v += '!';
                return v;
              })()}
            </div>
          )}
          {description && <p className="text-gray-600 mb-6 text-base">{description}</p>}
        </div>
        {children}
        {actions && (
          <div className="mt-6 flex flex-row justify-center items-center gap-x-6">
            {React.Children.map(actions, (action) => (
              <div className="flex justify-center">{action}</div>
            ))}
          </div>
        )}
        {legal && <div className="mt-6 text-xs text-gray-400 text-center">{legal}</div>}
      </div>
      <style jsx global>{`
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(40px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.45s cubic-bezier(0.23, 1, 0.32, 1);
        }
      `}</style>
    </div>
  );
};

export default Modal; 