<template>
  <span>
    <template v-if="activity.event.content.subjects">
      <UserLink :userPreview="activity.event.content.subjects[0]" />
      <a class="text-decoration-none grey--text text--darken-2" @click="usersDialog = true">
        等{{ uniqueSubjects.length }}人
      </a>
    </template>
    <UserLink v-else :userPreview="activity.event.content.subject" />
    <v-dialog v-model="usersDialog" max-width="800">
      <v-card class="pt-6">
        <v-card-text>
          <v-lazy>
            <UserGrid :users="uniqueSubjects" />
          </v-lazy>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn depressed primary small @click="usersDialog = false">隐藏</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </span>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { IActivity, IUserPreview } from '@/interfaces';
import UserLink from '@/components/UserLink.vue';
import UserGrid from '@/components/UserGrid.vue';

const props = defineProps<{
  activity: IActivity;
}>();

const usersDialog = ref(false);

const uniqueSubjects = computed((): IUserPreview[] => {
  const uuids = new Set();
  const uniqueUsers: IUserPreview[] = [];
  if ('subjects' in props.activity.event.content && props.activity.event.content.subjects) {
    for (const u of props.activity.event.content.subjects) {
      if (!uuids.has(u.uuid)) {
        uniqueUsers.push(u);
        uuids.add(u.uuid);
      }
    }
  }
  return uniqueUsers;
});
</script>
