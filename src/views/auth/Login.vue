<template>
  <v-sheet>
    <LoginCard class="vh-100" />
  </v-sheet>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import LoginCard from '@/components/login/LoginCard.vue';

@Component({
  components: { LoginCard },
})
export default class Login extends Vue {}
</script>
