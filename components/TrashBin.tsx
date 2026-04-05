
import React, { useState } from 'react';
import { X, Trash2, RotateCcw, AlertTriangle, FolderOpen, FileText, Trash, Info } from 'lucide-react';
import { Project, SavedStory } from '../types.ts';

interface TrashBinProps {
  isOpen: boolean;
  onClose: () => void;
  deletedProjects: Project[];
  deletedStories: SavedStory[];
  onRestoreProject: (id: string) => void;
  onRestoreStory: (id: string) => void;
  onHardDeleteProject: (id: string) => void;
  onHardDeleteStory: (id: string) => void;
}

const TrashBin: React.FC<TrashBinProps> = ({ 
  isOpen, onClose, 
  deletedProjects, deletedStories, 
  onRestoreProject, onRestoreStory, 
  onHardDeleteProject, onHardDeleteStory 
}) => {
  const [activeTab, setActiveTab] = useState<'projects' | 'stories'>('projects');

  if (!isOpen) return null;

  const totalItems = deletedProjects.length + deletedStories.length;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-gray-850">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600/20 rounded-lg">
              <Trash2 size={20} className="text-red-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">휴지통</h2>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">삭제된 항목 {totalItems}개</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex border-b border-gray-800 bg-gray-950/50">
          <button 
            onClick={() => setActiveTab('projects')}
            className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 ${activeTab === 'projects' ? 'border-red-500 text-white bg-red-500/5' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
          >
            삭제된 프로젝트 ({deletedProjects.length})
          </button>
          <button 
            onClick={() => setActiveTab('stories')}
            className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 ${activeTab === 'stories' ? 'border-red-500 text-white bg-red-500/5' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
          >
            삭제된 원고 ({deletedStories.length})
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-4 custom-scrollbar bg-gray-950/30">
          {activeTab === 'projects' ? (
            deletedProjects.length === 0 ? (
              <EmptyState message="삭제된 프로젝트가 없습니다." />
            ) : (
              deletedProjects.map(project => (
                <TrashItem 
                  key={project.id} 
                  title={project.name} 
                  icon={<FolderOpen size={18} />} 
                  onRestore={() => onRestoreProject(project.id)} 
                  onDelete={() => onHardDeleteProject(project.id)} 
                />
              ))
            )
          ) : (
            deletedStories.length === 0 ? (
              <EmptyState message="삭제된 원고가 없습니다." />
            ) : (
              deletedStories.map(story => (
                <TrashItem 
                  key={story.id} 
                  title={story.title} 
                  icon={<FileText size={18} />} 
                  onRestore={() => onRestoreStory(story.id)} 
                  onDelete={() => onHardDeleteStory(story.id)} 
                />
              ))
            )
          )}
        </div>

        <div className="p-4 bg-gray-950 border-t border-gray-800 flex justify-center">
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
            <Info size={12} className="text-indigo-400" /> 휴지통의 항목은 30일 후 자동으로 영구 삭제됩니다
          </div>
        </div>
      </div>
    </div>
  );
};

const TrashItem = ({ title, icon, onRestore, onDelete }: { title: string, icon: React.ReactNode, onRestore: () => void, onDelete: () => void }) => (
  <div className="flex items-center justify-between p-4 bg-gray-900 border border-gray-800 rounded-xl hover:border-gray-700 transition-all group">
    <div className="flex items-center gap-3">
      <div className="text-gray-600 group-hover:text-gray-400 transition-colors">{icon}</div>
      <span className="text-sm font-medium text-gray-300 truncate max-w-[300px]">{title}</span>
    </div>
    <div className="flex gap-2">
      <button 
        onClick={onRestore}
        className="p-2 text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all"
        title="복구하기"
      >
        <RotateCcw size={18} />
      </button>
      <button 
        onClick={onDelete}
        className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
        title="영구 삭제"
      >
        <Trash size={18} />
      </button>
    </div>
  </div>
);

const EmptyState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-20 text-gray-600">
    <Trash2 size={48} className="mb-4 opacity-10" />
    <p className="text-sm font-medium">{message}</p>
  </div>
);

export default TrashBin;
