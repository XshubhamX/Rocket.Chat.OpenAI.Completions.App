import {
    IHttp,
    ILogger,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { UIKitViewSubmitInteractionContext } from "@rocket.chat/apps-engine/definition/uikit";
import { AppSetting } from "../config/Settings";
import { OpenAiCompletionRequest } from "../lib/RequestOpenAiCompletion";
import { sendNotification } from "../lib/SendNotification";
import { OpenAiCompletionsApp } from "../OpenAiCompletionsApp";

export class ViewSubmitHandler {
    public async executor(
        app: OpenAiCompletionsApp,
        context: UIKitViewSubmitInteractionContext,
        read: IRead,
        http: IHttp,
        persistence: IPersistence,
        modify: IModify,
        logger?: ILogger
    ) {
        const interaction_data = context.getInteractionData();

        console.log("SUBMIT VIEW ", interaction_data);
        if (interaction_data.view.id == "ask-chatgpt-submit-view") {
            //var prompt = interaction_data.view.state?.OpenAiCompletions_suggested_prompt
            if (interaction_data.view.state) {
                const completions_options =
                    interaction_data.view.state[
                        AppSetting.NAMESPACE + "_ask_chatgpt"
                    ];
                const prompt = completions_options["suggested_prompt"];
                const output_option_with_room =
                    completions_options["output_option"];
                // get room from the output option
                const output_mode = output_option_with_room.split("#")[0];
                const room_id = output_option_with_room.split("#")[1];
                const room = await read.getRoomReader().getById(room_id);
                const user = interaction_data.user;
                // do request
                const result = await OpenAiCompletionRequest(
                    app,
                    http,
                    read,
                    prompt,
                    user
                );
                if (!room) {
                    return { success: false, message: "No room found" };
                }
                if (!result.success) {
                    console.log("error! ", result);
                    sendNotification(
                        modify,
                        room,
                        user,
                        `**Error!** Could not Request Completion:\n\n` +
                            result.content.error.message
                    );
                } else {
                    switch (output_mode) {
                        case "notification":
                            var before_message = `**Prompt**: ${prompt}`;
                            var markdown_message =
                                before_message +
                                "\n```\n" +
                                result.content.choices[0].text +
                                "\n```";

                            sendNotification(
                                modify,
                                room,
                                user,
                                markdown_message
                            );
                            break;

                        default:
                            break;
                    }
                }
            }
        }
        return {
            success: true,
        };
    }
}
