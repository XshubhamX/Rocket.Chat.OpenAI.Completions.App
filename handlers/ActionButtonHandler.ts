import {
    IHttp,
    ILogger,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import {
    ButtonStyle,
    IUIKitResponse,
    TextObjectType,
    UIKitActionButtonInteractionContext,
} from "@rocket.chat/apps-engine/definition/uikit";
import { AppSetting } from "../config/Settings";
import { OpenAiCompletionRequest } from "../lib/RequestOpenAiChat";
import { sendNotification } from "../lib/SendNotification";
import { OpenAiChatApp } from "../OpenAiChatApp";
import { createAskChatGPTModal } from "../ui/AskChatGPTModal";

export class ActionButtonHandler {
    public async executor(
        app: OpenAiChatApp,
        context: UIKitActionButtonInteractionContext,
        read: IRead,
        http: IHttp,
        persistence: IPersistence,
        modify: IModify,
        logger: ILogger
    ): Promise<IUIKitResponse> {
        const { buttonContext, actionId, triggerId, user, room, message } =
            context.getInteractionData();
        
        // If you have multiple action buttons, use `actionId` to determine
        // which one the user interacted with
        if (actionId === AppSetting.NAMESPACE + "_use-message-as-prompt") {
            var askChatGPT_Modal = createAskChatGPTModal(
                modify, room, message?.text, message?.threadId || message?.id
            )
            return context.getInteractionResponder().openModalViewResponse(askChatGPT_Modal);
        }

        return context.getInteractionResponder().successResponse();
    }
}
