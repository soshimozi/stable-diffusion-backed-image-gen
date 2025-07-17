import type { ImageSettings } from "./Settings";

export interface ThumbnailData {
  url: string;
  prompt: string;
  model: string;
  loading: boolean;
  settings?: ImageSettings;
  hasError: boolean;
}