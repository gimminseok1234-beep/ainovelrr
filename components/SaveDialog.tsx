
import React, { useState } from 'react';
import { Project, SavedStory } from '../types.ts';
import { X, Plus, Save, FolderOpen } from 'lucide-react';

interface SaveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, projectId: string, category: 'manuscript' | 'synopsis') => void;
  projects: Project[];
  onCreateProject: (name: string) => string | void;
  category: 'manuscript' | 'synopsis';
}

const SaveDialog: React.FC<SaveDialogProps> = ({ isOpen, onClose, onSave, projects, onCreateProject, category }) => {
  const [title, setTitle] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [showNewProjectInput, setShowNewProjectInput] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    if (title.trim() && selectedProjectId) {
      onSave(title, selectedProjectId, category);
      onClose();
    }
  };

  const handleCreateNewProject = () => {
    if (newProjectName.trim()) {
      const newId = onCreateProject(newProjectName);
      if (newId) setSelectedProjectId(newId);
      setNewProjectName('');
      setShowNewProjectInput(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Save size={20} className="text-indigo-400" /> 원고 저장하기
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">원고 제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 1화 - 시작되는 모험"
              className="w-full bg-gray-950 border border-gray-800 rounded-xl p-4 text-white outline-none focus:border-indigo-500 transition-all"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">프로젝트 선택</label>
              <button 
                onClick={() => setShowNewProjectInput(!showNewProjectInput)}
                className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <Plus size={10} /> {showNewProjectInput ? '취소' : '새 프로젝트'}
              </button>
            </div>
            
            {showNewProjectInput && (
              <div className="flex gap-2 p-2 bg-gray-950 border border-gray-800 rounded-xl animate-in slide-in-from-top-1 duration-200">
                <input 
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="새 프로젝트 이름"
                  className="flex-1 bg-transparent border-none outline-none text-sm text-white px-2"
                  autoFocus
                />
                <button 
                  onClick={handleCreateNewProject}
                  disabled={!newProjectName.trim()}
                  className="p-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg transition-all"
                >
                  <Plus size={16} />
                </button>
              </div>
            )}
            
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
              {projects.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-gray-800 rounded-xl">
                  <p className="text-sm text-gray-600">저장할 프로젝트가 없습니다.</p>
                </div>
              ) : (
                projects.map(project => (
                  <button
                    key={project.id}
                    onClick={() => setSelectedProjectId(project.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                      selectedProjectId === project.id 
                        ? 'bg-indigo-600/20 border-indigo-500 text-white' 
                        : 'bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700'
                    }`}
                  >
                    <FolderOpen size={18} className={selectedProjectId === project.id ? 'text-indigo-400' : 'text-gray-600'} />
                    <span className="text-sm font-medium truncate">{project.name}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="p-5 bg-gray-950 border-t border-gray-800 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-gray-400 font-bold hover:text-white transition-colors"
          >
            취ce
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim() || !selectedProjectId}
            className="flex-[2] py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg transition-all"
          >
            저장 완료
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveDialog;
