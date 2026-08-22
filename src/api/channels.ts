import { http } from '@/api/client';
import { IChannel, IChannelCreate, IMessage, IMessageCreate, IUserPreview } from '@/interfaces';
import { authHeaders } from '@/utils';

export const apiChannels = {
  async createChannel(token: string, payload: IChannelCreate) {
    return http.post<IChannel>(`/channels/`, payload, authHeaders(token));
  },

  async getChannel(token: string, channelId: number) {
    return http.get<IChannel>(`/channels/${channelId}`, authHeaders(token));
  },

  async getChannelMessages(token: string, channelId: number) {
    return http.get<IMessage[]>(`/channels/${channelId}/messages/`, authHeaders(token));
  },

  async createMessage(token: string, payload: IMessageCreate) {
    return http.post<IMessage>(`/messages/`, payload, authHeaders(token));
  },

  async addUserToChannel(token: string, channelId: number, handle: string) {
    return http.put<IUserPreview>(
      `/channels/${channelId}`,
      { handle },
      authHeaders(token)
    );
  },
};
