import type { ISite } from './site';
import type { IUserPreview } from './user';

export interface IApplication {
  id: number;
  created_at: string;
  applicant: IUserPreview;
  applied_site: ISite;
  pending: boolean;
}

export interface IInvitationLinkCreate {
  invited_to_site_uuid?: string;
}

export interface IInvitationLink {
  uuid: string;
  created_at: string;
  expired_at: string;
  invited_to_site?: ISite;
  inviter: IUserPreview;
  remaining_quota: number;
  valid: boolean;
}

