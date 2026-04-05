
import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

interface InputDialogProps {
  isOpen: boolean;
  title: string;
  placeholder: string;
  onConfirm: (value: string) => void;
  onClose: () => void;
  confirmText?: string;
  type?: string;
}

const InputDialog: React.FC<InputDialogProps> = ({ isOpen, title, placeholder, onConfirm, onClose, confirmText = "확인", type = "text" }) => {
  const [value, setValue] = useState('');

  useEffect(() => {
    if (isOpen) {
      setValue('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (value.trim()) {
      onConfirm(value);
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <input
            type={type}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full bg-gray-950 border border-gray-800 rounded-xl p-4 text-white text-center text-xl font-bold outline-none focus:border-indigo-500 transition-all placeholder-gray-700"
            autoFocus
          />
        </div>

        <div className="p-4 bg-gray-950 border-t border-gray-800 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-gray-500 font-bold hover:text-white transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            disabled={!value.trim()}
            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Check size={18} /> {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputDialog;
