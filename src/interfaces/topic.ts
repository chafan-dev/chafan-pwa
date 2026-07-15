export interface ITopic {
  uuid: string;
  name: string;
  description?: string;
  parent_topic_uuid?: string;
}

export interface ITopicCreate {
  name: string;
}

export interface ITopicUpdate {
  description?: string;
  parent_topic_uuid?: string;
}

