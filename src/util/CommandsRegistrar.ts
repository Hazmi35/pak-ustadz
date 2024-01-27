import { readdir } from "node:fs/promises";
import { resolve, parse } from "node:path";
import process from "node:process";

// TODO [2024-01-29]: Move to v10
import type { RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v9";
import type { Guild } from "discord.js";
import type { BaseCommand } from "../structures/BaseCommand.js";
import type { PakUstadz } from "../structures/PakUstadz.js";

export class CommandsRegistrar {
    public constructor(public pakUstadz: PakUstadz, private readonly commandsFilesPath: string) {}

    public async register(): Promise<void> {
        const commandFiles = await readdir(resolve(this.commandsFilesPath));

        for await (const commandFile of commandFiles) {
            const command = await this.import(resolve(this.commandsFilesPath, commandFile));
            if (command === undefined) throw new Error(`File ${commandFile} is not a valid command file`);
            this.pakUstadz.commands.set(command.meta.name, command);
        }

        const devGuild: Guild | undefined = process.env.DEV_GUILD === undefined ? undefined : await this.pakUstadz.guilds.fetch(process.env.DEV_GUILD);
        const cmds = this.pakUstadz.commands.map(c => c.meta.toJSON() as RESTPostAPIApplicationCommandsJSONBody);

        if (devGuild && !this.pakUstadz.isProd) {
            this.pakUstadz.logger.warn(
                "Bot sedang menggunakan mode development, tapi DEV_GUILD tidak sah. " +
                "ApplicationCommands akan didaftarkan secara global."
            );
        }

        await (devGuild ? this.pakUstadz.application!.commands.set(cmds, devGuild.id) : this.pakUstadz.application!.commands.set(cmds));

        this.pakUstadz.logger.info(
            `Bot sukses mendaftarkan ApplicationCommands ${this.pakUstadz.isProd || devGuild === undefined ? "secara global" : `untuk DEV_GUILD "${devGuild.name}"`}`
        );
    }

    private async import(path: string): Promise<BaseCommand | undefined> {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return
        const Module: any = await import(resolve(path)).then(module => module[parse(path).name]);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
        return Module === undefined ? undefined : new Module(this.pakUstadz);
    }
}
