import { http } from '@/api/client';
import {
  IClaimWelcomeTestScoreMsg,
  ICoinPayment,
  IReward,
  IRewardCreate,
} from '@/interfaces';
import { authHeaders } from '@/utils';

export const apiRewards = {
  async getCoinPayments(token: string) {
    return http.get<ICoinPayment[]>(`/coin-payments/`, authHeaders(token));
  },

  async createReward(token: string, data: IRewardCreate) {
    return http.post<IReward>(`/rewards/`, data, authHeaders(token));
  },

  async claimReward(token: string, rewardId: number) {
    return http.post<IReward>(`/rewards/${rewardId}/claim`, null, authHeaders(token));
  },

  async refundReward(token: string, rewardId: number) {
    return http.post<IReward>(`/rewards/${rewardId}/refund`, null, authHeaders(token));
  },

  async getRewards(token: string) {
    return http.get<IReward[]>(`/rewards/`, authHeaders(token));
  },

  async checkWelcomeTestScoreAndClaimRewards(token: string, formResponseId: number) {
    return http.post<IClaimWelcomeTestScoreMsg>(
      `/claim-welcome-test-rewards/${formResponseId}`,
      null,
      authHeaders(token)
    );
  },
};
