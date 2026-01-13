import { Command, Node, nodeInputRule, mergeAttributes } from '@tiptap/core';

import { Plugin } from 'prosemirror-state';

export interface ImageOptions {
  inline: boolean;
  HTMLAttributes: Record<string, any>;
  uploadFunc: ((blob: Blob) => Promise<string>) | undefined;
}

declare module '@tiptap/core' {
  interface Commands {
    image: {
      /**
       * Add an image
       */
      setImage: (options: { src: string; alt?: string; title?: string }) => Command;
    };
  }
}

export const inputRegex = /!\[(.+|:?)]\((\S+)(?:(?:\s+)["'](\S+)["'])?\)/;

export const Image = Node.create<ImageOptions>({
  name: 'image',

  defaultOptions: {
    inline: false,
    HTMLAttributes: {},
    uploadFunc: undefined,
  },

  inline() {
    return this.options.inline;
  },

  group() {
    return this.options.inline ? 'inline' : 'block';
  },

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
  },

  addCommands() {
    return {
      setImage:
        (options) =>
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
  addProseMirrorPlugins() {
    const upload = this.options.uploadFunc;
    if (!upload) {
      return [];
    }
    return [
      new Plugin({
        props: {
          handleDOMEvents: {
            drop(view, event): boolean {
              const hasFiles =
                event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length;

              if (!hasFiles) {
                return true;
              }

              const images = Array.from(event.dataTransfer!.files).filter((file) =>
                /image/i.test(file.type)
              );

              if (images.length === 0) {
                return true;
              }

              event.preventDefault();

              const { schema } = view.state;
              const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY })!;

              images.forEach(async (image) => {
                const reader = new FileReader();

                if (upload) {
                  const node = schema.nodes.image.create({
                    src: await upload(image),
                  });
                  const transaction = view.state.tr.insert(coordinates.pos, node);
                  view.dispatch(transaction);
                } else {
                  reader.onload = (readerEvent) => {
                    const node = schema.nodes.image.create({
                      src: readerEvent.target!.result,
                    });
                    const transaction = view.state.tr.insert(coordinates.pos, node);
                    view.dispatch(transaction);
                  };
                  reader.readAsDataURL(image);
                }
              });
              return true;
            },
          },

          // FIXME: this is buggy when handling copying from web --
          // See https://gist.github.com/slava-vishnyakov/16076dff1a77ddaca93c4bccd4ec4521#gistcomment-3661498 as well
          handlePaste(view, event) {
            const items = event.clipboardData!.items;
            for (const item of items) {
              if (item.type.indexOf('image') === 0) {
                event.preventDefault();
                const { schema } = view.state;

                const image = item.getAsFile()!;

                if (upload) {
                  upload(image).then((src) => {
                    const node = schema.nodes.image.create({
                      src: src,
                    });
                    const transaction = view.state.tr.replaceSelectionWith(node);
                    view.dispatch(transaction);
                  });
                } else {
                  const reader = new FileReader();
                  reader.onload = (readerEvent) => {
                    const node = schema.nodes.image.create({
                      src: readerEvent.target!.result,
                    });
                    const transaction = view.state.tr.replaceSelectionWith(node);
                    view.dispatch(transaction);
                  };
                  reader.readAsDataURL(image);
                }
              }
            }
            return false;
          },
        },
      }),
    ];
  },

  addInputRules() {
    return [
      nodeInputRule(inputRegex, this.type, (match) => {
        const [, alt, src, title] = match;

        return { src, alt, title };
      }),
    ];
  },
});

export default Image;
