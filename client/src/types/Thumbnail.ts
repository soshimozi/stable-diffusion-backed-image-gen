import type { ImageSettings } from "./Settings";

export interface Thumbnail {
  url: string;
  prompt: string;
  model: string;
  loading: boolean;
  settings: ImageSettings;
  hasError: boolean;
}