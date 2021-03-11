<template>
  <v-main>
    <v-container fluid fill-height>
      <v-layout align-center justify-center>
        <v-flex xs12 sm8 md6>
          <LoginCard />
        </v-flex>
      </v-layout>
    </v-container>
  </v-main>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import LoginCard from '@/components/LoginCard.vue';

@Component({
  components: { LoginCard },
})
export default class Login extends Vue {}
</script>
