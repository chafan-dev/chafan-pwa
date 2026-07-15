export type editor_T =
  | 'tiptap'
  | 'wysiwyg'
  | 'markdown'
  | 'markdown_splitview'
  | 'markdown_realtime_rendering';

export interface IRichText {
  source: string;
  rendered_text?: string;
  editor: editor_T;
}

export interface INewCommentInternal {
  body: string;
  body_text?: string;
  editor: editor_T;
  mentioned: string[];
}

export interface IRichEditorState {
  title?: string; // for article
  body: string | null;
  rendered_body_text: string | null;
  visibility: 'anyone' | 'registered';
  is_draft: boolean;
  editor: editor_T;
}

export interface IGenericResponse {
  success: boolean;
}

export interface IUploadedImage {
  url: string;
}

export interface IWsAuthResponse {
  token: string;
}

export interface ITopBanner {
  enabled: boolean;
  color: string;
  textColor?: string;
  text: string;
}

export interface IVerificationCodeRequest {
  email?: string;
}

export type ThemeType = 'default' | 'blue';

export interface IDynoState {
  state: 'up' | 'crashed' | 'down' | 'idle' | 'starting';
}

