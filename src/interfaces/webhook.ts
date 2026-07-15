import type { ISite } from './site';

export interface IWebhookSiteEvent {
  event_type: 'site_event';
  new_question?: boolean;
  new_answer?: boolean;
  new_submission?: boolean;
}

export interface IWebhookEventSpec {
  content: IWebhookSiteEvent;
}

export interface IWebhookCreate {
  site_uuid: string;
  event_spec: IWebhookEventSpec;
  secret: string;
  callback_url: string;
}

export interface IWebhookUpdate {
  enabled?: boolean;
  event_spec?: IWebhookEventSpec;
  secret?: string;
  callback_url?: string;
}

export interface IWebhook {
  id: number;
  updated_at: string;
  enabled: boolean;
  event_spec: IWebhookEventSpec;
  secret: string;
  callback_url: string;
  site: ISite;
}

