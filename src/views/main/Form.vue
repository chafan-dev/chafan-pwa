<template>
  <v-container fluid>
    <v-row v-if="!loading" class="mb-12" justify="center">
      <v-col :class="{ 'col-8': $vuetify.breakpoint.mdAndUp }" fluid>
        <div v-if="!showResponse">
          <h2 class="ml-2">{{ form.title }}</h2>
          <div>
            <v-card
              v-for="field in form.form_fields"
              :key="field.unique_name"
              class="ma-2 pa-4"
              flat
              outlined
            >
              <span>{{ field.field_type.desc }}</span>
              <div v-if="field.field_type.field_type_name === 'text_field'">
                <v-textarea
                  v-model="responseFields.get(field.unique_name).field_content.text"
                  :label="$t('Content')"
                />
              </div>
              <div v-else-if="field.field_type.field_type_name === 'single_choice_field'">
                <v-radio-group
                  v-model="responseFields.get(field.unique_name).field_content.selected_choice"
                >
                  <v-radio
                    v-for="choice in field.field_type.choices"
                    :key="choice"
                    :label="choice"
                    :value="choice"
                  />
                </v-radio-group>
              </div>
              <div v-else-if="field.field_type.field_type_name === 'multiple_choices_field'">
                <v-select
                  v-model="responseFields.get(field.unique_name).field_content.selected_choices"
                  :items="field.field_type.choices"
                  chips
                  multiple
                />
              </div>
            </v-card>
          </div>
          <div class="ma-2 text-center">
            <v-btn color="primary" depressed @click="submitResponse">{{ $t('提交') }}</v-btn>
          </div>
        </div>
        <FormResponseCard v-else :formResponse="formResponse" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { apiForm } from '@/api/forms';
import { IForm, IFormResponse, IFormResponseCreate, IFormResponseField } from '@/interfaces';
import { dispatchCaptureApiError } from '@/store/main/actions';
import FormResponseCard from '@/components/FormResponseCard.vue';
import { commitAddNotification } from '@/store/main/mutations';

@Component({
  components: { FormResponseCard },
})
export default class Form extends Vue {
  private form: IForm | null = null;
  private formResponseCreate: IFormResponseCreate | null = null;
  private responseFields = new Map<string, IFormResponseField>();
  private loading = true;
  private showResponse = false;
  private formResponse: IFormResponse | null = null;

  get uuid() {
    return this.$route.params.uuid;
  }

  private async mounted() {
    await dispatchCaptureApiError(this.$store, async () => {
      this.form = (await apiForm.getForm(this.$store.state.main.token, this.uuid)).data;
      this.form.form_fields.forEach((formField) => {
        if (formField.field_type.field_type_name === 'text_field') {
          this.responseFields.set(formField.unique_name, {
            unique_name: formField.unique_name,
            field_content: {
              field_type_name: 'text_response_field',
              desc: formField.field_type.desc,
              text: '',
            },
          });
        } else if (formField.field_type.field_type_name === 'single_choice_field') {
          this.responseFields.set(formField.unique_name, {
            unique_name: formField.unique_name,
            field_content: {
              field_type_name: 'single_choice_response_field',
              desc: formField.field_type.desc,
              selected_choice: '',
            },
          });
        } else if (formField.field_type.field_type_name === 'multiple_choices_field') {
          this.responseFields.set(formField.unique_name, {
            unique_name: formField.unique_name,
            field_content: {
              field_type_name: 'multiple_choices_response_field',
              desc: formField.field_type.desc,
              selected_choices: [],
            },
          });
        }
      });
      this.formResponseCreate = {
        form_uuid: this.form.uuid,
        response_fields: [],
      };
      this.loading = false;
    });
  }

  private async submitResponse() {
    for (const responseField of this.responseFields.values()) {
      if (responseField.field_content.field_type_name === 'single_choice_response_field') {
        if (!responseField.field_content.selected_choice) {
          commitAddNotification(this.$store, {
            content: this.$t('是否有单选没有选择？').toString(),
            color: 'error',
          });
          return;
        }
      }
    }
    this.formResponseCreate!.response_fields = Array.from(this.responseFields.values());
    this.formResponse = (
      await apiForm.submitFormRespnse(this.$store.state.main.token, this.formResponseCreate!)
    ).data;
    this.showResponse = true;
  }
}
</script>
