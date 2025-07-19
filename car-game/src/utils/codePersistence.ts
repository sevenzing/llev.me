import { DEFAULT_EDITOR_CONTENT_VERSION } from "../constants/gameConstants";
import * as defaultCode from "../constants/defaultCode.ts?raw";
import * as superAICode from "../constants/superAICode.ts?raw";

const STORAGE_KEYS = {
  USER_CODE: "car-game-user-code",
  CODE_VERSION: "car-game-code-version",
  IS_INITIAL: "car-game-is-initial",
} as const;

export interface CodePersistenceData {
  code: string;
  version: string;
  isInitial: boolean;
}

export function saveUserCode({code, version, isInitial}: Partial<CodePersistenceData>): void {
  try {
    if (code !== undefined) {
      localStorage.setItem(STORAGE_KEYS.USER_CODE, code);
    }
    if (version !== undefined) {
      localStorage.setItem(STORAGE_KEYS.CODE_VERSION, version);
    }
    if (isInitial !== undefined) {
      localStorage.setItem(STORAGE_KEYS.IS_INITIAL, isInitial.toString());
    }
  } catch (error) {
    console.warn("Failed to save user code to localStorage:", error);
  }
}

export function loadUserCode(): CodePersistenceData | null {
  try {
    const savedCode = localStorage.getItem(STORAGE_KEYS.USER_CODE);
    const savedVersion = localStorage.getItem(STORAGE_KEYS.CODE_VERSION);
    const savedIsInitial = localStorage.getItem(STORAGE_KEYS.IS_INITIAL);

    if (!savedCode) {
      return null;
    }

    return {
      code: savedCode,
      version: savedVersion || "0.0.0",
      isInitial: savedIsInitial === "true",
    };
  } catch (error) {
    console.warn("Failed to load user code from localStorage:", error);
    return null;
  }
}

export function shouldUpdateToNewVersion(savedVersion: string): boolean {
  if (!savedVersion) return true;
  
  const currentVersion = DEFAULT_EDITOR_CONTENT_VERSION;
  const savedParts = savedVersion.split('.').map(Number);
  const currentParts = currentVersion.split('.').map(Number);
  
  // Simple version comparison
  for (let i = 0; i < Math.max(savedParts.length, currentParts.length); i++) {
    const saved = savedParts[i] || 0;
    const current = currentParts[i] || 0;
    if (current > saved) return true;
    if (current < saved) return false;
  }
  
  return false;
}

export function clearUserCode(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.USER_CODE);
    localStorage.removeItem(STORAGE_KEYS.CODE_VERSION);
    localStorage.removeItem(STORAGE_KEYS.IS_INITIAL);
  } catch (error) {
    console.warn("Failed to clear user code from localStorage:", error);
  }
}

export function getInitialCode(): string {
  return defaultCode.default;
} 

export function getSuperAICode(): string {
  return superAICode.default;
}
