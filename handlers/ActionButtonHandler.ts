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
import { OpenAiCompletionRequest } from "../lib/RequestOpenAiCompletion";
import { sendNotification } from "../lib/SendNotification";
import { OpenAiCompletionsApp } from "../OpenAiCompletionsApp";

export class ActionButtonHandler {
    public async executor(
        app: OpenAiCompletionsApp,
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
            // if (message) {
            //     var elements = [
            //         blockBuilder.newButtonElement({
            //             actionId: "send-as-quote",
            //             text: blockBuilder.newPlainTextObject(
            //                 "Quote"
            //             ),
            //             value: "as thread",
            //             style: ButtonStyle.PRIMARY,
            //         }),
            //         blockBuilder.newButtonElement({
            //             actionId: "send-as-direct",
            //             text: blockBuilder.newPlainTextObject("Direct"),
            //             value: "as direct",
            //             style: ButtonStyle.PRIMARY,
            //         }),
            //     ];
            //     if (!("threadId" in message)) {
            //         // message not on a thread, add option
            //         elements.push(
            //             blockBuilder.newButtonElement({
            //                 actionId: "send-as-thread",
            //                 text: blockBuilder.newPlainTextObject(
            //                     "Thread"
            //                 ),
            //                 value: "as thread",
            //                 style: ButtonStyle.PRIMARY,
            //             })
            //         );
            //     }
            //     blockBuilder.addActionsBlock({
            //         elements: elements,
            //     });
            // }
            var answer_options = [
                {
                    text: blockBuilder.newPlainTextObject("Direct"),
                    value: "direct#" + room.id,
                },
                {
                    text: blockBuilder.newPlainTextObject("Quote"),
                    value: "quote#" + room.id,
                },
                {
                    text: blockBuilder.newPlainTextObject("Notification"),
                    value: "notification#" + room.id,
                },                
            ];
            var answer_initialValue = 'quote'
            if (message && !("threadId" in message)) {
                // add thread as the first option
                answer_options = [
                    {
                        text: blockBuilder.newPlainTextObject("Thread"),
                        value: "thread#" + room.id,
                    },
                ].concat(answer_options)
                var answer_initialValue = 'thread'
            }

            blockBuilder.addInputBlock({
                blockId: AppSetting.NAMESPACE + "_ask_chatgpt",
                optional: false,
                element: blockBuilder.newStaticSelectElement({
                    placeholder: blockBuilder.newPlainTextObject(
                        "Out the answer in a..."
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
            // request completion
            // const result = await OpenAiCompletionRequest(
            //     app,
            //     http,
            //     read,
            //     message?.text,
            //     user
            // );
            // if (result.success) {
            //     const blockBuilder = modify.getCreator().getBlockBuilder();
            //     const text =
            //         `**Prompt**:  ${message?.text}` +
            //         "\n```\n" +
            //         result.content.choices[0].text +
            //         "\n```";
            //     blockBuilder.addSectionBlock({
            //         text: blockBuilder.newMarkdownTextObject(text),
            //     });
            //     // let's open a modal using openModalViewResponse with all those information
            //     return context.getInteractionResponder().openModalViewResponse({
            //         title: blockBuilder.newPlainTextObject(
            //             "ChatGPT has spoken"
            //         ),
            //         blocks: blockBuilder.getBlocks(),
            //     });
            // } else {
            //     sendNotification(
            //         modify,
            //         room,
            //         user,
            //         `**Error!** Could not Request Completion:\n\n` +
            //             result.content.error.message
            //     );
            // }
            // // show completion with buttons
            // // if message not in thread:
            // //   - answer in thread
            // //   - answer quoted
            // //   - send me direct
            // // else message in thread:
            // //   - answer quoted
            // //   - send me direct
            // // dimiss
        }

        return context.getInteractionResponder().successResponse();
    }
}
