<template>
  <v-dialog :model-value="visible" max-width="900" @update:model-value="$emit('update:visible', $event)">
    <v-card>
      <v-card-title>
        <div class="text-h5 text-primary">编辑历史</div>
        <v-spacer />
        <span class="text-caption text-grey">点击展开</span>
      </v-card-title>
      <v-expansion-panels>
        <v-expansion-panel v-for="archive in archives" :key="archive.id">
          <v-expansion-panel-header>
            <RelativeTime :datetime="archive.created_at" />
            <span v-if="archive.editor"> - <UserLink :userPreview="archive.editor" /></span>
            <v-spacer />
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-chip-group>
              <v-chip
                v-for="topic in archive.topics"
                :key="topic.uuid"
                :to="'/topics/' + topic.uuid"
              >{{ topic.name }}</v-chip>
            </v-chip-group>
            <div class="text-h5 text-primary">
              {{ archive.title }}
            </div>
            <Viewer v-if="archive.desc" :content="archive.desc" />
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type { IQuestionArchive } from '@/interfaces';
import UserLink from '@/components/UserLink.vue';
import Viewer from '@/components/Viewer.vue';
import RelativeTime from '@/components/RelativeTime.vue';

defineProps<{
  visible: boolean;
  archives: IQuestionArchive[];
}>();

defineEmits<{
  (e: 'update:visible', value: boolean): void;
}>();
</script>
