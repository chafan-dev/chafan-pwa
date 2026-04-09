<template>
  <div
    class="editor-fixed editor-z-10 editor-inset-0 editor-overflow-y-auto"
    aria-labelledby="modal-title"
    role="dialog"
    aria-modal="true"
  >
    <div
      class="editor-flex editor-items-end editor-justify-center editor-min-h-screen editor-pt-4 editor-px-4 editor-pb-20 editor-text-center sm:editor-block sm:editor-p-0"
    >
      <div
        class="editor-fixed editor-inset-0 editor-bg-gray-500 editor-bg-opacity-75 editor-transition-opacity"
        aria-hidden="true"
      ></div>

      <span
        class="editor-hidden sm:editor-inline-block sm:editor-align-middle sm:editor-h-screen"
        aria-hidden="true"
        >&#8203;</span
      >

      <div
        class="editor-inline-block editor-align-bottom editor-bg-white editor-rounded-lg editor-text-left editor-overflow-hidden editor-shadow-xl editor-transform editor-transition-all sm:editor-my-8 sm:editor-align-middle sm:editor-max-w-lg sm:editor-w-full"
      >
        <div class="editor-bg-white editor-px-4 editor-pt-5 editor-pb-4 sm:editor-p-6 sm:editor-pb-4">
          <div class="editor-mt-3 editor-text-center sm:editor-mt-0 sm:editor-text-left">
            <h3 class="editor-text-lg editor-leading-6 editor-font-medium editor-text-gray-900" id="modal-title">
              <slot name="title"></slot>
            </h3>
            <div class="editor-mt-2">
              <slot name="content"></slot>
            </div>
          </div>
        </div>
        <div class="editor-bg-gray-50 editor-px-4 editor-py-3 sm:editor-px-6 sm:editor-flex sm:editor-flex-row-reverse">
          <button
            type="button"
            @click="$emit('confirm')"
            class="tiptap-cf-confirm-btn editor-w-full editor-inline-flex editor-justify-center editor-rounded-md editor-border editor-border-transparent editor-shadow-sm editor-px-4 editor-py-2 editor-bg-blue-600 editor-text-base editor-font-medium editor-text-white sm:editor-ml-3 sm:editor-w-auto sm:editor-text-sm"
          >
            确认
          </button>
          <button
            type="button"
            @click="$emit('cancel')"
            class="tiptap-cf-cancel-btn editor-mt-3 editor-w-full editor-inline-flex editor-justify-center editor-rounded-md editor-border editor-border-gray-300 editor-shadow-sm editor-px-4 editor-py-2 editor-bg-white editor-text-base editor-font-medium editor-text-gray-700 sm:editor-mt-0 sm:editor-ml-3 sm:editor-w-auto sm:editor-text-sm"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  confirm: [];
  cancel: [];
}>();
</script>
