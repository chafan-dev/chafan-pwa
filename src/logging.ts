import { env } from './env';

export default {
  info: (message: string) => {
    if (env !== 'production') {
      console.log(message);
    }
  },
  error: (message: string) => {
    if (env !== 'production') {
      console.error(message);
    }
  },
};

export const warn = (message: string) => {
    if (env !== 'production') {
      console.warn(message);
    }
};

export const info = (message: string) => {
    if (env !== 'production') {
      console.log(message);
    }
};

