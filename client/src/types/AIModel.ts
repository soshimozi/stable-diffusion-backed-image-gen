export interface AIModel  {
  id: number;
  model_id: string;
  image_data: string;
  name: string;
  description: string;
  trigger_word: string;
  available: boolean;
  tags: string[];
  negative_available: boolean;
  resize_available: boolean;
  steps_available: boolean;
  guidance_available: boolean;
  model_url: string;
};
