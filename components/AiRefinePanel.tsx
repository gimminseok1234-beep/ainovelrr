
import React, { useState } from 'react';
import { Sparkles, Wand2, X, RefreshCw, CheckCircle2, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { AiPreset } from '../types.ts';

interface AiRefinePanelProps {
  currentText: string;
  onRefine: (instruction: string) => void;
  isRefining: boolean;
  disabled?: boolean;
  presets?: AiPreset[];
}

const AiRefinePanel: React.FC<AiRefinePanelProps> = ({ currentText, onRefine, isRefining, disabled, presets = [] }) => {
  const [instruction, setInstruction] = useState('');
  const [isOpen, setIsOpen] = useState(true);

  const handleRefine = () => {
    if (instruction.trim() && !isRefining && !disabled) {
      onRefine(instruction);
      setInstruction('');
    }
  };

  const handlePresetClick = (preset: AiPreset) => {
    onRefine(preset.prompt);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-xs font-bold text-gray-400 hover:text-gray-200 transition-all flex items-center justify-center gap-2"
      >
        <Sparkles size={14} className="text-indigo-400" /> AI 문장 다듬기 도구 열기
      </button>
    );
  }

  return (
    <div className="bg-gray-800/30 border border-gray-700 rounded-2xl overflow-hidden shadow-inner animate-in slide-in-from-top-2 duration-300">
      <div className="flex items-center justify-between p-4 border-b border-gray-700/50 bg-gray-800/50">
        <h3 className="text-xs font-bold text-gray-300 flex items-center gap-2">
          <Sparkles size={14} className="text-indigo-400" /> AI 문장 다듬기
        </h3>
        <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-300">
          <ChevronUp size={16} />
        </button>
      </div>

      <div className="p-4 space-y-4">
        <div className="relative">
          <textarea
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="예: 더 서정적인 문체로 바꿔줘, 대화를 더 생동감 있게 수정해줘..."
            className="w-full h-24 bg-gray-950 border border-gray-700 rounded-xl p-3 text-sm text-gray-200 outline-none focus:border-indigo-500 transition-all resize-none placeholder-gray-600"
            disabled={isRefining || disabled}
          />
          <button
            onClick={handleRefine}
            disabled={!instruction.trim() || isRefining || disabled}
            className="absolute bottom-3 right-3 p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg shadow-lg transition-all"
          >
            {isRefining ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
          </button>
        </div>

        {presets.length > 0 && (
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">빠른 프리셋</label>
            <div className="flex flex-wrap gap-2">
              {presets.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => handlePresetClick(preset)}
                  disabled={isRefining || disabled}
                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-[11px] font-medium rounded-full border border-gray-700 transition-all hover:border-indigo-500 disabled:opacity-50"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiRefinePanel;
