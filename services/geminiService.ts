import { GoogleGenAI } from "@google/genai";
import { NovelSettings, Project, SavedStory, RefinedSynopsisCard, CharacterProfile } from "../types.ts";
import { 
    AI_PROMPTS, 
    getGeneralSynopsisPrompt, 
    getReferenceAnalysisPrompt,
    getRawStoryIdeaAnalysisPrompt,
    getManuscriptAnalysisPrompt,
    getProjectContextAnalysisPrompt,
    GENERAL_SYSTEM_PROMPT,
    getNovelContextPrompt,
    getContinueStoryPrompt,
    getRefineTextPrompt,
    getStreamingSynopsisPrompt
} from "./prompts.ts";

export { AI_PROMPTS };

let lastErrorTime = 0;
export const handleApiError = (e: any) => {
    const msg = e?.message || String(e);
    const now = Date.now();
    
    if (now - lastErrorTime < 5000) return; // Prevent spam
    lastErrorTime = now;

    if (msg.includes('leaked') || msg.includes('Leaked')) {
        alert(`[보안 경고] API 키가 유출된 것으로 보고되었습니다.\n\n해당 API 키는 구글에 의해 비활성화되었습니다. 다음 단계를 따라주세요:\n1. Google AI Studio(aistudio.google.com)에서 새로운 API 키를 생성하세요.\n2. 앱 설정 메뉴에서 새로운 API 키로 업데이트하세요.\n3. 기존 유출된 키는 삭제하거나 비활성화하세요.`);
        return;
    }

    if (msg.includes('403') || msg.includes('PERMISSION_DENIED') || msg.includes('forbidden') || msg.includes('Forbidden')) {
        alert(`API 접근 권한 오류(403 Forbidden)가 발생했습니다.\n\n[해결 방법]\n1. API 키에 '웹사이트 제한(HTTP 리퍼러)'이 설정되어 있다면 제한을 해제해주세요. (미리보기 환경에서는 제한이 있으면 작동하지 않습니다.)\n2. Google Cloud Console에서 'Generative Language API'가 사용 설정되어 있는지 확인하세요.\n3. 올바른 API 키를 입력했는지 다시 한번 확인해주세요.\n\n상세 오류: ${msg}`);
        return;
    }

    console.error("API Error:", msg);
};

