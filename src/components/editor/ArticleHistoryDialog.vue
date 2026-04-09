<template>
  <v-dialog :model-value="visible" max-width="900" @update:model-value="$emit('update:visible', $event)">
    <v-card>
      <v-card-title>
        <div class="text-h5 text-primary">版本历史</div>
        <v-spacer />
        <span class="text-caption text-grey">点击展开</span>
      </v-card-title>

      <v-expansion-panels v-if="archives.length">
        <v-expansion-panel v-for="archive in archives" :key="archive.id">
          <v-expansion-panel-header>
            <v-btn
              class="mr-4"
              variant="tonal"
              max-width="100px"
              size="small"
              @click="$emit('load-archive', archive)"
              >加载该版本
            </v-btn>
            {{ fromNow(archive.created_at) }}
            <v-spacer />
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <div class="text-h6">
              {{ archive.title }}
            </div>
            <Viewer :content="archive.content" />
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>

      <v-pagination
        v-model="currentPage"
        :length="pagesLength"
        @input="$emit('change-page', currentPage)"
      />
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { IArticleArchive } from '@/interfaces';
import Viewer from '@/components/Viewer.vue';
import { useDayjs } from '@/composables';

const { fromNow } = useDayjs();

const props = defineProps<{
  visible: boolean;
  archives: IArticleArchive[];
  pagesLength: number;
  page: number;
}>();

defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'load-archive', archive: IArticleArchive): void;
  (e: 'change-page', page: number): void;
}>();

const currentPage = ref(props.page);
watch(() => props.page, (v) => { currentPage.value = v; });
</script>
