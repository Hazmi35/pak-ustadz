import { readdir } from "node:fs/promises";
import { resolve, parse } from "node:path";
import process from "node:process";

// TODO [2024-01-29]: Move to v10
import type { RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v9";
import { Collection } from "discord.js";
import type { Guild } from "discord.js";
import type { BaseCommand } from "./BaseCommand.js";
import type { PakUstadz } from "./PakUstadz.js";

export class CommandsRegistrar extends Collection<string, BaseCommand> {
    public constructor(public client: PakUstadz, private readonly commandsFilesPath: string) {
        super();
    }

    public async register(): Promise<void> {
        const commandFiles = await readdir(resolve(this.commandsFilesPath))
            .then(files => files.filter(file => file.endsWith(".js")));

        for await (const commandFile of commandFiles) {
            const command = await this.import(resolve(this.commandsFilesPath, commandFile));
            if (command === undefined) {
                this.client.logger.warn(`File "${commandFile}" tidak memiliki class yang valid. Melewatkannya...`);
                continue;
            }
            this.set(command.meta.name, command);
        }

        const devGuild: Guild | undefined = process.env.DEV_GUILD === undefined ? undefined : await this.client.guilds.fetch(process.env.DEV_GUILD);
        const cmds = this.map(c => c.meta.toJSON() as RESTPostAPIApplicationCommandsJSONBody);

        if (!devGuild && !this.client.isProd) {
            this.client.logger.warn(
                "Bot sedang menggunakan mode development, tapi DEV_GUILD tidak sah. " +
                "ApplicationCommands akan didaftarkan secara global."
            );
        }

        await (devGuild ? this.client.application!.commands.set(cmds, devGuild.id) : this.client.application!.commands.set(cmds));

        this.client.logger.info(
            `Bot sukses mendaftarkan ApplicationCommands ${this.client.isProd || devGuild === undefined ? "secara global" : `untuk DEV_GUILD "${devGuild.name}"`}`
        );
    }

    private async import(path: string): Promise<BaseCommand | undefined> {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return
        const Module: any = await import(`file://${resolve(path)}`).then(module => module[parse(path).name]);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
        return Module === undefined ? undefined : new Module(this.client);
    }
}
