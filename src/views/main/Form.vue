<template>
  <v-container fluid>
    <v-row v-if="!loading" class="mb-12" justify="center">
      <v-col :class="{ 'col-8': $vuetify.breakpoint.mdAndUp }">
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
                  label="内容"
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
            <v-btn color="primary" depressed @click="submitResponse">提交</v-btn>
          </div>
        </div>
        <FormResponseCard v-else :formResponse="formResponse" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import store from '@/store';
import { useRoute } from 'vue-router/composables';
import { apiForm } from '@/api/forms';
import { IForm, IFormResponse, IFormResponseCreate, IFormResponseField } from '@/interfaces';
import { dispatchCaptureApiError } from '@/store/main/actions';
import FormResponseCard from '@/components/FormResponseCard.vue';
import { commitAddNotification } from '@/store/main/mutations';

const route = useRoute();

const form = ref<IForm | null>(null);
const formResponseCreate = ref<IFormResponseCreate | null>(null);
const responseFields = reactive(new Map<string, IFormResponseField>());
const loading = ref(true);
const showResponse = ref(false);
const formResponse = ref<IFormResponse | null>(null);

const uuid = computed(() => route.params.uuid as string);

onMounted(async () => {
  await dispatchCaptureApiError(store, async () => {
    form.value = (await apiForm.getForm(store.state.main.token, uuid.value)).data;
    form.value.form_fields.forEach((formField) => {
      if (formField.field_type.field_type_name === 'text_field') {
        responseFields.set(formField.unique_name, {
          unique_name: formField.unique_name,
          field_content: {
            field_type_name: 'text_response_field',
            desc: formField.field_type.desc,
            text: '',
          },
        });
      } else if (formField.field_type.field_type_name === 'single_choice_field') {
        responseFields.set(formField.unique_name, {
          unique_name: formField.unique_name,
          field_content: {
            field_type_name: 'single_choice_response_field',
            desc: formField.field_type.desc,
            selected_choice: '',
          },
        });
      } else if (formField.field_type.field_type_name === 'multiple_choices_field') {
        responseFields.set(formField.unique_name, {
          unique_name: formField.unique_name,
          field_content: {
            field_type_name: 'multiple_choices_response_field',
            desc: formField.field_type.desc,
            selected_choices: [],
          },
        });
      }
    });
    formResponseCreate.value = {
      form_uuid: form.value.uuid,
      response_fields: [],
    };
    loading.value = false;
  });
});

async function submitResponse() {
  for (const responseField of responseFields.values()) {
    if (responseField.field_content.field_type_name === 'single_choice_response_field') {
      if (!responseField.field_content.selected_choice) {
        commitAddNotification(store, {
          content: '是否有单选没有选择？',
          color: 'error',
        });
        return;
      }
    }
  }
  formResponseCreate.value!.response_fields = Array.from(responseFields.values());
  formResponse.value = (
    await apiForm.submitFormRespnse(store.state.main.token, formResponseCreate.value!)
  ).data;
  showResponse.value = true;
}
</script>
