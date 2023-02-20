import {
    IHttp,
    IHttpRequest,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { AppSetting } from "../config/Settings";
import { OpenAiCompletionsApp } from "../OpenAiCompletionsApp";

export async function OpenAiCompletionRequest(
    app: OpenAiCompletionsApp,
    http: IHttp,
    read: IRead,
    prompt: any,
    sender: IUser
): Promise<any> {
    // get configs
    const { value: API_KEY } = await read
        .getEnvironmentReader()
        .getSettings()
        .getById(AppSetting.OpenAI_API_KEY);
    const { value: OPEN_AI_MAX_TOKENS } = await read
        .getEnvironmentReader()
        .getSettings()
        .getById(AppSetting.OpenAI_MAX_TOKENS);
    // request completion and return
    return http
        .post("https://api.openai.com/v1/completions", {
            headers: {
                Authorization: "Bearer " + API_KEY,
            },
            data: {
                user: sender.id,
                model: "text-davinci-003",
                prompt: prompt,
                temperature: 0,
                max_tokens: OPEN_AI_MAX_TOKENS,
            },
        })
        .then((ok) => {
            app.getLogger().info(
                `Got new completion for prompt ${prompt}: `,
                ok
            );
            return { success: true, prompt: prompt, content: ok.data, };
        })
        .catch((error) => {
            app.getLogger().error(
                `Error while getting new completion for prompt ${prompt}: `,
                error
            );
            return { success: false };
        });
}
