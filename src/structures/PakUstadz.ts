import "dotenv/config";
import { Client, Collection } from "discord.js";
import { createLogger } from "../util/Logger";
import { CommandsRegistrar } from "../util/CommandsRegistrar";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { BaseCommand } from "./BaseCommand";
import { readdirSync } from "node:fs";
import prisma from "@prisma/client"; // @prisma/client is not ESM
const { PrismaClient } = prisma;


const currentDirName = dirname(fileURLToPath(import.meta.url));
export class PakUstadz extends Client {
    public isProd = process.env.NODE_ENV === "production";
    public logger = createLogger("client", "id-ID", "shard", undefined, !this.isProd);
    public commands = new Collection<string, BaseCommand>();
    public prisma = new PrismaClient();
    public userData = this.prisma.user;
    public serverData = this.prisma.server;
    public imsakiyah = readdirSync(resolve(currentDirName, "..", "imsakiyah"));
    private readonly commandsRegistrar = new CommandsRegistrar(this, resolve(currentDirName, "..", "commands"));

    public async build(): Promise<void> {
        return new Promise(res => {
            this.on("ready", async () => {
                await this.commandsRegistrar.build();
                await this.prisma.$connect();
                this.logger.info("Bot sudah ready dan online di Discord!");
            });
            this.on("interactionCreate", interaction => {
                if (!interaction.isCommand() && !interaction.isAutocomplete()) return undefined;

                if (interaction.isCommand() && interaction.channel?.type === "DM") return interaction.reply("Maaf, bot ini hanya bisa digunakan di server / guild saja.");

                const command = this.commands.get(interaction.commandName);

                command!.execute(interaction);
            });
            this.on("debug", m => this.logger.debug(m));
            res();
        });
    }

    public start(): Promise<string> {
        return this.login(process.env.DISCORD_TOKEN);
    }
}
