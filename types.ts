export enum AppMode {
  CHAT = 'CHAT',
  IMAGE_STUDIO = 'IMAGE_STUDIO',
  VIDEO_STUDIO = 'VIDEO_STUDIO',
  DEVICE_CONTROL = 'DEVICE_CONTROL'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  image?: string; // base64
  isThinking?: boolean;
}

export interface Device {
  id: string;
  name: string;
  type: 'light' | 'thermostat' | 'lock' | 'computer';
  status: 'on' | 'off' | 'locked' | 'unlocked';
  value?: number | string; // e.g., temperature or brightness
  location: string;
}

export interface GeneratedImage {
  url: string;
  prompt: string;
}

export interface GeneratedVideo {
  uri: string;
  prompt: string;
}

// Extend Window interface for AI Studio helpers
declare global {
  // Augment the AIStudio interface to ensure it includes the required methods.
  // The 'aistudio' property on Window is already defined with type 'AIStudio' in the environment.
  interface AIStudio {
    hasSelectedApiKey(): Promise<boolean>;
    openSelectKey(): Promise<void>;
  }
}