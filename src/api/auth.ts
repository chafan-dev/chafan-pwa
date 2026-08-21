import { http } from '@/api/client';
import { IGenericResponse, IUserProfile, IVerificationCodeRequest, IWsAuthResponse } from '@/interfaces';
import { authHeaders } from '@/utils';

export const apiAuth = {
  async logInGetToken(username: string, password: string, hcaptcha_token?: string) {
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);
    if (hcaptcha_token) {
      params.append('hcaptcha_token', hcaptcha_token);
    }
    return http.post(`/login/access-token`, params);
  },

  async logInInvitedGetToken(inviteToken: string) {
    return http.post(`/login/access-token-for-invited`, {
      invite_token: inviteToken,
    });
  },

  async passwordRecovery(email: string) {
    return http.post(`/password-recovery/${email}`);
  },

  async resetPassword(password: string, token: string) {
    return http.post(`/reset-password/`, {
      new_password: password,
      token,
    });
  },

  async sendVerificationCode(payload: IVerificationCodeRequest) {
    return http.post<IGenericResponse>(`/send-verification-code`, payload);
  },

  async openAccount(
    email: string,
    handle: string,
    code: string,
    password: string,
    invitation_link_uuid: string
  ) {
    return http.post<IUserProfile>(`/open-account`, {
      email,
      handle,
      password,
      code,
      invitation_link_uuid,
    });
  },

  async checkTokenValidity(token: string) {
    return http.post<IGenericResponse>(`/check-token-validity/`, `token=${token}`);
  },

  async getWsToken(token: string) {
    return http.post<IWsAuthResponse>(`/ws/token`, null, authHeaders(token));
  },
};