const cleanJson = (text: string): string => {
  if (!text) return "";
  const firstOpen = text.search(/[\{\[]/);
  if (firstOpen !== -1) {
    const lastClose = Math.max(text.lastIndexOf('}'), text.lastIndexOf(']'));
    if (lastClose !== -1 && lastClose > firstOpen) {
      const candidate = text.substring(firstOpen, lastClose + 1);
      if (candidate.startsWith('{') && candidate.endsWith('}') || 
          candidate.startsWith('[') && candidate.endsWith(']')) {
        return candidate;
      }
    }
  }
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) cleaned = cleaned.substring(7);
  else if (cleaned.startsWith('```')) cleaned = cleaned.substring(3);
  if (cleaned.endsWith('```')) cleaned = cleaned.substring(0, cleaned.length - 3);
  return cleaned.trim();
};

const parseWorldviewContext = (worldviewRaw: string): string => {
  if (!worldviewRaw) return "";
  try {
    const items = JSON.parse(worldviewRaw);
    if (Array.isArray(items)) {
      return items.map((item: any) => {
        if (item.type === 'folder') return `[Category/Folder: ${item.title}]`;
        else return `[Setting Note: ${item.title}]\n${item.content}`;
      }).join("\n\n");
    }
  } catch (e) { return worldviewRaw; }
  return worldviewRaw;
};

const getApiKey = () => {
    let key = "";

    // 1. Vite 환경 변수 (퍼블리싱/배포 환경에서 VITE_GEMINI_API_KEY를 우선적으로 불러옵니다)
    try {
        // Vite는 빌드 시 이 구문을 실제 값으로 치환합니다.
        key = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY;
        if (key && key !== "undefined" && key !== "null" && key.length > 5) {
            return key;
        }
    } catch (e) {
        // 무시
    }

    // 2. Node.js / AI Studio 환경 변수 (process.env)
    try {
        // @ts-ignore
        key = process.env.GEMINI_API_KEY || process.env.API_KEY;
        if (key && key !== "undefined" && key !== "null" && key.length > 5) {
            return key;
        }
    } catch (e) {
        // 무시
    }

    // 3. 전역 변수 (window.GEMINI_API_KEY 등)
    const g = globalThis as any;
    key = g.GEMINI_API_KEY || g.API_KEY;
    if (key && key !== "undefined" && key !== "null" && key.length > 5) {
        return key;
    }

    return "";
};

// Core Gemini API Caller - Refactored to be clean and use defaults
export const callAI = async (
    messages: { role: string, content: string }[],
    model: string = 'gemini-3.1-pro-preview',
    options: {
        onChunk?: (text: string) => void,
        temperature?: number,
        creativityLevel?: number,
        responseMimeType?: string
    } = {}
): Promise<string> => {
    let key = getApiKey().trim();
    if (key.startsWith('"') && key.endsWith('"')) key = key.slice(1, -1);
    if (key.startsWith("'") && key.endsWith("'")) key = key.slice(1, -1);

    if (!key || key.includes("YOUR_GEMINI_API_KEY") || key.includes("MY_GEMINI_API_KEY")) {
        throw new Error("API 키가 설정되지 않았습니다. 설정 메뉴에서 API 키를 입력해주세요.");
    }

    const ai = new GoogleGenAI({ apiKey: key });
    
    const systemMsg = messages.find(m => m.role === 'system')?.content;
    const userMessages = messages.filter(m => m.role !== 'system');
    const prompt = userMessages.map(m => m.content).join("\n\n");

    // Use completely default settings as requested, only overriding temperature if provided
    const effectiveTemperature = options.temperature !== undefined 
        ? options.temperature 
        : (options.creativityLevel !== undefined ? options.creativityLevel / 10 : undefined);

    const config: any = {};
    
    if (effectiveTemperature !== undefined) {
        config.temperature = effectiveTemperature;
    }
    
    if (options.responseMimeType) {
        config.responseMimeType = options.responseMimeType;
    }

    if (systemMsg) {
        config.systemInstruction = systemMsg;
    }

    try {
        if (options.onChunk) {
            const response = await ai.models.generateContentStream({
                model: model,
                contents: prompt,
                config
            });

            let fullText = "";
            for await (const chunk of response) {
                const text = chunk.text;
                if (text) {
                    fullText += text;
                    options.onChunk(text);
                }
            }
            return fullText;
        } else {
            const response = await ai.models.generateContent({
                model: model,
                contents: prompt,
                config
            });
            return response.text || "";
        }
    } catch (e: any) {
        console.error(`Gemini SDK Error:`, e);
        const errorMsg = e?.message || String(e);
        
        if (errorMsg.includes('403') || errorMsg.includes('Forbidden') || errorMsg.includes('PERMISSION_DENIED')) {
            const customError = new Error(`403 Forbidden: API 키 권한 오류입니다. API 키의 HTTP 리퍼러 제한을 해제하거나, 올바른 키인지 확인해주세요.`);
            handleApiError(customError);
            throw customError;
        }
        
        throw e;
    }
};

// --- Feature Implementations ---

export const refineSynopsisWithContext = async (
  rawSynopsis: string,
  project: Project | null,
  recentStories: SavedStory[],
  preAnalyzedContext?: string,
  styleGuide?: string,
  targetChapterCount: number = 1,
  creativityLevel: number = 7
): Promise<RefinedSynopsisCard[]> => {
  let contextData = "";
  if (project) {
    contextData += `=== PROJECT WORLDVIEW ===\n${parseWorldviewContext(project.worldview)}\n\n=== CHARACTERS ===\n${project.characters}\n`;
  }
  if (preAnalyzedContext) {
      contextData += `=== PROJECT STORY CONTEXT ===\n${preAnalyzedContext}\n`;
  } else if (Array.isArray(recentStories) && recentStories.length > 0) {
      const sortedStories = [...recentStories].sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt)).slice(0, 5).reverse(); 
      contextData += `=== RECENT STORY FLOW ===\n${sortedStories.map((s, i) => `[Ep ${i+1}: ${s.title}]\n${s.content.slice(-2000)}`).join('\n\n')}\n`;
  }

  const structureInstruction = targetChapterCount > 1
    ? `**Structure**: You MUST split the narrative into **EXACTLY ${targetChapterCount}** distinct chapters/sequences. Expand the user's input to fill these chapters if necessary.`
    : `**Structure**: Check for user-defined chapter markers (e.g., "Chapter 1", "1화"). If the user did NOT explicitly mark chapters, you MUST return **EXACTLY ONE** chapter containing the entire story. Do NOT split it into multiple chapters arbitrarily.`;

  const prompt = getGeneralSynopsisPrompt(rawSynopsis, contextData, structureInstruction, styleGuide);

  try {
    const result = await callAI(
        [{ role: 'user', content: prompt }],
        'gemini-3.1-pro-preview',
        { responseMimeType: 'application/json', creativityLevel }
    );
    return JSON.parse(cleanJson(result)) as RefinedSynopsisCard[];
  } catch (e) { 
    handleApiError(e); 
    console.error("Synopsis refinement failed", e);
    return [];
  }
};

