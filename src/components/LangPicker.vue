<template>
  <v-menu offset-y transition="slide-x-transition" left>
    <template v-slot:activator="{ on, attrs }">
      <v-btn
        v-bind="attrs"
        v-on="on"
        :class="{ 'thin-btn': !$vuetify.breakpoint.mdAndUp }"
        :dark="dark"
        icon
      >
        <I18nIcon />
      </v-btn>
    </template>

    <v-list dense>
      <v-list-item-group
        color="indigo"
        active-class="border"
        v-model="selectedLangIdx"
        mandatory
        @change="onChange"
      >
        <v-list-item v-for="item in langs" :key="item.code">
          <v-list-item-title>{{ item.translated }}</v-list-item-title>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </v-menu>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { availableLocales, getBrowserLocale, setAppLocale } from '@/utils'; // FIXME: store locale in main.store
import I18nIcon from '@/components/icons/I18nIcon.vue';
import { readIsLoggedIn, readLocalePreference } from '@/store/main/getters';
import { dispatchUpdateUserProfile } from '@/store/main/actions';

@Component({
  components: { I18nIcon },
})
export default class LangPicker extends Vue {
  @Prop({ default: true }) private readonly dark!: boolean;

  private selectedLang: string = getBrowserLocale();
  private selectedLangIdx: number = 0;

  get langs() {
    return availableLocales.map((l) => {
      let translated = l;
      if (l === 'en') {
        translated = 'English';
      } else if (l === 'zh') {
        translated = '简体中文';
      }
      return {
        code: l,
        translated,
      };
    });
  }

  private async mounted() {
    if (readIsLoggedIn(this.$store)) {
      const pref = readLocalePreference(this.$store);
      if (pref) {
        setAppLocale(this, pref);
        this.selectedLang = pref;
        this.selectedLangIdx = availableLocales.indexOf(this.selectedLang);
      } else {
        dispatchUpdateUserProfile(this.$store, {
          locale_preference: this.selectedLang,
        });
      }
    }
  }

  private async onChange() {
    this.selectedLang = availableLocales[this.selectedLangIdx];
    setAppLocale(this, this.selectedLang);
    if (readIsLoggedIn(this.$store)) {
      dispatchUpdateUserProfile(this.$store, {
        locale_preference: this.selectedLang,
      });
    }
  }
}
</script>

<style scoped>
.border {
  border: 2px dashed orange;
}

.thin-btn {
  max-width: 35px !important;
}
</style>
