import { Node, Command } from '@tiptap/core';

export interface IframeOptions {
  allowFullscreen: boolean;
  HTMLAttributes: {
    [key: string]: any;
  };
}

export interface ISetIframeOptions {
  src: string;
  height?: number;
  width?: number;
}

declare module '@tiptap/core' {
  interface Commands {
    iframe: {
      /**
       * Add an iframe
       */
      setIframe: (options: ISetIframeOptions) => Command;
    };
  }
}

export default Node.create({
  name: 'iframe',

  group: 'block',

  // selectable: false,

  defaultOptions: <IframeOptions>{
    allowFullscreen: true,
    HTMLAttributes: {
      class: 'iframe-wrapper',
    },
  },

  addAttributes() {
    return {
      src: {
        default: null,
      },
      height: {
        default: 315,
      },
      width: {
        default: 500,
      },
      frameborder: {
        default: 0,
      },
      allowfullscreen: {
        default: this.options.allowFullscreen,
        parseHTML: () => {
          return {
            allowfullscreen: this.options.allowFullscreen,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'iframe',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', this.options.HTMLAttributes, ['iframe', HTMLAttributes, 0]];
  },

  addCommands() {
    return {
      setIframe:
        (options: ISetIframeOptions) =>
        ({ tr, dispatch }) => {
          const { selection } = tr;
          const node = this.type.create(options);

          if (dispatch) {
            tr.replaceRangeWith(selection.from, selection.to, node);
          }

          return true;
        },
    };
  },
});
