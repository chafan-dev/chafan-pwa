<template>
  <div>
    <div v-if="editor">
      <editor-menu-bubble
        :editor="editor"
        :keep-in-bounds="keepInBounds"
        v-slot="{ commands, isActive, menu }"
        v-if="editable"
      >
        <div
          class="menububble"
          :class="{ 'is-active': menu.isActive }"
          :style="`left: ${menu.left}px; bottom: ${menu.bottom}px;`"
        >
          <button
            class="menububble__button"
            :class="{ 'is-active': isActive.bold() }"
            @click="commands.bold"
          >
            B
          </button>

          <button
            class="menububble__button"
            :class="{ 'is-active': isActive.italic() }"
            @click="commands.italic"
          >
            I
          </button>

          <button
            class="menububble__button"
            :class="{ 'is-active': isActive.code() }"
            @click="commands.code"
          >
            C
          </button>
        </div>
      </editor-menu-bubble>

      <editor-content
        class="editor__content"
        :class="{ 'editable-editor-content': editable }"
        :editor="editor"
      />
    </div>

    <div class="suggestion-list" v-show="showSuggestions" ref="suggestions">
      <template v-if="hasResults">
        <div
          v-for="(user, index) in filteredUsers"
          :key="user.uuid"
          class="suggestion-list__item"
          :class="{ 'is-selected': navigatedUserIndex === index }"
          @click="selectUser(user)"
        >
          {{ user.full_name }} (@{{ user.handle }})
        </div>
      </template>
      <div v-else class="suggestion-list__item is-empty">
        {{ $t('No users found') }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Editor, EditorContent, EditorMenuBubble } from 'tiptap';
import {
  Blockquote,
  BulletList,
  CodeBlock,
  HardBreak,
  Heading,
  ListItem,
  OrderedList,
  TodoItem,
  TodoList,
  Bold,
  Code,
  Italic,
  Link,
  Strike,
  Underline,
  History,
} from 'tiptap-extensions';
import Mention from '@/plugins/tiptap-mention';

import tippy, { sticky } from 'tippy.js';
import 'tippy.js/dist/tippy.css';

import { Component, Prop, Vue } from 'vue-property-decorator';
import { apiSearch } from '@/api/search';

@Component({
  components: {
    EditorContent,
    EditorMenuBubble,
  },
})
export default class Tiptap extends Vue {
  @Prop() public readonly onEditorChange: ((string) => void) | undefined;
  @Prop({ default: true }) public readonly editable!: boolean;

  private keepInBounds = true;

  // For mention
  private query: string | null = null;
  private suggestionRange = null;
  private navigatedUserIndex = 0;
  private insertMention: any = null;

  private filteredUsers = [];

  private onEnterMention({ items, query, range, command, virtualNode }) {
    this.query = query;
    this.filteredUsers = items;
    this.hasResults = this.filteredUsers.length > 0;
    this.suggestionRange = range;
    this.renderPopup(virtualNode);
    // we save the command for inserting a selected mention
    // this allows us to call it inside of our custom popup
    // via keyboard navigation and on click
    this.insertMention = command;
  }

  private onChangeMention({ items, query, range, virtualNode }) {
    this.query = query;
    this.filteredUsers = items;
    this.hasResults = this.filteredUsers.length > 0;
    this.suggestionRange = range;
    this.navigatedUserIndex = 0;
    this.renderPopup(virtualNode);
  }

  private editor: any = null;

  get token() {
    return this.$store.state.main.token;
  }

