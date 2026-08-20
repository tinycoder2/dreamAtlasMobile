export type Mood = 'great' | 'good' | 'neutral' | 'bad' | 'nightmare';
export type DreamType = 'normal' | 'lucid' | 'nightmare' | 'recurring' | 'vivid';

export interface Dream {
  id: number;
  date: string; // 'YYYY-MM-DD' — multiple dreams may share a date
  text: string;
  mood: Mood | null;
  dreamType: DreamType | null;
  tags: string[];
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type DreamDraft = Omit<Dream, 'id' | 'sortOrder' | 'createdAt' | 'updatedAt'>;
