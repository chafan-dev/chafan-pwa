import type { IAnsweredQuestionCondition } from './answer';
import type { SiteModeratorBroadcastTaskDefinition } from './site';
import type { IUserPreview } from './user';

export type ITaskDefinition = SiteModeratorBroadcastTaskDefinition;

export interface ITask {
  id: number;
  created_at: string;
  task_definition: ITaskDefinition;
  pending: 'pending' | 'finished' | 'failed';
  initiator: IUserPreview;
}

export interface IRewardCondition {
  content: IAnsweredQuestionCondition;
}

export interface IRewardCreate {
  expired_after_days: number;
  receiver_uuid: string;
  coin_amount: number;
  note_to_receiver?: string;
  condition?: IRewardCondition;
}

export interface IReward {
  id: number;
  created_at: string;
  expired_at: string;
  claimed_at?: string;
  refunded_at?: string;
  coin_amount: number;
  note_to_receiver?: string;
  giver: IUserPreview;
  receiver: IUserPreview;
  condition?: IRewardCondition;
}

