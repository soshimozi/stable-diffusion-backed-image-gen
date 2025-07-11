export interface AIModel  {
  id: string;
  image_data: string;
  name: string;
  description: string;
  trigger_word: string;
  available: boolean;
  tags: string[];
};
