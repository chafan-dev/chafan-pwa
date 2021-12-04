import { AxiosError } from 'axios';
import { dispatchCaptureApiErrorWithErrorHandler } from '@/store/main/actions';
import { CVue } from '@/common';
import axios from 'axios';
import { authHeaders } from '@/utils';

export class APIWrapper {
  private ctx: CVue;
  constructor(ctx: CVue) {
    this.ctx = ctx;
  }
  async get<T>(url: string, cb: (T) => void) {
    await dispatchCaptureApiErrorWithErrorHandler(this.ctx.$store, {
      action: async () => {
        const ret = await axios.get<T>(url, authHeaders(this.ctx.token));
        cb(ret.data);
      },
      errorFilter: (err: AxiosError) => {
        return this.ctx.commitErrMsg(err) !== null;
      },
    });
  }
}
