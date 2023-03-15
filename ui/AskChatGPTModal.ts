import { IModify } from "@rocket.chat/apps-engine/definition/accessors";
import { IMessage } from "@rocket.chat/apps-engine/definition/messages";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import {
    BlockElementType,
    ButtonStyle,
    TextObjectType,
} from "@rocket.chat/apps-engine/definition/uikit";
import { IUIKitContextualBarViewParam } from "@rocket.chat/apps-engine/definition/uikit/UIKitInteractionResponder";
import { AppSetting } from "../config/Settings";

export function createAskChatGPTModal(
    modify: IModify,
    room: IRoom,
    initialPrompt?: string,
    message?: IMessage,
    viewId?: string
): IUIKitContextualBarViewParam {
    const blocks = modify.getCreator().getBlockBuilder();

    blocks.addInputBlock({
        blockId: AppSetting.NAMESPACE + "_ask_chatgpt",
        label: {
            text: `Prompt`,
            type: TextObjectType.PLAINTEXT,
        },
        element: blocks.newPlainTextInputElement({
            actionId: "suggested_prompt",
            initialValue: initialPrompt,
            multiline: true,
        }),
    });

    // define output options
    var answer_options = [
        {
            text: blocks.newPlainTextObject("Send me a direct message"),
            value: "direct#" + room.id + "#" + message?.threadId,
        },
        // {
        //     text: blockBuilder.newPlainTextObject("Quote"),
        //     value: "quote#"  + room.id + "#" + thread_id,
        // },
        {
            text: blocks.newPlainTextObject("As a notification"),
            value: "notification#" + room.id + "#" + message?.threadId,
        },
        {
            text: blocks.newPlainTextObject("As a new message"),
            value: "message#" + room.id + "#" + message?.threadId,
        },
    ];
    var answer_initialValue = "notification#" + room.id + "#" + message?.threadId;
    // if message was provided, show as thread.
    if(message){
        const thread_value = "thread#" + room.id + "#" + message?.id;
        answer_initialValue = thread_value;
        var thread_button_message = "Thread";
        // add thread as the first option
        answer_options = [
            {
                text: blocks.newPlainTextObject(thread_button_message),
                value: thread_value,
            },
        ].concat(answer_options);
    }

    blocks.addInputBlock({
        blockId: AppSetting.NAMESPACE + "_ask_chatgpt",
        optional: false,
        element: blocks.newMultiStaticElement({
            placeholder: blocks.newPlainTextObject(
                "Output response as..."
            ),
            actionId: "output_option",
            initialValue: [answer_initialValue],
            options: answer_options,
        }),
        label: blocks.newPlainTextObject("Output"),
    });

    return {
        id: "ask-chatgpt-submit-view",
        title: blocks.newPlainTextObject("Ask ChatGPT"),
        blocks: blocks.getBlocks(),
        submit: blocks.newButtonElement({
            actionId: "ask-chat-gpt",
            text: blocks.newPlainTextObject("Ask"),
            value: "as-thread",
            style: ButtonStyle.PRIMARY,
        }),
    }
}
