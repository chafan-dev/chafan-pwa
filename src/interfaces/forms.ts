import type { IUserPreview } from './user';

export interface ITextField {
  field_type_name: 'text_field';
  desc: string;
}

export interface ISingleChoiceField {
  field_type_name: 'single_choice_field';
  desc: string;
  choices: string[];
}

export interface IMultipleChoicesField {
  field_type_name: 'multiple_choices_field';
  desc: string;
  choices: string[];
}

export interface IFormField {
  unique_name: string;
  field_type: ITextField | ISingleChoiceField | IMultipleChoicesField;
}

export interface IFormCreate {
  title: string;
  form_fields: IFormField[];
}

export interface IForm {
  author: IUserPreview;
  title: string;
  uuid: string;
  form_fields: IFormField[];
  created_at: string;
  updated_at: string;
}

export interface ITextResponseField {
  field_type_name: 'text_response_field';
  desc: string;
  text: string;
}

export interface ISingleChoiceResponseField {
  field_type_name: 'single_choice_response_field';
  desc: string;
  selected_choice: string;
}

export interface IMutipleChoicesResponseField {
  field_type_name: 'multiple_choices_response_field';
  desc: string;
  selected_choices: string[];
}

export interface IFormResponseField {
  unique_name: string;
  field_content: ITextResponseField | ISingleChoiceResponseField | IMutipleChoicesResponseField;
}

export interface IFormResponseCreate {
  form_uuid: string;
  response_fields: IFormResponseField[];
}

export interface IFormResponse {
  response_author: IUserPreview;
  form: IForm;
  id: number;
  response_fields: IFormResponseField[];
  created_at: string;
}

export interface IScores {
  full_score: number;
  score: number;
}

export interface IClaimWelcomeTestScoreMsg {
  success: boolean;
  scores: IScores;
}