  private mounted() {
    this.editor = new Editor({
      extensions: [
        new Blockquote(),
        new BulletList(),
        new CodeBlock(),
        new HardBreak(),
        new Heading({ levels: [1, 2, 3] }),
        new ListItem(),
        new OrderedList(),
        new TodoItem(),
        new TodoList(),
        new Link(),
        new Bold(),
        new Code(),
        new Italic(),
        new Strike(),
        new Underline(),
        new History(),
        new Mention({
          items: async () => {
            return (await apiSearch.searchUsers(this.token, 'm')).data;
          },
          onEnter: this.onEnterMention,
          // is called when a suggestion has changed
          onChange: this.onChangeMention,
          // is called when a suggestion is cancelled
          onExit: () => {
            // reset all saved values
            this.query = null;
            this.filteredUsers = [];
            this.hasResults = false;
            this.suggestionRange = null;
            this.navigatedUserIndex = 0;
            this.destroyPopup();
          },
          // is called on every keyDown event while a suggestion is active
          onKeyDown: ({ event }) => {
            if (event.key === 'ArrowUp') {
              this.upHandler();
              return true;
            }
            if (event.key === 'ArrowDown') {
              this.downHandler();
              return true;
            }
            if (event.key === 'Enter') {
              this.enterHandler();
              return true;
            }
            return false;
          },
          onFilter: async (items, query) => {
            if (!query) {
              return items;
            }
            return (await apiSearch.searchUsers(this.token, query)).data;
          },
        }),
      ],
      onUpdate: () => {
        if (this.onEditorChange) {
          this.onEditorChange(this.getText());
        }
      },
      editable: this.editable,
    });
  }

  private upHandler() {
    this.navigatedUserIndex =
      (this.navigatedUserIndex + this.filteredUsers.length - 1) % this.filteredUsers.length;
  }

  // navigate to the next item
  // if it's the last item, navigate to the first one
  private downHandler() {
    this.navigatedUserIndex = (this.navigatedUserIndex + 1) % this.filteredUsers.length;
  }

  private enterHandler() {
    const user = this.filteredUsers[this.navigatedUserIndex];
    if (user) {
      this.selectUser(user);
    }
  }

  // we have to replace our suggestion text with a mention
  // so it's important to pass also the position of your suggestion text
  selectUser(user) {
    this.insertMention({
      range: this.suggestionRange,
      attrs: {
        id: user.uuid,
        label: `${user.full_name} (${user.handle})`,
        href: `/users/${user.handle}`,
      },
    });
    this.editor.focus();
  }

  // renders a popup with suggestions
  // tiptap provides a virtualNode object for using popper.js (or tippy.js) for popups
  private renderPopup(node) {
    const boundingClientRect = node.getBoundingClientRect();
    const { x, y } = boundingClientRect;
    if (x === 0 && y === 0) {
      return;
    }
    if (this.popup) {
      return;
    }
    // ref: https://atomiks.github.io/tippyjs/v6/all-props/
    this.popup = tippy(this.$el, {
      getReferenceClientRect: () => boundingClientRect,
      appendTo: () => document.body,
      interactive: true,
      sticky: true, // make sure position of tippy is updated when content changes
      plugins: [sticky],
      content: this.$refs.suggestions as HTMLElement,
      trigger: 'mouseenter', // manual
      showOnCreate: true,
      theme: 'dark',
      placement: 'top-start',
      inertia: true,
      duration: [400, 200],
    });
  }

  private popup: any = null;

  private hasResults = false;

  get showSuggestions() {
    return this.query || this.hasResults;
  }

  destroyPopup() {
    if (this.popup) {
      this.popup.destroy();
      this.popup = null;
    }
  }

  public loadHTML(htmlBody: string) {
    this.editor.setContent(htmlBody);
  }

  public getText() {
    return this.$el.querySelector('.editor__content')!.textContent;
  }

  public getJSON() {
    return this.editor.getJSON();
  }

  public loadJSON(object: any) {
    this.editor.setContent(object);
  }

  public getHTML() {
    return this.editor.getHTML();
  }

  private beforeDestroy() {
    this.destroyPopup();
    this.editor.destroy();
  }
}
</script>

<style lang="scss">
@import '~vuetify/src/styles/styles.sass';

$color-black: #000000;
$color-white: #ffffff;
$color-grey: #dddddd;

