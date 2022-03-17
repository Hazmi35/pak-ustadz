import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { PakUstadz } from "./PakUstadz";

export class BaseCommand {
    public meta = new SlashCommandBuilder();

    public constructor(public pakUstadz: PakUstadz) {}

    // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
    public execute(ctx: CommandInteraction): any {}
}
