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
import { OpenAiCompletionRequest } from "../lib/RequestOpenAiCompletion";
import { sendMessage } from "../lib/SendMessage";
import { OpenAiCompletionsApp } from "../OpenAiCompletionsApp";

export class OpenAICompletionsCommand implements ISlashCommand {
    public command = "openai_completions"; // here is where you define the command name,
    // users will need to run /phone to trigger this command
    public i18nParamsExample = "ExampleCommand_Params";
    public i18nDescription = "ExampleCommand_Description";
    public providesPreview = false;

    constructor(private readonly app: OpenAiCompletionsApp) {}

    public async executor(
        context: SlashCommandContext,
        read: IRead,
        modify: IModify,
        http: IHttp
    ): Promise<void> {
        const prompt = context.getArguments();
        const room = context.getRoom();
        const sender = context.getSender();
        var message:string;
        console.log("PROMPT! ", prompt);
        if (prompt.length == 0) {
            console.log("NO PROMPT! ", prompt);
            await sendMessage(
                modify,
                room,
                sender,
                "Please, provide a question!"
            );
        } else {
            const result = await OpenAiCompletionRequest(
                this.app,
                http,
                read,
                prompt,
                sender,
            );
            if (result.success){
                message = `**Prompt**: ${prompt.join(" ")} \n **Answer**:`
                result.content.choices.map(choice =>{
                    message = message + '\n' + choice.text
                })
                sendMessage(modify, room, sender, message);
            }
        }
    }
}
