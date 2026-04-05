
import React, { useState, useEffect } from 'react';
import { X, Settings2, Save, Trash2, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { Project, NovelSettings } from '../types.ts';

interface ProjectSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onSave: (project: Project) => void;
}

const ProjectSettingsDialog: React.FC<ProjectSettingsDialogProps> = ({ isOpen, onClose, project, onSave }) => {
  const [name, setName] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [guidelines, setGuidelines] = useState('');
  const [activeTab, setActiveTab] = useState<'general' | 'ai'>('general');

  useEffect(() => {
    if (isOpen && project) {
      setName(project.name);
      setSynopsis(project.settings.synopsis);
      setGuidelines(project.settings.guidelines);
    }
  }, [isOpen, project]);

  if (!isOpen || !project) return null;

  const handleSave = () => {
    if (name.trim()) {
      const updatedProject: Project = {
        ...project,
        name,
        settings: {
          ...project.settings,
          synopsis,
          guidelines
        }
      };
      onSave(updatedProject);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-gray-850">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600/20 rounded-lg">
              <Settings2 size={20} className="text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">프로젝트 설정</h2>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">{project.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex border-b border-gray-800 bg-gray-950/50">
          <button 
            onClick={() => setActiveTab('general')}
            className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 ${activeTab === 'general' ? 'border-indigo-500 text-white bg-indigo-500/5' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
          >
            기본 정보
          </button>
          <button 
            onClick={() => setActiveTab('ai')}
            className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 ${activeTab === 'ai' ? 'border-indigo-500 text-white bg-indigo-500/5' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
          >
            AI 집필 설정
          </button>
        </div>

        <div className="p-8 overflow-y-auto flex-1 space-y-8 custom-scrollbar">
          {activeTab === 'general' ? (
            <>
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  프로젝트 이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-4 text-white outline-none focus:border-indigo-500 transition-all shadow-inner"
                  placeholder="프로젝트의 이름을 입력하세요"
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">시놉시스 (전체 줄거리)</label>
                <textarea
                  value={synopsis}
                  onChange={(e) => setSynopsis(e.target.value)}
                  className="w-full h-48 bg-gray-950 border border-gray-800 rounded-xl p-4 text-white outline-none focus:border-indigo-500 transition-all resize-none shadow-inner custom-scrollbar text-sm leading-relaxed"
                  placeholder="소설의 전체적인 줄거리와 핵심 플롯을 작성하세요. AI가 이야기를 전개할 때 가장 중요한 참고 자료가 됩니다."
                />
              </div>
            </>
          ) : (
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">집필 가이드라인</label>
                <textarea
                  value={guidelines}
                  onChange={(e) => setGuidelines(e.target.value)}
                  className="w-full h-48 bg-gray-950 border border-gray-800 rounded-xl p-4 text-white outline-none focus:border-indigo-500 transition-all resize-none shadow-inner custom-scrollbar text-sm leading-relaxed"
                  placeholder="AI가 글을 쓸 때 지켜야 할 문체, 금기 사항, 특정 표현 방식 등을 자유롭게 작성하세요."
                />
              </div>

              <div className="bg-indigo-900/10 border border-indigo-500/20 rounded-2xl p-5 flex gap-4">
                <div className="p-2 bg-indigo-500/20 rounded-full h-fit">
                  <Info size={18} className="text-indigo-400" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-indigo-300">AI 집필 팁</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    가이드라인이 구체적일수록 AI는 당신의 의도에 더 가까운 글을 생성합니다. 
                    특정 캐릭터의 말투나 자주 사용하는 비유 등을 포함해 보세요.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-gray-950 border-t border-gray-800 flex justify-between items-center">
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
            <CheckCircle2 size={12} className="text-emerald-500" /> 모든 변경사항은 로컬에 저장됩니다
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 text-gray-500 font-bold hover:text-white transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={!name.trim()}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              <Save size={18} /> 변경사항 저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectSettingsDialog;
