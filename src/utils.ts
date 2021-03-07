const CHAFAN_TOKEN = 'chafan:token'

export const getLocalToken = () => {
    try {
        return localStorage.getItem(CHAFAN_TOKEN);
    } catch (e) {
        return null;
    }
};

export const saveLocalToken = (token: string) => {
    try {
        localStorage.setItem(CHAFAN_TOKEN, token);
    } catch (e) {
        // do nothing
    }
};

export const removeLocalToken = () => {
    try {
        localStorage.removeItem(CHAFAN_TOKEN);
    } catch (e) {
        // do nothing
    }
};

export const availableLocales = ['en', 'zh'];

import { MainState } from '@/store/main/state';
import { ActionContext } from 'vuex';
import { State } from '@/store/state';

export const getBrowserLocale = () => {
    const langFirst = navigator.language.split('-')[0];
    if (availableLocales.includes(langFirst)) {
        return langFirst;
    }
    for (const lang of navigator.languages) {
        const langFirst2 = lang.split('-')[0];
        if (availableLocales.includes(langFirst2)) {
        return langFirst2;
        }
    }
    return 'zh';
};

import { localize } from 'vee-validate';
import { apiAnswer } from '@/api/answer';
import { apiArticle } from '@/api/article';

export const setAppLocale = (vueInstance: any, selectedLang: string) => {
    vueInstance.$i18n.locale = selectedLang;
    vueInstance.$vuetify.lang.current = selectedLang;
    if (selectedLang === 'zh') {
        localize('zh_CN');
        vueInstance.$dayjs.locale('zh-cn');
    } else {
        localize(selectedLang);
        vueInstance.$dayjs.locale(selectedLang);
    }
};

import { commitAddNotification, commitSetTopBanner } from '@/store/main/mutations';
import { dispatchCheckApiError } from './store/main/actions';
import { captureException } from '@sentry/vue';
import { IComment, IRichEditorState } from './interfaces';
import { env } from './env';
import { AxiosError } from 'axios';

export const newAnswerHandler = async (vueInstance: any,
                                       edit: IRichEditorState,
                                       writingSessionUUID: string,
                                       isAutosaved: boolean,
                                       questionUUID: string) => {
    if (edit.body && (!edit.rendered_body_text || edit.rendered_body_text.length < 5)) {
        commitAddNotification(vueInstance.$store, {
            content: vueInstance.$t('Answer is too short: minimum length 5 characters.').toString(),
            color: 'error',
        });
        return;
    }
    try {
        if (edit.body) {
            const newAnswer = (await apiAnswer.postAnswer(vueInstance.$store.state.main.token,
                {
                    body: edit.body,
                    source_format: edit.source_format,
                    editor: edit.editor,
                    math_enabled: edit.math_enabled,
                    question_uuid: questionUUID,
                    writing_session_uuid: writingSessionUUID,
                    is_published: !edit.is_draft,
                })).data;
            const answerUUID = newAnswer.uuid;
            if (!isAutosaved) {
                vueInstance.$router.push(`/questions/${questionUUID}/answers/${answerUUID}`);
            }
            return newAnswer;
        }
    } catch (err) {
        if (env !== 'development') {
            captureException(err);
            await dispatchCheckApiError(vueInstance.$store, err);
        } else {
            throw err;
        }
    }
};

export const newArticleHandler = async (vueInstance: any,
                                        edit: IRichEditorState,
                                        writingSessionUUID: string,
                                        isAutosaved: boolean,
                                        articleColumnId: string) => {
    if (!edit.title) {
        commitAddNotification(vueInstance.$store, {
            content: vueInstance.$t('Article must have title.').toString(),
            color: 'error',
        });
        return;
    }
    try {
        const newArticle = (await apiArticle.postArticle(vueInstance.$store.state.main.token,
            {
                title: edit.title,
                body: edit.body,
                source_format: edit.source_format,
                editor: edit.editor,
                math_enabled: edit.math_enabled,
                is_published: !edit.is_draft,
                writing_session_uuid: writingSessionUUID,
                article_column_uuid: articleColumnId,
            })).data;
        const articleId = newArticle.uuid;
        if (!isAutosaved) {
            vueInstance.$router.push(`/articles/${articleId}`);
        }
        return newArticle;
    } catch (err) {
        if (env !== 'development') {
            captureException(err);
            await dispatchCheckApiError(vueInstance.$store, err);
        } else {
            throw err;
        }
    }
};

export const authHeaders = (token: string)  => {
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};


export const authHeadersFormData = (token: string) => {
    return {
        headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
        },
    };
};


export const authHeadersWithParams = (token: string, params: URLSearchParams)  => {
    return {
        headers: {
        Authorization: `Bearer ${token}`,
        },
        params,
    };
};

export const uuidv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};


type MainContext = ActionContext<MainState, State>;

export const handleApiError = async (context: MainContext, err: AxiosError) => {
    if (err.toString() === 'Error: Network Error') {
        commitSetTopBanner(context, {
            color: 'grey',
            textColor: 'white',
            text: '无法连接到服务器',
            enabled: true,
        });
    } else {
        await dispatchCheckApiError(context, err);
        if (env !== 'development') {
            captureException(err);
        } else {
            throw err;
        }
    }
};

export const rankComments = (dayjs, comments: IComment[]) => {
    return comments.sort((a, b) => {
        if (a.upvotes_count > b.upvotes_count) {
            return -1;
        }
        if (dayjs.utc(a.created_at).isAfter(dayjs.utc(b.created_at))) {
            return -1;
        }
        return 1;
    });
};
