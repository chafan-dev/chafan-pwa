export interface INotification {
  id: number;
  created_at: string;
  body: string;
  event?: Event;
  is_read: boolean;
}

export interface INotificationUpdate {
  is_read: boolean;
}

export interface IWsUserMsg {
  type: 'notification';
  data: INotification;
}

