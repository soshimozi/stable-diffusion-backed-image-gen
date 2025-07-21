import type { ImageSettings } from "./Settings";

export interface ThumbnailData {
  url: string;
  prompt: string;
  model: number;
  loading: boolean;
  settings?: ImageSettings;
  hasError: boolean;
}