export const refineSynopsisStream = async (
  rawSynopsis: string,
  project: Project | null,
  recentStories: SavedStory[],
  onChunk: (text: string) => void,
  preAnalyzedContext?: string,
  styleGuide?: string,
  targetChapterCount: number = 1,
  creativityLevel: number = 7
): Promise<string> => {
  let contextData = "";
  if (project) {
    contextData += `=== PROJECT WORLDVIEW ===\n${parseWorldviewContext(project.worldview)}\n\n=== CHARACTERS ===\n${project.characters}\n`;
  }
  if (preAnalyzedContext) {
      contextData += `=== PROJECT STORY CONTEXT ===\n${preAnalyzedContext}\n`;
  } else if (Array.isArray(recentStories) && recentStories.length > 0) {
      const sortedStories = [...recentStories].sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt)).slice(0, 5).reverse(); 
      contextData += `=== RECENT STORY FLOW ===\n${sortedStories.map((s, i) => `[Ep ${i+1}: ${s.title}]\n${s.content.slice(-2000)}`).join('\n\n')}\n`;
  }

  const structureInstruction = targetChapterCount > 1
    ? `**Structure**: You MUST split the narrative into **EXACTLY ${targetChapterCount}** distinct chapters/sequences. Expand the user's input to fill these chapters if necessary.`
    : `**Structure**: Check for user-defined chapter markers (e.g., "Chapter 1", "1화"). If the user did NOT explicitly mark chapters, you MUST return **EXACTLY ONE** chapter containing the entire story. Do NOT split it into multiple chapters arbitrarily.`;

  const prompt = getStreamingSynopsisPrompt(rawSynopsis, contextData, structureInstruction, styleGuide);

  try {
    return await callAI(
        [{ role: 'user', content: prompt }],
        'gemini-3.1-pro-preview',
        { onChunk, creativityLevel }
    );
  } catch (e) { 
    handleApiError(e); 
    throw e;
  }
};

export const analyzeSynopsisReference = async (text: string): Promise<string> => {
    const prompt = getReferenceAnalysisPrompt(text);
    try {
        return await callAI([{ role: 'user', content: prompt }], 'gemini-3.1-pro-preview');
    } catch (e) {
        handleApiError(e);
        return "";
    }
};

export const generateNovelStep = async (
    currentStep: number, 
    totalSteps: number, 
    settings: NovelSettings, 
    project: Project | null, 
    previousContent: string, 
    structuralGuide?: string, 
    contextAnalysis?: string,
    onChunk?: (text: string) => void, 
    storyAnalysis?: string
): Promise<string> => {
    const promptContext = getNovelContextPrompt(
        project, settings, structuralGuide, contextAnalysis, storyAnalysis, previousContent
    );
    try {
        return await callAI(
            [
                { role: 'system', content: GENERAL_SYSTEM_PROMPT },
                { role: 'user', content: promptContext }
            ],
            'gemini-3.1-pro-preview',
            { onChunk, creativityLevel: settings.creativityLevel || 7 }
        );
    } catch (e: any) {
        handleApiError(e);
        throw e;
    }
};

