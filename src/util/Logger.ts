import { resolve } from "node:path";
import process from "node:process";
import { pino } from "pino";

export function createLogger(name: string, lang: string, type: "manager" | "shard", shardID?: number, debug = false): pino.Logger {
    const dateFormat = new Intl.DateTimeFormat(lang, {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour12: false
    });
    const date = formatDate(dateFormat);
    const logger = pino({
        name,
        timestamp: true,
        level: debug ? "debug" : "info",
        formatters: {
            bindings: () => ({
                pid: type === "shard" && shardID !== undefined ? `Shard #${shardID}` : "ShardManager"
            })
        },
        transport: {
            targets: [
                { target: "pino/file", level: "info", options: { destination: resolve(process.cwd(), "logs", `${name}-${date}.log`) } },
                { target: "pino-pretty", level: debug ? "debug" : "info", options: { translateTime: "SYS:yyyy-mm-dd HH:MM:ss.l o" } }
            ]
        }
    });
    return logger;
}

function formatDate(dateFormat: Intl.DateTimeFormat, date: Date | number = new Date()): string {
    const data = dateFormat.formatToParts(date);
    return "<year>-<month>-<day>"
        .replaceAll("<year>", data.find(dt => dt.type === "year")!.value)
        .replaceAll("<month>", data.find(dt => dt.type === "month")!.value)
        .replaceAll("<day>", data.find(dt => dt.type === "day")!.value);
}
