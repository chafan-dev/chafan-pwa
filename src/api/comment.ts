import { http } from '@/api/client';
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
    return http.post<IComment>(`/comments/`, payload, authHeaders(token));
  },
  async updateComment(token: string, commentUUID: string, payload: ICommentUpdate) {
    return http.put<IComment>(`/comments/${commentUUID}`, payload, authHeaders(token));
  },
  async getUpvotes(token: string, uuid: string) {
    return http.get<ICommentUpvotes>(`/comments/${uuid}/upvotes/`, authHeaders(token));
  },
  async deleteComment(token: string, commentUUID: string) {
    return http.delete<IGenericResponse>(`/comments/${commentUUID}`, authHeaders(token));
  },
  async upvote(token: string, uuid: string) {
    return http.post<ICommentUpvotes>(
      `/comments/${uuid}/upvotes/`,
      null,
      authHeaders(token)
    );
  },
  async cancelUpvote(token: string, uuid: string) {
    return http.delete<ICommentUpvotes>(`/comments/${uuid}/upvotes/`, authHeaders(token));
  },
};