export const analyzeRawStoryIdea = async (idea: string, chapterCount: number, pov: string): Promise<string> => {
    const prompt = getRawStoryIdeaAnalysisPrompt(idea, chapterCount, pov);
    try {
        return await callAI([{ role: 'user', content: prompt }], 'gemini-3.1-pro-preview', { temperature: 0.8 });
    } catch (e) {
        handleApiError(e);
        throw e;
    }
};

export const continueStoryStream = async (currentContent: string, onChunk: (text: string) => void, temperature: number = 0.7): Promise<string> => {
    const prompt = getContinueStoryPrompt(currentContent);
    try {
        return await callAI([{ role: 'user', content: prompt }], 'gemini-3.1-pro-preview', { onChunk, temperature });
    } catch (e) {
        handleApiError(e);
        throw e;
    }
};

export const refineText = async (text: string, instruction: string, creativityLevel: number = 7): Promise<string> => {
    const prompt = getRefineTextPrompt(text, instruction);
    try {
        return await callAI([{ role: 'user', content: prompt }], 'gemini-3.1-pro-preview', { creativityLevel });
    } catch (e) {
        handleApiError(e);
        return text;
    }
};

export const analyzeManuscript = async (text: string): Promise<{title: string, worldview: {title: string, content: string}[], characters: CharacterProfile[]} | null> => {
    const prompt = getManuscriptAnalysisPrompt(text);
    try {
        const responseText = await callAI([{ role: 'user', content: prompt }], 'gemini-3.1-pro-preview', { responseMimeType: 'application/json' });
        if (responseText) return JSON.parse(cleanJson(responseText));
        return null;
    } catch(e) { 
        handleApiError(e);  
        return null; 
    }
};

const extractChapterNumber = (title: string): number => {
    const match = title.match(/(\d+)/);
    return match ? parseInt(match[0]) : -1;
};

const sortStoriesByChapter = (stories: SavedStory[]) => {
    if (!Array.isArray(stories)) return [];
    return [...stories].sort((a, b) => {
        const titleA = a.title.toLowerCase();
        const titleB = b.title.toLowerCase();
        const isPrologueA = titleA.includes('prologue') || titleA.includes('프롤로그') || titleA.includes('서막');
        const isPrologueB = titleB.includes('prologue') || titleB.includes('프롤로그') || titleB.includes('서막');
        if (isPrologueA && !isPrologueB) return -1;
        if (!isPrologueA && isPrologueB) return 1;
        const isTrailerA = titleA.includes('trailer') || titleA.includes('예고편');
        const isTrailerB = titleB.includes('trailer') || titleB.includes('예고편');
        if (isTrailerA && !isTrailerB) return 1;
        if (!isTrailerA && isTrailerB) return -1;
        const numA = extractChapterNumber(titleA);
        const numB = extractChapterNumber(titleB);
        if (numA !== -1 && numB !== -1) return numA - numB;
        return (a.createdAt || 0) - (b.createdAt || 0);
    });
};

export const analyzeProjectContext = async (stories: SavedStory[]): Promise<{ analysis: string; references: string[] } | null> => {
    if (!Array.isArray(stories) || stories.length === 0) return null;
    const sortedStories = sortStoriesByChapter(stories);
    const recentStories = sortedStories.slice(-3);
    const contextSample = recentStories
        .map((story) => `[Title: ${story.title}]\nContent Segment (End):\n"...${story.content.slice(-2000)}"`)
        .join('\n\n');
    const prompt = getProjectContextAnalysisPrompt(contextSample);

    try {
        const analysisText = await callAI([{ role: 'user', content: prompt }], 'gemini-3-flash-preview');
        return {
            analysis: analysisText,
            references: recentStories.map((story) => story.title)
        };
    } catch (error: any) {
        console.error(`Context analysis failed:`, error);
        handleApiError(error);
        return null;
    }
};

export const parseRawOutline = (text: string): any[] => {
    return [];
};
