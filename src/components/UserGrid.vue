<template>
    <div>
        <template v-for="i in Math.floor((users.length - 1) / memberCols) + 1">
            <v-row :key="i">
                <template v-for="j in memberCols">
                    <v-col :key="(i - 1) * memberCols + (j - 1)">
                        <v-card class="pa-2" v-if="(i - 1) * memberCols + (j - 1) < users.length">
                            <UserLink :userPreview="users[(i - 1) * memberCols + (j - 1)]"
                                      :showAvatar="true" />
                        </v-card>
                    </v-col>
                </template>
            </v-row>
        </template>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import UserLink from '@/components/UserLink.vue';
import { IUserPreview } from '@/interfaces';

@Component({
    components: { UserLink },
})
export default class UserGrid extends Vue {
    @Prop() private readonly users!: IUserPreview[];
    private readonly memberCols = this.$vuetify.breakpoint.mdAndUp ? 3 : 2;
}
</script>