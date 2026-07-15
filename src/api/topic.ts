import { http } from '@/api/client';
import { authHeaders } from '@/utils';
import { IQuestionPreview, ITopic, ITopicCreate, ITopicUpdate } from '@/interfaces';

export const apiTopic = {
  async createTopic(token: string, payload: ITopicCreate) {
    return http.post<ITopic>(`/topics/`, payload, authHeaders(token));
  },
  async getTopic(topicUUID: string) {
    return http.get<ITopic>(`/topics/${topicUUID}`);
  },
  async updateTopic(token: string, topicUUID: string, payload: ITopicUpdate) {
    return http.put<ITopic>(`/topics/${topicUUID}`, payload, authHeaders(token));
  },
  async getQuestionsOfTopic(token: string, topicUUID: string) {
    return http.get<IQuestionPreview[]>(
      `/topics/${topicUUID}/questions/`,
      authHeaders(token)
    );
  },
};
