import { PakUstadz } from "../structures/PakUstadz";
import { readdir } from "node:fs/promises";
import { resolve, parse } from "node:path";
import { BaseCommand } from "../structures/BaseCommand";
import { Guild } from "discord.js";
import { RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v9";

export class CommandsRegistrar {
    public constructor(public pakUstadz: PakUstadz, private readonly commandsFilesPath: string) {}

    public async register(): Promise<void> {
        const commandFiles = await readdir(resolve(this.commandsFilesPath));

        for (const commandFile of commandFiles) {
            const command = await this.import(resolve(this.commandsFilesPath, commandFile));
            if (command === undefined) throw new Error(`File ${commandFile} is not a valid command file`);
            this.pakUstadz.commands.set(command.meta.name, command);
        }

        const devGuild: Guild | undefined = process.env.DEV_GUILD ? await this.pakUstadz.guilds.fetch(process.env.DEV_GUILD) : undefined;

        const cmds = this.pakUstadz.commands.map(c => c.meta.toJSON() as RESTPostAPIApplicationCommandsJSONBody);

        if (this.pakUstadz.isProd) await this.pakUstadz.application!.commands.set(cmds);
        else await devGuild?.commands.set(cmds);

        this.pakUstadz.logger.info("Bot sukses mendaftarkan commands application");
    }

    private async import(path: string): Promise<BaseCommand | undefined> {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const file = await import(resolve(path)).then(m => m[parse(path).name]);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        return file ? new file(this.pakUstadz) : undefined;
    }
}
