import axios from 'axios';
import { apiUrl } from '@/env';
import { authHeaders } from '@/utils';
import {
  IComment,
  ICommentCreate,
  ICommentUpdate,
  ICommentUpvotes,
  IGenericResponse,
} from '@/interfaces';

export const apiComment = {
  async postComment(token: string, payload: ICommentCreate) {
    return axios.post<IComment>(`${apiUrl}/comments/`, payload, authHeaders(token));
  },
  async updateComment(token: string, commentUUID: string, payload: ICommentUpdate) {
    return axios.put<IComment>(`${apiUrl}/comments/${commentUUID}`, payload, authHeaders(token));
  },
  async getUpvotes(token: string, uuid: string) {
    return axios.get<ICommentUpvotes>(`${apiUrl}/comments/${uuid}/upvotes/`, authHeaders(token));
  },
  async deleteComment(token: string, commentUUID: string) {
    return axios.delete<IGenericResponse>(`${apiUrl}/comments/${commentUUID}`, authHeaders(token));
  },
  async upvote(token: string, uuid: string) {
    return axios.post<ICommentUpvotes>(
      `${apiUrl}/comments/${uuid}/upvotes/`,
      null,
      authHeaders(token)
    );
  },
  async cancelUpvote(token: string, uuid: string) {
    return axios.delete<ICommentUpvotes>(`${apiUrl}/comments/${uuid}/upvotes/`, authHeaders(token));
  },
};
