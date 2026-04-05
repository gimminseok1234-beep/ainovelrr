

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export enum POV {
  FirstPerson = "1인칭 주인공 시점 (I did...)",
  ThirdPersonLimited = "3인칭 관찰자 시점 (He/She did...)",
  ThirdPersonOmniscient = "3인칭 전지적 작가 시점 (God view)",
}

export enum AiModel {
  Gemini31Pro = "gemini-3.1-pro-preview",
  Gemini3Flash = "gemini-3-flash-preview",
  Gemini31FlashLite = "gemini-3.1-flash-lite-preview",
}

export type ViewMode = 'HOME' | 'WRITER' | 'AI_WRITER';

export interface EditorPreferences {
  editorWidth: number; // px (300 - 900)
  paragraphSpacing: number; // em (0 - 2)
  colorSeparation: boolean; // Paper mode vs Fullscreen
  fontSize: number; // px
}

export interface AiPreset {
  id: string;
  label: string;
  prompt: string;
}

// New Interface for Refined Synopsis Cards
export interface RefinedSynopsisCard {
  chapter: number;
  title: string;
  summary: string;
  instructions?: string; // Optional now as it might be merged
}

export interface NovelSettings {
  synopsis: string;
  previousStoryContent: string;
  pov: string;
  targetLength: number;
  referenceText: string;
  styleDescription: string;
  guidelines: string;
  activeStyleId?: string;
  hashtags?: string[];
  creativityLevel?: number; // 1-10
  model?: AiModel;
  
  // AI Presets
  aiPresets?: AiPreset[];
}

export interface Project {
  id: string;
  name: string;
  createdAt: number;
  worldview: string; // JSON string of WorldItem[]
  characters: string; // JSON string of CharacterProfile[]
  settings: NovelSettings;
  isLocked?: boolean;
  pin?: string; // Simple PIN hash
  deletedAt?: number; // For soft delete
  
  // Context Memory
  contextAnalysis?: string; // Summarized context of previous stories
  contextReferences?: string[]; // List of story IDs/Titles used for analysis
  contextSnapshot?: {
      totalStories: number;
      lastStoryUpdate: number;
      projectUpdate: number;
  };
}

export interface SavedStory {
  id: string;
  projectId: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  settings: NovelSettings;
  category?: 'manuscript' | 'synopsis';
  deletedAt?: number; // For soft delete
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  createdAt: number;
  metadata?: any;
}

export interface MindMapNode {
  label: string;
  type: 'root' | 'category' | 'detail';
  description?: string;
  children?: MindMapNode[];
}

export interface CharacterRelationship {
  source: string;
  target: string;
  type: 'positive' | 'negative' | 'romantic' | 'family' | 'complex';
  description: string;
}

export interface CharacterProfile {
  id?: string; // Optional for backward compatibility, required for folders
  type?: 'folder' | 'character'; // Optional, defaults to character
  parentId?: string | null; // Optional, defaults to root
  name: string;
  role: string;
  specs: string;
  personality: string;
  appearance: string;
  backstory: string;
  hashtags: string[];
  imageUrl?: string;
}

export interface WorldItem {
  id: string;
  type: 'folder' | 'note';
  title: string;
  content: string; // For folders, this might be empty or description
  parentId: string | null; // null for root
  createdAt: number;
}

// Default Presets Constant moved to prompts.ts, but defining structure here
export const DEFAULT_EDITOR_PREFS: EditorPreferences = {
  editorWidth: 600,
  paragraphSpacing: 1.8,
  colorSeparation: true,
  fontSize: 16
};

// We will import DEFAULT_AI_PRESETS in services/prompts.ts to avoid circular deps if needed, 
// but for types.ts, we just define the interface. 
// However, DEFAULT_SETTINGS needs a value. We will inject it in App.tsx or separate file.
// For now, let's keep DEFAULT_SETTINGS simple.

export const DEFAULT_SETTINGS: NovelSettings = {
  synopsis: "",
  previousStoryContent: "",
  pov: POV.ThirdPersonLimited,
  targetLength: 3000,
  referenceText: "",
  styleDescription: "",
  guidelines: "",
  hashtags: [],
  creativityLevel: 7,
  model: AiModel.Gemini31Pro,
  aiPresets: [] // Will be populated with defaults on init
};