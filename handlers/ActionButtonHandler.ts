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
            const blockBuilder = modify.getCreator().getBlockBuilder();
            // notification config
            blockBuilder.addInputBlock({
                blockId: AppSetting.NAMESPACE + "_ask_chatgpt",
                label: {
                    text: `Prompt:`,
                    type: TextObjectType.PLAINTEXT,
                },
                element: blockBuilder.newPlainTextInputElement({
                    actionId: "suggested_prompt",
                    initialValue: message?.text,
                    multiline: true,
                }),
            });

            var thread_id = message?.threadId;

            var answer_options = [
                {
                    text: blockBuilder.newPlainTextObject("Send me a Direct"),
                    value: "direct#" + room.id + "#" + thread_id,
                },
                // {
                //     text: blockBuilder.newPlainTextObject("Quote"),
                //     value: "quote#"  + room.id + "#" + thread_id,
                // },
                {
                    text: blockBuilder.newPlainTextObject("As a Notification"),
                    value: "notification#" + room.id + "#" + thread_id,
                },
                {
                    text: blockBuilder.newPlainTextObject("As a New Message"),
                    value: "message#" + room.id + "#" + thread_id,
                },
            ];
            var answer_initialValue =
                "notification#" + room.id + "#" + thread_id;
            const thread_value = "thread#" + room.id + "#" + message?.id;
            answer_initialValue = thread_value;
            var thread_button_message = "In a Thread";
            // add thread as the first option
            answer_options = [
                {
                    text: blockBuilder.newPlainTextObject(thread_button_message),
                    value: thread_value,
                },
            ].concat(answer_options);

            blockBuilder.addInputBlock({
                blockId: AppSetting.NAMESPACE + "_ask_chatgpt",
                optional: false,
                element: blockBuilder.newStaticSelectElement({
                    placeholder: blockBuilder.newPlainTextObject(
                        "Output the answer in a..."
                    ),
                    actionId: "output_option",
                    initialValue: answer_initialValue,
                    options: answer_options,
                }),
                label: blockBuilder.newPlainTextObject(
                    "How to output the answer?"
                ),
            });
            return context.getInteractionResponder().openModalViewResponse({
                id: "ask-chatgpt-submit-view",
                title: blockBuilder.newPlainTextObject("Ask ChatGPT"),
                blocks: blockBuilder.getBlocks(),
                submit: blockBuilder.newButtonElement({
                    actionId: "ask-chat-gpt",
                    text: blockBuilder.newPlainTextObject("Ask"),
                    value: "as-thread",
                    style: ButtonStyle.PRIMARY,
                }),
            });
        }

        return context.getInteractionResponder().successResponse();
    }
}
