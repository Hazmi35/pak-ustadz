import { PakUstadz } from "../structures/PakUstadz";
import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { EventEmitter } from "node:events";

export class ImsakiyahClock extends EventEmitter {
    private isInitialized = false;
    public constructor(public pakUstadz: PakUstadz, private readonly imsakiyahPath: string) { super(); }

    public async init(): Promise<void> {
        const imsakiyahFiles = await readdir(this.imsakiyahPath);
        for (const imsakiyahFile of imsakiyahFiles) {
            const imsakiyah = JSON.parse((await readFile(resolve(this.imsakiyahPath, imsakiyahFile))).toString()) as Imsakiyah[];
            this.pakUstadz.imsakiyah.set(
                imsakiyahFile.replace(".json", ""),
                imsakiyah.map(i => ({ ...i, imsak: new Date(i.imsak), maghrib: new Date(i.maghrib) }))
            );
        }
        this.isInitialized = true;
        await this.doClock();
        setInterval(() => this.doClock(), 1000);
    }

    // This is promise because to control startup flow.
    public doClock(): Promise<void> {
        return new Promise(res => {
            if (!this.isInitialized) return undefined;
            const now = new Date(Date.now());
            for (const [k, i] of this.pakUstadz.imsakiyah) {
                const today = i.find(i2 => i2.bulan === now.getMonth() && i2.tanggal === now.getDate());

                if (today === undefined) continue;

                if (now >= today.imsak && now < today.maghrib && this.pakUstadz.fastings.get(k) !== true) {
                    this.pakUstadz.fastings.set(k, true);
                    this.emit("imsak", k);
                }

                if (now >= today.maghrib && this.pakUstadz.fastings.get(k) !== false) {
                    this.pakUstadz.fastings.set(k, false);
                    this.emit("iftar", k);
                }
            }
            res();
        });
    }
}

export interface Imsakiyah {
    bulan: number;
    tanggal: number;
    hari: number;
    imsak: Date;
    maghrib: Date;
}
