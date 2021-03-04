import axios from 'axios';
import { apiUrl } from '@/env';
import { authHeaders } from '@/utils';
import { IMsg, ISubmission, ISubmissionArchive, ISubmissionCreate, ISubmissionUpdate, ISubmissionUpvotes } from '@/interfaces';

export const apiSubmission = {
    async postSubmission(token: string, data: ISubmissionCreate) {
        return axios.post<ISubmission>(`${apiUrl}/api/v1/submissions/`,
            data, authHeaders(token));
    },
    async getForUser(token: string) {
        return axios.get<ISubmission[]>(`${apiUrl}/api/v1/submissions/`, authHeaders(token));
    },
    async getSubmission(token: string, uuid: string) {
        return axios.get<ISubmission>(`${apiUrl}/api/v1/submissions/${uuid}`, authHeaders(token));
    },
    async bumpViewsCounter(token: string, uuid: string) {
        return axios.post<IMsg>(`${apiUrl}/api/v1/submissions/${uuid}/views/`, null, authHeaders(token));
    },
    async updateSubmission(token: string, uuid: string, payload: ISubmissionUpdate) {
        return axios.put<ISubmission>(`${apiUrl}/api/v1/submissions/${uuid}`, payload, authHeaders(token));
    },
    async upvoteSubmission(token: string, uuid: string) {
        return axios.post<ISubmissionUpvotes>(
            `${apiUrl}/api/v1/submissions/${uuid}/upvotes/`, null, authHeaders(token));
    },
    async cancelUpvoteSubmission(token: string, uuid: string) {
        return axios.delete<ISubmissionUpvotes>(`${apiUrl}/api/v1/submissions/${uuid}/upvotes/`, authHeaders(token));
    },
    async getSubmissionArchives(token: string, uuid: string) {
        return axios.get<ISubmissionArchive[]>(`${apiUrl}/api/v1/submissions/${uuid}/archives/`, authHeaders(token));
    },
    async hideSubmission(token: string, uuid: string) {
        return axios.put<ISubmission>(
          `${apiUrl}/api/v1/submissions/${uuid}/hide`, null, authHeaders(token));
    },
};
