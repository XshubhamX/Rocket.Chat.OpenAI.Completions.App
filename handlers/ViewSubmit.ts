import {
    IHttp,
    ILogger,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { UIKitViewSubmitInteractionContext } from "@rocket.chat/apps-engine/definition/uikit";
import { AppSetting } from "../config/Settings";
import { OpenAiCompletionRequest } from "../lib/RequestOpenAiChat";
import { sendDirect } from "../lib/SendDirect";
import { sendMessage } from "../lib/SendMessage";
import { sendNotification } from "../lib/SendNotification";
import { OpenAiChatApp } from "../OpenAiChatApp";

export class ViewSubmitHandler {
    public async executor(
        app: OpenAiChatApp,
        context: UIKitViewSubmitInteractionContext,
        read: IRead,
        http: IHttp,
        persistence: IPersistence,
        modify: IModify,
        logger?: ILogger
    ) {
        const interaction_data = context.getInteractionData();

        if (interaction_data.view.id == "ask-chatgpt-submit-view") {
            //var prompt = interaction_data.view.state?.OpenAiCompletions_suggested_prompt
            if (interaction_data.view.state) {
                const completions_options =
                    interaction_data.view.state[
                        AppSetting.NAMESPACE + "_ask_chatgpt"
                    ];
                const prompt = completions_options["suggested_prompt"];
                const output_options = completions_options["output_option"];
                const user = interaction_data.user;

                // do request
                OpenAiCompletionRequest(
                    app,
                    http,
                    read,
                    [{ role: "user", content: prompt }],
                    user
                ).then((result) => {
                    for (var output of output_options) {
                        // get room, output_mode and other from the output option
                        const output_mode = output.split("#")[0];
                        const room_id = output.split("#")[1];
                        var thread_id = output.split("#")[2];
                        if (thread_id == "undefined") {
                            thread_id = undefined;
                        }
                        read.getRoomReader()
                            .getById(room_id)
                            .then((room) => {
                                if (!room) {
                                    return {
                                        success: false,
                                        message: "No room found",
                                    };
                                }

                                if (!result.success) {
                                    sendNotification(
                                        modify,
                                        room,
                                        user,
                                        `**Error!** Could not Request Completion:\n\n` +
                                            result.content.error.message
                                    );
                                } else {
                                    var before_message = `**Prompt**: ${prompt}`;
                                    var markdown_message =
                                        result.content.choices[0].message
                                            .content;
                                    switch (output_mode) {
                                        case "notification":
                                            sendNotification(
                                                modify,
                                                room,
                                                user,
                                                before_message +
                                                    "\n" +
                                                    markdown_message,
                                                thread_id
                                            );
                                            break;

                                        case "direct":
                                            sendDirect(
                                                user,
                                                read,
                                                modify,
                                                before_message +
                                                    "\n" +
                                                    markdown_message
                                            );
                                            break;

                                        case "thread":
                                            sendMessage(
                                                modify,
                                                room,
                                                before_message +
                                                    markdown_message,
                                                undefined,
                                                thread_id
                                            );
                                            break;

                                        case "message":
                                            sendMessage(
                                                modify,
                                                room,
                                                before_message +
                                                    markdown_message
                                            );
                                            break;

                                        default:
                                            break;
                                    }
                                }
                                return {
                                    success: true,
                                };
                            });
                    }
                });
            }
        }
        return {
            success: true,
        };
    }
}