.menububble {
  position: absolute;
  display: flex;
  z-index: 20;
  background: $color-black;
  border-radius: 5px;
  padding: 0.3rem;
  margin-bottom: 0.5rem;
  transform: translateX(-50%);
  visibility: hidden;
  opacity: 0;
  transition: opacity 0.2s, visibility 0.2s;

  &.is-active {
    opacity: 1;
    visibility: visible;
  }

  &__button {
    display: inline-flex;
    background: transparent;
    border: 0;
    color: $color-white;
    padding: 0.2rem 0.5rem;
    margin-right: 0.2rem;
    border-radius: 3px;
    cursor: pointer;

    &:last-child {
      margin-right: 0;
    }

    &:hover {
      background-color: rgba($color-white, 0.1);
    }

    &.is-active {
      background-color: rgba($color-white, 0.2);
    }
  }

  &__form {
    display: flex;
    align-items: center;
  }

  &__input {
    font: inherit;
    border: none;
    background: transparent;
    color: $color-white;
  }
}

.editor {
  position: relative;
  max-width: 30rem;
  margin: 0 auto 5rem auto;

  &__content {
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-word;

    * {
      caret-color: currentColor;
    }

    pre {
      padding: 0.7rem 1rem;
      border-radius: 5px;
      background: $color-black;
      color: $color-white;
      font-size: 0.8rem;
      overflow-x: auto;

      code {
        display: block;
      }
    }

    p code {
      padding: 0.2rem 0.4rem;
      border-radius: 5px;
      font-size: 0.8rem;
      font-weight: bold;
      background: rgba($color-black, 0.1);
      color: rgba($color-black, 0.8);
    }

    ul,
    ol {
      padding-left: 1rem;
    }

    li > p,
    li > ol,
    li > ul {
      margin: 0;
    }

    a {
      color: inherit;
    }

    blockquote {
      border-left: 3px solid rgba($color-black, 0.1);
      color: rgba($color-black, 0.8);
      padding-left: 0.8rem;
      font-style: italic;

      p {
        margin: 0;
      }
    }

    img {
      max-width: 100%;
      border-radius: 3px;
    }

    table {
      border-collapse: collapse;
      table-layout: fixed;
      width: 100%;
      margin: 0;
      overflow: hidden;

      td,
      th {
        min-width: 1em;
        border: 2px solid $color-grey;
        padding: 3px 5px;
        vertical-align: top;
        box-sizing: border-box;
        position: relative;
        > * {
          margin-bottom: 0;
        }
      }

      th {
        font-weight: bold;
        text-align: left;
      }

      .selectedCell:after {
        z-index: 2;
        position: absolute;
        content: '';
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        background: rgba(200, 200, 255, 0.4);
        pointer-events: none;
      }

      .column-resize-handle {
        position: absolute;
        right: -2px;
        top: 0;
        bottom: 0;
        width: 4px;
        z-index: 20;
        background-color: #adf;
        pointer-events: none;
      }
    }

    .tableWrapper {
      margin: 1em 0;
      overflow-x: auto;
    }

    .resize-cursor {
      cursor: ew-resize;
      cursor: col-resize;
    }
  }
}

.ProseMirror-focused {
  outline: none !important;
}

.editable-editor-content .ProseMirror {
  border: 1px solid lightgrey;
  border-radius: 5px;
  min-height: 30rem;
}

.ProseMirror {
  padding: 5px;
}

.mention {
  background: rgba($color-black, 0.1);
  color: rgba($color-black, 0.6);
  font-size: 0.8rem;
  font-weight: bold;
  border-radius: 5px;
  padding: 0.2rem 0.5rem;
  white-space: nowrap;
  text-decoration: none;
}
.mention-suggestion {
  color: rgba($color-black, 0.6);
}
.suggestion-list {
  padding: 0.2rem;
  border: 2px solid rgba($color-black, 0.1);
  font-size: 0.8rem;
  font-weight: bold;
  &__no-results {
    padding: 0.2rem 0.5rem;
  }
  &__item {
    border-radius: 5px;
    padding: 0.2rem 0.5rem;
    margin-bottom: 0.2rem;
    cursor: pointer;
    font-family: $body-font-family;
    &:last-child {
      margin-bottom: 0;
    }
    &.is-selected,
    &:hover {
      background-color: rgba($color-white, 0.2);
    }
    &.is-empty {
      opacity: 0.5;
    }
  }
}
.tippy-box[data-theme~='dark'] {
  background-color: $color-black;
  padding: 0;
  font-size: 1rem;
  text-align: inherit;
  color: $color-white;
  border-radius: 5px;
}
</style>
