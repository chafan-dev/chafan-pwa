import { IRichEditorState, ISite, ITopBanner, IUserProfile } from '@/interfaces';

export interface AppNotification {
    content: string;
    color?: string;
    showProgress?: boolean;
}

export interface MainState {
    token: string;
    isLoggedIn: boolean | null;
    logInError: boolean;
    userMode: boolean;
    userProfile: IUserProfile | null;
    dashboardMiniDrawer: boolean;
    dashboardShowDrawer: boolean;
    notifications: AppNotification[];
    moderated_sites: ISite[] | null;
    workingDraft: IRichEditorState | null;
    topBanner: ITopBanner | null;
    showLoginPrompt: boolean;
    narrowUI: boolean;
}
