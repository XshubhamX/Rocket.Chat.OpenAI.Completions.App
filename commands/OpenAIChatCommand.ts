import {
    IHttp,
    IModify,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { IRoom, RoomType } from "@rocket.chat/apps-engine/definition/rooms";
import {
    ISlashCommand,
    SlashCommandContext,
} from "@rocket.chat/apps-engine/definition/slashcommands";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { AppSetting } from "../config/Settings";
import { OpenAiCompletionRequest } from "../lib/RequestOpenAiChat";
import { sendMessage } from "../lib/SendMessage";
import { sendNotification } from "../lib/SendNotification";
import { OpenAiChatApp } from "../OpenAiChatApp";

export class OpenAIChatCommand implements ISlashCommand {
    public command = "chatgpt";
    public i18nParamsExample = AppSetting.NAMESPACE + "_SlashCommand_Params";
    public i18nDescription = AppSetting.NAMESPACE + "_SlashCommand_Description";
    public providesPreview = false;

    constructor(private readonly app: OpenAiChatApp) {}

    public async executor(
        context: SlashCommandContext,
        read: IRead,
        modify: IModify,
        http: IHttp
    ): Promise<void> {
        const prompt = context.getArguments();
        const room = context.getRoom();
        const sender = context.getSender();
        var message: string;
        if (prompt.length == 0) {
            //console.log("NO PROMPT! ", prompt);
            await sendNotification(
                modify,
                room,
                sender,
                "Please, provide a question!",
                context.getThreadId()
            );
        } else {
            const prompt_sentence = prompt.join(" ");
            const payload = [{"role": "user", "content": prompt_sentence}]
            const result = await OpenAiCompletionRequest(
                this.app,
                http,
                read,
                payload,
                sender
            );
            if (result.success) {
                var before_message = `**Prompt**: ${prompt_sentence}`;
                var markdown_message =
                    before_message +
                    result.content.choices[0].message.content;
                sendMessage(modify, room, markdown_message, undefined, context.getThreadId());
            } else {
                sendNotification(
                    modify,
                    room,
                    sender,
                    `**Error!** Could not Request Completion:\n\n` + result.content.error.message
                );
            }
        }
    }
}
