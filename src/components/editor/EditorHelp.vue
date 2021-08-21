<template>
  <v-expand-transition>
    <v-card v-show="showHelp" class="ma-3 pa-3">
      <div class="headline primary--text">帮助</div>
      <div>
        <ul>
          <li>
            数学输入：目前支持用<code>$...$</code>输入行内公式，用<code>$$....$$</code>输入公式块。
          </li>
        </ul>
      </div>
    </v-card>
  </v-expand-transition>
</template>
<script lang="ts">
export default {
  name: 'EditorHelp',
  props: {
    showHelp: {},
  },
};
</script>
