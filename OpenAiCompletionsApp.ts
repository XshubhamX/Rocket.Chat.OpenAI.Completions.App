import {
    IAppAccessors,
    IConfigurationExtend,
    IHttp,
    ILogger,
    IModify,
    IPersistence,
    IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import { IUIKitResponse, UIKitActionButtonInteractionContext, UIKitViewSubmitInteractionContext } from '@rocket.chat/apps-engine/definition/uikit';
import { OpenAICompletionsCommand } from './commands/OpenAICompletionsCommand';
import { buttons } from './config/Buttons';
import { settings } from './config/Settings';
import { ActionButtonHandler } from './handlers/ActionButtonHandler';
import { ViewSubmitHandler } from './handlers/ViewSubmit';

export class OpenAiCompletionsApp extends App {
    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
    }

    public async extendConfiguration(configuration: IConfigurationExtend) {
        await configuration.slashCommands.provideSlashCommand(
            new OpenAICompletionsCommand(this),
        );
        // Providing persistant app settings
        await Promise.all(
            settings.map((setting) =>
                configuration.settings.provideSetting(setting)
            )
        );
        // Registering Action Buttons
        await Promise.all(
            buttons.map((button) => configuration.ui.registerButton(button))
        );
    }
    // register ActionButton Handler
    public async executeActionButtonHandler(
        context: UIKitActionButtonInteractionContext,
        read: IRead,
        http: IHttp,
        persistence: IPersistence,
        modify: IModify
    ): Promise<IUIKitResponse> {
        // lets just move this execution to another file to keep DemoApp.ts clean.
        return new ActionButtonHandler().executor(
            this,
            context,
            read,
            http,
            persistence,
            modify,
            this.getLogger()
        );
    }
    // register SubmitView Handler
    public async executeViewSubmitHandler(
        context: UIKitViewSubmitInteractionContext,
        read: IRead,
        http: IHttp,
        persistence: IPersistence,
        modify: IModify
    ) {
        // same for View SubmitHandler, moving to another Class
        return new ViewSubmitHandler().executor(
            this,
            context,
            read,
            http,
            persistence,
            modify,
            this.getLogger()
        );
    }    
    
}
