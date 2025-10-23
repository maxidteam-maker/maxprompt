export type AppTab = 'studio' | 'studioPlus' | 'generate' | 'video' | 'analyze';

export interface UploadedFile {
  file: File;
  base64: string;
  mimeType: string;
}

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';