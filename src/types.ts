export type DestinyReadingSection = {
  title: string;
  content: string;
  body?: string;
};
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
