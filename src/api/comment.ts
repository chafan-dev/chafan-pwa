import axios from 'axios';
import { apiUrl } from '@/env';
import { authHeaders } from '@/utils';
import { IComment, ICommentCreate, ICommentUpdate, ICommentUpvotes, IMsg } from '@/interfaces';

export const apiComment = {
  async postComment(token: string, payload: ICommentCreate) {
    return axios.post<IComment>(`${apiUrl}/api/v1/comments/`, payload, authHeaders(token));
  },
  async updateComment(token: string, commentUUID: string, payload: ICommentUpdate) {
    return axios.put<IComment>(`${apiUrl}/api/v1/comments/${commentUUID}`, payload, authHeaders(token));
  },
  async deleteComment(token: string, commentUUID: string) {
    return axios.delete<IMsg>(`${apiUrl}/api/v1/comments/${commentUUID}`, authHeaders(token));
  },
  async upvote(token: string, uuid: string) {
    return axios.post<ICommentUpvotes>(
      `${apiUrl}/api/v1/comments/${uuid}/upvotes/`, null, authHeaders(token));
  },
  async cancelUpvote(token: string, uuid: string) {
    return axios.delete<ICommentUpvotes>(`${apiUrl}/api/v1/comments/${uuid}/upvotes/`, authHeaders(token));
  },
};
