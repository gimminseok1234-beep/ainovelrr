
import React from 'react';
import { Project, SavedStory, RefinedSynopsisCard, NovelSettings, AiModel } from '../types.ts';
import { X, Wand2, FileText, RefreshCw, Save, Edit2, Check, Sparkles, BookOpenCheck, AlertTriangle, CheckCircle2, RefreshCcw, Copy, Settings2 } from 'lucide-react';
import InputDialog from './InputDialog.tsx';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import { useSynopsisRefiner } from '../hooks/useSynopsisRefiner.ts';

interface SynopsisRefinerProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  stories: SavedStory[];
  activeProjectId: string | null;
  onSaveCard: (title: string, content: string, instructions: string, projectId: string) => void;
  onUpdateProject: (project: Project) => void;
  onCreateProject: (name: string) => string | void;
  settings?: NovelSettings;
}

const SynopsisRefiner: React.FC<SynopsisRefinerProps> = (props) => {
  const {
    isOpen,
    onClose,
    projects,
    activeProjectId,
    onSaveCard,
    onCreateProject,
  } = props;

  const {
    selectedProjectId,
    setSelectedProjectId,
    rawSynopsis,
    setRawSynopsis,
    isAnalyzing,
    isContextAnalyzing,
    refinedCards,
    streamingResult,
    editingCardIndex,
    editForm,
    setEditForm,
    isCardRefining,
    isContextStale,
    createProjectDialog,
    setCreateProjectDialog,
    activeProject,
    selectedModel,
    setSelectedModel,
    handleAnalyzeContext,
    handleAnalyzeSynopsis,
    handleRefineCard,
    handleSaveToLibrary,
    handleSaveStreamingResult,
    handleCreateAndSaveAll,
    startEditing,
    saveEditing,
  } = useSynopsisRefiner(props);

  if (!isOpen) return null;

  const handleSaveAllClick = () => {
    if (!selectedProjectId) {
      setCreateProjectDialog(true);
      return;
    }
    
    if (streamingResult) {
      if (confirm(`현재 선택된 '${activeProject?.name}' 프로젝트에 정제된 설계도를 저장하시겠습니까?`)) {
        handleSaveStreamingResult(selectedProjectId);
        alert("저장되었습니다.");
      }
      return;
    }

    if (refinedCards.length > 0) {
      if (confirm(`현재 선택된 '${activeProject?.name}' 프로젝트에 ${refinedCards.length}개의 시놉시스를 저장하시겠습니까?`)) {
        refinedCards.forEach(card => handleSaveToLibrary(card, selectedProjectId));
        alert("모두 저장되었습니다.");
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#1e1e1e] border border-gray-700 rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-gray-800 bg-[#252525] flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-900/30 rounded-lg text-purple-400">
               <Wand2 size={20} />
            </div>
            <div>
               <h2 className="text-xl font-bold text-white">시놉시스 다듬기 (Synopsis Refiner)</h2>
               <p className="text-xs text-gray-400">AI가 원고를 위한 완벽한 설계도로 다듬어 드립니다.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-700 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          <div className="w-full md:w-[400px] flex flex-col border-r border-gray-800 bg-[#151515] p-6 overflow-y-auto custom-scrollbar shrink-0">
             <div className="space-y-6">
                <div>
                   <label className="block text-sm font-bold text-gray-300 mb-2">프로젝트 선택</label>
                   <select 
                      className="w-full bg-[#252525] border border-gray-700 rounded-lg p-3 text-sm text-gray-200 outline-none focus:border-purple-500 transition-colors"
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                   >
                      <option value="">(프로젝트 선택 안 함)</option>
                      {(Array.isArray(projects) ? projects : []).map(p => (
                         <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                   </select>
                   
                   {selectedProjectId && (
                       <div className="mt-3 bg-gray-800 rounded-lg p-3 border border-gray-700">
                           <div className="flex justify-between items-center mb-2">
                               <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                                   <BookOpenCheck size={12}/> 문맥 분석 상태
                               </span>
                               {activeProject?.contextAnalysis && !isContextStale ? (
                                   <span className="text-[10px] text-green-400 flex items-center gap-1"><CheckCircle2 size={10}/> 최신 상태</span>
                               ) : isContextStale ? (
                                   <span className="text-[10px] text-yellow-400 flex items-center gap-1 animate-pulse"><AlertTriangle size={10}/> 업데이트 필요</span>
                               ) : (
                                   <span className="text-[10px] text-gray-500">분석 데이터 없음</span>
                               )}
                           </div>
                           
                           <button 
                                onClick={handleAnalyzeContext}
                                disabled={isContextAnalyzing}
                                className={`w-full py-2 rounded text-xs font-bold flex items-center justify-center gap-2 transition-colors
                                    ${activeProject?.contextAnalysis && !isContextStale 
                                        ? 'bg-gray-700 text-gray-400 hover:bg-gray-600' 
                                        : 'bg-indigo-600 hover:bg-indigo-500 text-white'}
                                `}
                           >
                                {isContextAnalyzing ? <RefreshCw className="animate-spin" size={12}/> : <RefreshCcw size={12}/>}
                                {activeProject?.contextAnalysis && !isContextStale ? "다시 분석하기" : "프로젝트 문맥 분석"}
                           </button>
                       </div>
                   )}
                </div>

                <div>
                   <label className="block text-sm font-bold text-gray-300 mb-2">AI 모델 설정</label>
                   <select 
                      className="w-full bg-[#252525] border border-gray-700 rounded-lg p-3 text-sm text-gray-200 outline-none focus:border-purple-500 transition-colors"
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value as AiModel)}
                   >
                      <option value={AiModel.Gemini31Pro}>Gemini 3.1 Pro (고성능)</option>
                      <option value={AiModel.Gemini3Flash}>Gemini 3 Flash (빠름)</option>
                      <option value={AiModel.Gemini31FlashLite}>Gemini 3.1 Flash Lite (경량)</option>
                   </select>
                </div>

                <div className="flex-1 flex flex-col">
                   <label className="block text-sm font-bold text-gray-300 mb-2 flex justify-between">
                      거친 시놉시스 입력
                      <span className="text-xs font-normal text-gray-500">대사, 괄호() 설명 포함 가능</span>
                   </label>
                   <textarea 
                      className="w-full min-h-[200px] flex-1 bg-[#252525] border border-gray-700 rounded-xl p-4 text-gray-200 outline-none resize-none focus:border-purple-500 transition-colors leading-relaxed text-sm placeholder-gray-600 custom-scrollbar"
                      placeholder={`예시:
 1화: 주인공이 던전에서 깨어난다. (당황하는 심리 묘사). 앞에 몬스터가 나타나는데 "저리 꺼져!"라고 소리치며 검을 휘두른다.
 2화: 마을로 돌아온 주인공. (사람들의 냉담한 반응). 여관 주인이 그를 알아보지 못한다.`}
                      value={rawSynopsis}
                      onChange={(e) => setRawSynopsis(e.target.value)}
                   />
                </div>

                <button 
                   onClick={handleAnalyzeSynopsis}
                   disabled={isAnalyzing || !rawSynopsis.trim()}
                   className="w-full py-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] bg-purple-600 hover:bg-purple-500 text-white disabled:bg-gray-700 disabled:text-gray-500"
                >
                   {isAnalyzing ? <RefreshCw className="animate-spin" /> : <Sparkles fill="currentColor" />}
                   {isAnalyzing ? "AI가 분석 및 구조화 중..." : "시놉시스 다듬기 시작"}
                </button>
             </div>
          </div>

          <div className="flex-1 bg-[#121212] p-6 overflow-y-auto custom-scrollbar relative">
             {!streamingResult && refinedCards.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-50">
                   <FileText size={64} className="mb-4" />
                   <p className="text-lg">왼쪽에서 시놉시스를 입력하고 분석을 시작하세요.</p>
                </div>
             ) : (
                <div className="max-w-3xl mx-auto space-y-6 pb-20">
                   <div className="flex items-center justify-between mb-4 sticky top-0 bg-[#121212] py-2 z-10 border-b border-gray-800/50">
                      <h3 className="text-lg font-bold text-gray-200 flex items-center gap-2">
                         <Sparkles className="text-purple-500" size={20}/> 정제된 원고 설계도
                      </h3>
                      <div className="flex gap-2">
                        {streamingResult && (
                            <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(streamingResult);
                                    alert("클립보드에 복사되었습니다.");
                                }}
                                className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs font-bold flex items-center gap-2 transition-all"
                            >
                                <Copy size={14} /> 복사
                            </button>
                        )}
                        <button 
                            onClick={handleSaveAllClick}
                            className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold shadow-lg flex items-center gap-2 transition-all hover:scale-105"
                        >
                            <Save size={16} /> 
                            {selectedProjectId ? "저장하기" : "새 프로젝트에 저장"}
                        </button>
                      </div>
                   </div>

                   {streamingResult ? (
                       <div className="bg-[#1e1e1e] border border-gray-700 rounded-2xl p-8 shadow-xl min-h-[500px]">
                           <div className="prose prose-invert prose-purple max-w-none">
                               <ReactMarkdown remarkPlugins={[remarkBreaks]}>
                                   {streamingResult}
                               </ReactMarkdown>
                           </div>
                           {isAnalyzing && (
                               <div className="mt-4 flex items-center gap-2 text-purple-400 text-sm font-medium animate-pulse">
                                   <RefreshCw size={14} className="animate-spin" />
                                   AI가 원고를 작성하고 있습니다...
                               </div>
                           )}
                       </div>
                   ) : (
                       (Array.isArray(refinedCards) ? refinedCards : []).map((card, idx) => (
                          <div key={idx} className="bg-[#1e1e1e] border border-gray-700 rounded-xl overflow-hidden shadow-lg hover:border-purple-500/50 transition-colors group">
                             <div className="p-4 bg-[#252525] border-b border-gray-700 flex justify-between items-center">
                                {editingCardIndex === idx && editForm ? (
                                    <div className="flex-1 flex gap-2 mr-4">
                                        <input 
                                            className="w-16 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white text-center"
                                            value={editForm.chapter}
                                            type="number"
                                            onChange={(e) => setEditForm({...editForm, chapter: parseInt(e.target.value)})}
                                        />
                                        <input 
                                            className="flex-1 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white font-bold"
                                            value={editForm.title}
                                            onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                                        />
                                    </div>
                                ) : (
                                    <div>
                                        <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Chapter {card.chapter}</span>
                                        <h4 className="font-bold text-gray-100 text-lg">{card.title}</h4>
                                    </div>
                                )}
                                
                                <div className="flex gap-1">
                                   {editingCardIndex === idx ? (
                                       <button onClick={saveEditing} className="p-2 bg-green-600 hover:bg-green-500 text-white rounded-lg"><Check size={16}/></button>
                                   ) : (
                                       <button onClick={() => startEditing(idx, card)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"><Edit2 size={16}/></button>
                                   )}
                                </div>
                             </div>

                             <div className="p-5 space-y-4">
                                <div>
                                   <label className="text-xs font-bold text-gray-500 mb-1 block">줄거리 (Summary)</label>
                                   {editingCardIndex === idx && editForm ? (
                                       <textarea 
                                          className="w-full h-40 bg-gray-800 border border-gray-600 rounded p-3 text-sm text-gray-200 outline-none resize-none custom-scrollbar"
                                          value={editForm.summary}
                                          onChange={(e) => setEditForm({...editForm, summary: e.target.value})}
                                       />
                                   ) : (
                                       <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{card.summary}</p>
                                   )}
                                </div>
                             </div>

                             <div className="p-3 bg-[#252525] border-t border-gray-700 flex justify-end gap-2">
                                <button 
                                    onClick={() => handleRefineCard(idx, card)}
                                    disabled={isCardRefining === idx || editingCardIndex === idx}
                                    className="px-3 py-1.5 text-xs font-medium text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center gap-1 transition-colors disabled:opacity-50"
                                >
                                    {isCardRefining === idx ? <RefreshCw className="animate-spin" size={12}/> : <Wand2 size={12}/>} AI 더 다듬기
                                </button>
                                <button 
                                    onClick={() => {
                                        if(!selectedProjectId) {
                                            setCreateProjectDialog(true);
                                        } else {
                                            handleSaveToLibrary(card, selectedProjectId);
                                            alert("보관함에 저장되었습니다.");
                                        }
                                    }}
                                    className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg flex items-center gap-1 transition-colors shadow-lg"
                                >
                                    <Save size={12}/> 보관함 저장
                                </button>
                             </div>
                          </div>
                       ))
                   )}
                </div>
             )}
          </div>
        </div>
      </div>
      
      <InputDialog 
        isOpen={createProjectDialog}
        title="새 프로젝트(폴더) 생성"
        placeholder="시놉시스를 저장할 프로젝트 이름"
        onConfirm={handleCreateAndSaveAll}
        onClose={() => setCreateProjectDialog(false)}
        confirmText="생성 및 전체 저장"
      />
    </div>
  );
};

export default SynopsisRefiner;
