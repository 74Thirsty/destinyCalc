// ...existing code...
export type BirthInput = {
  date: string;
  time?: string;
  location?: string;
  name?: string;
};

export type TraitScores = Record<string, number>;

export type EngineResult = {
  westernSign: string;
  chineseAnimal: string;
  chineseElement: string;
  numerologyLifePath: number;
  traits: TraitScores;
  topTraits: Array<{ trait: string; score: number }>;
  lowTraits: Array<{ trait: string; score: number }>;
  summary: string;
};

export type DestinyReadingInput = {
  name: string;
  profile: EngineResult;
};

export type DestinyReadingSection = {
  title: string;
  body: string;
  content?: string;
};

export type PuterChatResponse = {
  message?: {
    content?: string;
  };
};

export type PuterClient = {
  ai: {
    chat: (
      prompt: string,
      options?: {
        model?: string;
        temperature?: number;
        max_tokens?: number;
        stream?: boolean;
      }
    ) => Promise<PuterChatResponse>;
  };
};

declare global {
  interface Window {
    puter?: Partial<PuterClient>;
  }

  var puter: Partial<PuterClient> | undefined;
}

export {};
