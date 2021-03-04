<template>
    <v-menu bottom left>
        <template v-slot:activator="{ on, attrs }">
            <v-btn dark icon v-bind="attrs" v-on="on" :class="{'thin-btn': !$vuetify.breakpoint.mdAndUp }">
                <I18nIcon />
            </v-btn>
        </template>

        <v-list>
             <v-list-item-group
                    color="indigo"
                    active-class="border"
                    v-model="selectedLangIdx"
                    mandatory
                    @change="onChange">
                <v-list-item v-for="item in langs" :key="item.code">
                    <v-list-item-title>{{ item.translated }}</v-list-item-title>
                </v-list-item>
             </v-list-item-group>
        </v-list>
    </v-menu>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { availableLocales, getBrowserLocale, setAppLocale } from '@/utils'; // FIXME: store locale in main.store
import I18nIcon from '@/components/icons/I18nIcon.vue';
import { readLocalePreference, readIsLoggedIn } from '@/store/main/getters';
import { dispatchUpdateUserProfile } from '@/store/main/actions';

@Component({
    components: { I18nIcon },
})
export default class LangPicker extends Vue {
    private selectedLang: string = getBrowserLocale();
    private selectedLangIdx: number = 0;
    get langs() { return availableLocales.map((l) => {
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
    }); }
    public async mounted() {
        if (readIsLoggedIn(this.$store)) {
            const pref = readLocalePreference(this.$store);
            if (pref) {
                this.selectedLang = pref;
                this.selectedLangIdx = availableLocales.indexOf(this.selectedLang);
            } else {
                // Use and commit default from browser locale -- FIXME: is this too late?
                dispatchUpdateUserProfile(this.$store, { locale_preference: this.selectedLang });
            }
        }
    }
    public async onChange() {
        this.selectedLang = availableLocales[this.selectedLangIdx];
        setAppLocale(this, this.selectedLang);
        if (readIsLoggedIn(this.$store)) {
            dispatchUpdateUserProfile(this.$store, { locale_preference: this.selectedLang });
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