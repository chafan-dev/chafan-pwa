import type { ISiteCreate } from './site';
import type { IFeedback, IUserPreview } from './user';

export interface IChannel {
  id: number;
  name: string;
  is_private: boolean;
  private_with_user: IUserPreview;
  admin: IUserPreview;
  feedback_subject?: IFeedback;
  site_creation_subject?: ISiteCreate;
}

export interface IChannelCreate {
  private_with_user_uuid: string;
}

export interface IMessage {
  id: number;
  channel_id: number;
  body: string;
  author: IUserPreview;
  created_at: string;
  updated_at: string;
}

export interface IMessageCreate {
  channel_id: number;
  body: string;
}

