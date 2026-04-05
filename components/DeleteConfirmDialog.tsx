
import React from 'react';
import { X, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
}

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-5 border-b border-gray-800 bg-gray-850/50">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <AlertTriangle size={20} className="text-red-500" /> 삭제 확인
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-4 text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 size={32} className="text-red-500" />
          </div>
          <p className="text-sm text-gray-300 leading-relaxed font-medium">
            {message}
          </p>
          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
            이 작업은 되돌릴 수 없습니다.
          </p>
        </div>

        <div className="p-4 bg-gray-950 border-t border-gray-800 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-gray-500 font-bold hover:text-white transition-colors"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Trash2 size={18} /> 삭제하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmDialog;
