import axios from 'axios';
import { apiUrl } from '@/env';
import { authHeaders } from '@/utils';
import { IQuestionPreview, ITopic, ITopicCreate, ITopicUpdate } from '@/interfaces';

export const apiTopic = {
  async createTopic(token: string, payload: ITopicCreate) {
    return axios.post<ITopic>(`${apiUrl}/topics/`, payload, authHeaders(token));
  },
  async getTopic(topicUUID: string) {
    return axios.get<ITopic>(`${apiUrl}/topics/${topicUUID}`);
  },
  async updateTopic(token: string, topicUUID: string, payload: ITopicUpdate) {
    return axios.put<ITopic>(`${apiUrl}/topics/${topicUUID}`, payload, authHeaders(token));
  },
  async getQuestionsOfTopic(token: string, topicUUID: string) {
    return axios.get<IQuestionPreview[]>(
      `${apiUrl}/topics/${topicUUID}/questions/`,
      authHeaders(token)
    );
  },
};
