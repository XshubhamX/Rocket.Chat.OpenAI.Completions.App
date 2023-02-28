import { ISetting, SettingType} from '@rocket.chat/apps-engine/definition/settings';

export enum AppSetting {
    NAMESPACE = 'OpenAiCompletions',
    OpenAI_API_KEY = 'openai_completions_api_key',
    OpenAI_MAX_TOKENS = 'openai_completions_max_tokens',
}

export const settings: Array<ISetting> = [
    {
        id: AppSetting.OpenAI_API_KEY,
        public: true,
        type: SettingType.STRING,
        packageValue: "",
        hidden: false,
        i18nLabel: AppSetting.NAMESPACE + '_API_KEY_LABEL',
        required: false,
    },
    {
        id: AppSetting.OpenAI_MAX_TOKENS,
        public: true,
        type: SettingType.NUMBER,
        packageValue: 4000,
        hidden: false,
        i18nLabel: AppSetting.NAMESPACE + '_MAX_TOKENS_LABEL',
        required: false,
    },    
]