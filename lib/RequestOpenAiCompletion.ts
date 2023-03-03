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
            var result = {
                success: true,
                prompt: prompt,
                content: ok.data,
                user: sender.id,
            };
            if ("error" in ok.data) {
                result["success"] = false;
                // this is necessary for the link to be rendered correctly
                // due to a bug in RC parser.
                result["content"]["error"]["message"] = result["content"][
                    "error"
                ]["message"].replace("api-keys.", "api-keys");
            }
            app.getLogger().info(`Got new completion`, result);
            return result;
        })
        .catch((error) => {
            app.getLogger().error(
                `Error while getting new completion for prompt ${prompt}: `,
                error
            );
            return { success: false };
        });
}
