<script setup lang="ts">
withDefaults(defineProps<{
  schoolName: string;
  levelName: string;
  major?: string;
  enrollYear?: string;
  graduateYear?: string;
  compact?: boolean;
}>(), {
  compact: false,
});
</script>

<template>
  <div>
    <template v-if="compact">
      {{ schoolName }} · {{ levelName }}
      <span v-if="major || enrollYear || graduateYear" class="grey--text">
        (<span v-if="major">{{ major }}</span>
        <span class="grey--text" v-if="enrollYear || graduateYear">
          <span v-if="major">, </span>
          <span v-if="enrollYear">{{ enrollYear }} - </span>
          <span v-if="graduateYear">{{ graduateYear }}</span>
          <span v-else>在读</span> </span
        >)
      </span>
    </template>
    <template v-else>
      <h3>{{ schoolName }}</h3>
      <div>
        {{ levelName }} <span v-if="major"> - {{ major }}</span>
      </div>
      <div class="grey--text" v-if="enrollYear || graduateYear">
        <span v-if="enrollYear">{{ enrollYear }} - </span>
        <span v-if="graduateYear">{{ graduateYear }}</span
        ><span v-else>在读</span>
      </div>
    </template>
  </div>
</template>
