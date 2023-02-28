import { IUIActionButtonDescriptor, RoomTypeFilter, UIActionButtonContext } from "@rocket.chat/apps-engine/definition/ui";
import { AppSetting } from "./Settings";


export const buttons: Array<IUIActionButtonDescriptor> = [
    {
        actionId: AppSetting.NAMESPACE + '_use-message-as-prompt',
        labelI18n: AppSetting.NAMESPACE + '_AskChatGPT',
        context: UIActionButtonContext.MESSAGE_ACTION, 
    },

]