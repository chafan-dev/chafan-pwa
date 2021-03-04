<template>
    <v-avatar size="30" color="primary" tile v-if="userPreview">
        <v-img :src="userPreview.avatar_url" alt="Avatar" v-if="userPreview.avatar_url"></v-img>
        <span class="white--text" v-else>{{avatarName}}</span>
    </v-avatar>
</template>

<script lang="ts">
import { IUserPreview } from '@/interfaces';
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class Avatar extends Vue {
    @Prop() public readonly userPreview!: IUserPreview;

    get avatarName() {
        if (this.userPreview.full_name) {
            const splits = this.userPreview.full_name.split(' ');
            let s = splits[0][0].toUpperCase();
            if (splits.length > 1) {
                s += splits[1][0].toUpperCase();
            }
            return s;
        } else {
            let s = '';
            for (const char of this.userPreview.handle) {
                if (/^[A-Za-z]$/i.test(char)) {
                    s += char.toUpperCase();
                    if (s.length >= 2) {
                        break;
                    }
                }
            }
            return s;
        }
    }
}
</script>

<style scoped>
.framed-avatar {
    border: 1px solid white;
}
</style>