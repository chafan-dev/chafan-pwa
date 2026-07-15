import type { IUserPreview } from './user';

export interface IAuditLog {
  uuid: string;
  created_at: string;
  api: string;
  user: IUserPreview;
}

