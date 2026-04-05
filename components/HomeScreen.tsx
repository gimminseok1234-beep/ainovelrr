
import React from 'react';
import { BookOpen, Edit3, Plus, Trash2, Settings, FileText, PenTool, FolderOpen, FileSearch, RefreshCcw, X, Sliders, Sparkles, Save, Download, Edit2, LayoutTemplate, ListPlus } from 'lucide-react';
import { Project, SavedStory, ViewMode, NovelSettings, EditorPreferences } from '../types.ts';
import { User } from '../services/firebase.ts';
import UserMenu from './UserMenu.tsx';
import SynopsisRefiner from './SynopsisRefiner.tsx';
import { useHomeScreen } from '../hooks/useHomeScreen.ts';

interface HomeScreenProps {
  projects: Project[];
  stories: SavedStory[];
  onChangeView: (view: ViewMode) => void;
  setActiveProjectId: (id: string) => void;
  onCreateProject: (name: string) => string | void; 
  onDeleteProject: (id: string) => void;
  onUpdateProject?: (project: Project) => void; 
  onOpenProjectSettings: (project: Project) => void;
  onDeleteStory: (id: string) => void;
  onSelectStory: (story: SavedStory) => void;
  onUpdateStory: (story: SavedStory) => void;
  onExternalSave: (title: string, content: string, projectId: string, settings?: NovelSettings, category?: 'manuscript' | 'synopsis') => void;
  onOpenProject?: (project: Project) => void;
  onAnalyzeManuscript?: (text: string) => void;
  isGlobalLoading?: boolean;
  user: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
  settings?: NovelSettings;
  onUpdateSettings?: (settings: NovelSettings) => void;
  editorPrefs?: EditorPreferences;
  onUpdateEditorPrefs?: (prefs: EditorPreferences) => void;
  onOpenTrash?: () => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = (props) => {
  const { 
    projects, 
    stories, 
    onChangeView, 
    setActiveProjectId,
    onDeleteProject,
    onOpenProjectSettings,
    onDeleteStory,
    onSelectStory,
    onExternalSave,
    onOpenProject,
    isGlobalLoading,
    user,
    onSignIn,
    onSignOut,
    settings,
    editorPrefs,
    onOpenTrash,
    isSettingsOpen,
    setIsSettingsOpen
  } = props;

  const {
    isCreating,
    setIsCreating,
    newProjectName,
    setNewProjectName,
    isSynopsisRefinerOpen,
    setIsSynopsisRefinerOpen,
    editingPresetId,
    presetLabel,
    setPresetLabel,
    presetPrompt,
    setPresetPrompt,
    fileInputRef,
    handleCreate,
    handleExportProject,
    handleFileUpload,
    handleCreativityChange,
    updatePref,
    currentPresets,
    handleSavePreset,
    handleEditPreset,
    handleCancelEdit,
    handleDeletePreset,
    handleResetPresets
  } = useHomeScreen(props);

  const handleProjectClick = (project: Project) => {
    if (onOpenProject) {
      onOpenProject(project);
    } else {
      setActiveProjectId(project.id);
      onChangeView('WRITER');
    }
  };

  if (isGlobalLoading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-[#121212] text-white z-50">
        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-6"></div>
        <h2 className="text-2xl font-bold mb-2">AI 처리 중...</h2>
        <p className="text-gray-400">원고를 분석하여 프로젝트를 생성하고 있습니다.</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-y-auto bg-[#121212] p-8 custom-scrollbar relative transition-colors duration-500">
      
      {/* Header Controls */}
      <div className="absolute top-6 left-6 right-6 z-30 flex items-center justify-end pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-3">
          {onOpenTrash && (
            <button 
              onClick={onOpenTrash}
              className="flex items-center justify-center w-10 h-10 bg-[#1e1e1e] border border-gray-800 rounded-full hover:bg-gray-800 transition-all shadow-lg text-gray-400 hover:text-white hover:border-red-500/50"
              title="휴지통"
            >
              <Trash2 size={18} />
            </button>
          )}
          {settings && (
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center justify-center w-10 h-10 bg-[#1e1e1e] border border-gray-800 rounded-full hover:bg-gray-800 transition-all shadow-lg text-gray-400 hover:text-white"
              title="설정"
            >
              <Settings size={18} />
            </button>
          )}
          <UserMenu user={user} onSignIn={onSignIn} onSignOut={onSignOut} />
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-12 pb-20 pt-20">
        <div className="text-center space-y-4 mt-0">
          <h1 className="text-5xl md:text-6xl font-bold text-purple-400 mb-2">
            NovelCraft AI
          </h1>
          <p className="text-gray-200 text-lg md:text-xl max-w-2xl mx-auto">
            세계관 구축부터 캐릭터 창조, 그리고 원고 집필까지.<br/>
            당신의 상상력을 현실로 만드는 AI 집필 보조 도구입니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <button 
            onClick={() => onChangeView('WRITER')}
            className="group relative p-8 bg-[#1e1e1e] hover:bg-gray-800 border border-gray-800 hover:border-purple-500 rounded-2xl transition-all duration-300 flex flex-col items-center text-center space-y-4 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-1"
          >
            <div className="p-4 bg-purple-900/30 rounded-full text-purple-400 group-hover:text-purple-300 group-hover:scale-110 transition-transform">
              <Edit3 size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-100">AI 원고 집필</h3>
            <p className="text-sm text-gray-400">스토리의 핵심, 원고를 작성합니다.</p>
          </button>

          <button 
            onClick={() => setIsSynopsisRefinerOpen(true)}
            className="group relative p-8 bg-[#1e1e1e] hover:bg-gray-800 border border-gray-800 hover:border-indigo-500 rounded-2xl transition-all duration-300 flex flex-col items-center text-center space-y-4 hover:shadow-2xl hover:shadow-indigo-500/20 hover:-translate-y-1"
          >
            <div className="p-4 bg-indigo-900/30 rounded-full text-indigo-400 group-hover:text-indigo-300 group-hover:scale-110 transition-transform">
              <LayoutTemplate size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-100">시놉시스 다듬기</h3>
            <p className="text-sm text-gray-500">거친 줄거리를 체계적인 설계도로 변환합니다.</p>
          </button>
        </div>
        
        <div className="flex justify-center">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-full transition-colors text-sm border border-gray-700 hover:border-gray-500"
          >
            <FileSearch size={16} /> 기존 원고 분석하여 프로젝트 생성
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden"
              accept=".txt"
              onChange={handleFileUpload}
            />
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <h2 className="text-2xl font-bold text-gray-200 flex items-center gap-3">
              <BookOpen size={24} className="text-gray-400" />
              내 프로젝트
            </h2>
            
            {!isCreating ? (
              <button 
                onClick={() => setIsCreating(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors shadow-lg shadow-purple-500/20"
              >
                <Plus size={18} /> 새 프로젝트
              </button>
            ) : (
              <div className="flex gap-2 animate-in slide-in-from-right fade-in duration-300">
                <input 
                  autoFocus
                  type="text"
                  placeholder="프로젝트 이름"
                  className="bg-[#1e1e1e] border border-gray-700 rounded-lg px-3 py-2 text-gray-200 outline-none focus:border-purple-500"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                />
                <button onClick={handleCreate} className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500">확인</button>
                <button onClick={() => setIsCreating(false)} className="px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600">취소</button>
              </div>
            )}
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-12 bg-[#1e1e1e] rounded-2xl border border-gray-800 border-dashed">
              <p className="text-gray-500 mb-4">아직 생성된 프로젝트가 없습니다.</p>
              <button 
                onClick={() => setIsCreating(true)}
                className="text-purple-400 hover:text-purple-300 font-medium flex items-center justify-center gap-2"
              >
                <Plus size={16} /> 첫 프로젝트 만들기
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {projects.map(project => {
                const projectStories = stories.filter(s => s.projectId === project.id && s.category !== 'synopsis');
                return (
                  <div 
                    key={project.id} 
                    className="flex flex-col bg-[#1e1e1e] border border-gray-800 rounded-xl overflow-hidden hover:border-purple-500 hover:bg-[#2a2a2a] transition-all cursor-pointer group"
                    onClick={() => handleProjectClick(project)}
                  >
                    <div className="p-4 bg-[#252525] border-b border-gray-800 flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg text-gray-200 group-hover:text-purple-400 transition-colors truncate max-w-[200px]" title={project.name}>
                          {project.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(project.createdAt).toLocaleDateString()} 생성
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleExportProject(project.id, project.name); }}
                          className="p-2 text-gray-500 hover:text-green-400 hover:bg-gray-700 rounded-lg transition-colors"
                          title="프로젝트 내보내기 (TXT)"
                        >
                          <Download size={16} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); onOpenProjectSettings(project); }}
                          className="p-2 text-gray-500 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                          title="설정 (세계관/등장인물)"
                        >
                          <Settings size={16} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); onDeleteProject(project.id); }}
                          className="p-2 text-gray-500 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                          title="삭제"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 p-4 min-h-[150px] max-h-[250px] overflow-y-auto custom-scrollbar">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1">
                        <FolderOpen size={12} /> 원고 목록
                      </h4>
                      {projectStories.length === 0 ? (
                        <p className="text-sm text-gray-600 italic py-2">아직 작성된 원고가 없습니다.</p>
                      ) : (
                        <div className="space-y-2">
                          {projectStories.map(story => (
                            <div 
                              key={story.id} 
                              className="group/item flex items-center justify-between p-2 hover:bg-gray-700/50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-gray-600"
                              onClick={(e) => { e.stopPropagation(); onSelectStory(story); }}
                            >
                              <div className="flex items-center gap-2 overflow-hidden flex-1">
                                <FileText size={14} className="text-purple-400 flex-shrink-0" />
                                <span className="text-sm text-gray-300 group-hover/item:text-white truncate">{story.title}</span>
                                <span className="text-xs text-gray-500 ml-1 shrink-0">
                                  ({story.content.replace(/\s/g, '').length.toLocaleString()}자)
                                </span>
                              </div>
                              <button 
                                onClick={(e) => { e.stopPropagation(); onDeleteStory(story.id); }}
                                className="opacity-0 group-hover/item:opacity-100 text-gray-500 hover:text-red-400 p-1 transition-all"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="p-3 border-t border-gray-800 bg-[#252525]">
                      <button 
                        className="w-full py-2 flex items-center justify-center gap-2 text-sm font-medium text-gray-400 group-hover:text-white bg-gray-800 group-hover:bg-purple-600 rounded-lg transition-all"
                      >
                        <PenTool size={14} /> 프로젝트 열기
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Settings Dialog */}
      {isSettingsOpen && settings && editorPrefs && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1e1e1e] border border-gray-800 rounded-xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-5 border-b border-gray-800 bg-[#252525]">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Sliders size={20} className="text-purple-400" /> 프로그램 설정
              </h3>
              <button onClick={() => setIsSettingsOpen(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            
            <div className="p-6 space-y-8 overflow-y-auto custom-scrollbar flex-1">
              <section>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Sparkles size={14}/> AI 설정
                </h4>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-bold text-gray-200 flex items-center gap-2">
                        자유도 (Creativity)
                        <span className="text-purple-400 text-xs font-normal bg-purple-900/30 px-2 py-0.5 rounded-full">Level {settings.creativityLevel || 7}</span>
                      </label>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="10" 
                      step="1" 
                      value={settings.creativityLevel || 7}
                      onChange={(e) => handleCreativityChange(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>엄격함 (1)</span>
                      <span>창의적 (10)</span>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700 space-y-4">
                    <h5 className="text-sm font-bold text-gray-200 flex items-center gap-2">
                      <Sparkles size={14} className="text-blue-400" /> Gemini API 설정
                    </h5>
                    <p className="text-[10px] text-gray-400">
                      Google Gemini 모델을 사용합니다.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <ListPlus size={14}/> AI 프리셋 관리 (문장 수정용)
                </h4>
                
                <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-4 space-y-4">
                  <div className="flex gap-2">
                    <div className="flex-1 space-y-2">
                      <input 
                        className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1.5 text-xs text-white focus:border-purple-500 outline-none"
                        placeholder="프리셋 이름 (예: 부드럽게)"
                        value={presetLabel}
                        onChange={(e) => setPresetLabel(e.target.value)}
                      />
                      <textarea 
                        className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1.5 text-xs text-white focus:border-purple-500 outline-none resize-none h-16"
                        placeholder="AI 지시사항 (예: 문장을 부드럽게 다듬고 감성적인 단어를 사용해줘)"
                        value={presetPrompt}
                        onChange={(e) => setPresetPrompt(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-2 w-16">
                      <button 
                        onClick={handleSavePreset}
                        disabled={!presetLabel || !presetPrompt}
                        className={`flex-1 ${editingPresetId ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-purple-600 hover:bg-purple-500'} disabled:bg-gray-700 disabled:text-gray-500 text-white rounded text-xs font-bold flex flex-col items-center justify-center gap-1 transition-colors`}
                      >
                        {editingPresetId ? <Save size={16}/> : <Plus size={16}/>}
                        {editingPresetId ? "저장" : "추가"}
                      </button>
                      {editingPresetId && (
                        <button 
                          onClick={handleCancelEdit}
                          className="h-8 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs flex items-center justify-center"
                        >
                          취소
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {currentPresets.map(preset => (
                      <div 
                        key={preset.id} 
                        className={`flex items-center justify-between p-2 rounded border text-xs cursor-pointer transition-all ${editingPresetId === preset.id ? 'border-purple-500 bg-purple-900/20' : 'border-gray-800 bg-gray-900 hover:bg-gray-800'}`}
                        onClick={() => handleEditPreset(preset)}
                      >
                        <div className="flex-1 min-w-0 pr-2">
                          <span className={`font-bold block truncate ${editingPresetId === preset.id ? 'text-purple-300' : 'text-gray-300'}`}>{preset.label}</span>
                          <span className="text-gray-500 block truncate">{preset.prompt}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleEditPreset(preset); }} 
                            className={`p-1.5 rounded ${editingPresetId === preset.id ? 'text-purple-300 bg-purple-900/50' : 'text-gray-500 hover:text-white hover:bg-gray-700'}`}
                          >
                            <Edit2 size={12}/>
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDeletePreset(preset.id); }} 
                            className="text-gray-500 hover:text-red-400 p-1.5 hover:bg-gray-700 rounded"
                          >
                            <Trash2 size={12}/>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <button onClick={handleResetPresets} className="w-full py-1 text-[10px] text-gray-500 hover:text-white border border-transparent hover:border-gray-700 rounded flex items-center justify-center gap-1">
                    <RefreshCcw size={10}/> 프리셋 초기화 (기본값 복구)
                  </button>
                </div>
              </section>

              <section>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <PenTool size={14}/> 에디터 환경 설정
                </h4>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-300">원고 영역 색 구분</span>
                      <span className="text-xs text-gray-500">종이 질감처럼 원고 영역을 분리합니다.</span>
                    </div>
                    <button 
                      onClick={() => updatePref('colorSeparation', !editorPrefs.colorSeparation)}
                      className={`flex items-center justify-center px-3 py-1 rounded-full font-bold text-xs transition-all duration-300 ${editorPrefs.colorSeparation ? 'bg-purple-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'bg-gray-700 text-gray-400'}`}
                    >
                      {editorPrefs.colorSeparation ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-300">에디터 너비</span>
                      <span className="text-xs font-bold text-purple-400">{editorPrefs.editorWidth}px</span>
                    </div>
                    <input 
                      type="range" 
                      min="300" 
                      max="1000" 
                      step="10"
                      value={editorPrefs.editorWidth}
                      onChange={(e) => updatePref('editorWidth', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-300">문단 간격 (Line Height)</span>
                      <span className="text-xs font-bold text-purple-400">{editorPrefs.paragraphSpacing}em</span>
                    </div>
                    <input 
                      type="range" 
                      min="1.0" 
                      max="3.0" 
                      step="0.1"
                      value={editorPrefs.paragraphSpacing}
                      onChange={(e) => updatePref('paragraphSpacing', parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>
                </div>
              </section>
            </div>

            <div className="p-5 border-t border-gray-800 bg-[#252525] rounded-b-xl flex justify-end">
              <button onClick={() => { alert("설정이 적용되었습니다."); setIsSettingsOpen(false); }} className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-bold transition-colors shadow-lg">확인</button>
            </div>
          </div>
        </div>
      )}

      <SynopsisRefiner 
        isOpen={isSynopsisRefinerOpen}
        onClose={() => setIsSynopsisRefinerOpen(false)}
        projects={projects}
        stories={stories}
        activeProjectId={null}
        onSaveCard={(title, content, instructions, projectId) => {
          onExternalSave(title, content, projectId, { ...settings, guidelines: instructions } as NovelSettings, 'synopsis');
        }}
        onUpdateProject={(project) => {
          if (props.onUpdateProject) props.onUpdateProject(project);
        }}
        onCreateProject={props.onCreateProject}
        settings={settings}
      />
    </div>
  );
};

export default HomeScreen;
