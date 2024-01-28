import { URL } from "node:url";
import { DateTime } from "luxon";

export class Imsakiyah {
    private cookie: string = "";
    private isInitialized: boolean = false;
    private placesRegex = /<option value="(?<id>[^"]*)">(?<name>[^<]*)<\/option>/gu;
    private statesRegex = /<select[^>]*id="search_prov"[^>]*>(?<states>[\s\S]*?)<\/select>/iu;

    public async init(): Promise<void> {
        const res = await fetch("https://bimasislam.kemenag.go.id", { method: "HEAD" });

        if (!res.ok) throw new Error("Tidak dapat mengambil cookie.");

        this.setCookie(res);

        this.isInitialized = true;
    }

    public async getImsakiyah(stateId: string, cityId: string): Promise<JadwalImsakiyah> {
        if (!this.isInitialized) throw new Error("Imsakiyah belum diinisialisasi.");

        const res = await fetch("https://bimasislam.kemenag.go.id/ajax/getImsyakiyah", {
            headers: {
                accept: "application/json, text/javascript, */*; q=0.01",
                cookie: this.cookie,
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
            },
            method: "POST",
            body: `x=${stateId}&y=${cityId}&thn=${new Date().getFullYear()}`
        });

        if (!res.ok) throw new Error("Tidak dapat mengambil data imsakiyah.");

        // this.setCookie(res);

        const dataRaw = await res.json() as JadwalImsakiyahRaw;
        const coordinate = await this.getCoordinate(
            dataRaw.prov,
            dataRaw.kabko
                .replace("KAB. ", "")
                .replace("LABUHANBATU SELATAN", "LABUHANBATU")
        );
        const timezone = await this.getTimezone(coordinate);

        const data: JadwalImsakiyah = {
            state: dataRaw.prov,
            city: dataRaw.kabko,
            hijriYear: Number(dataRaw.hijriah),
            year: Number(dataRaw.tahun),
            data: Object.values(dataRaw.data).map(a => ({
                date: Number(a.tanggal),
                imsak: DateTime.fromFormat(a.imsak, "HH:mm", { zone: timezone }),
                fajr: DateTime.fromFormat(a.subuh, "HH:mm", { zone: timezone }),
                sunrise: DateTime.fromFormat(a.terbit, "HH:mm", { zone: timezone }),
                duha: DateTime.fromFormat(a.dhuha, "HH:mm", { zone: timezone }),
                dhuhr: DateTime.fromFormat(a.dzuhur, "HH:mm", { zone: timezone }),
                asr: DateTime.fromFormat(a.ashar, "HH:mm", { zone: timezone }),
                maghrib: DateTime.fromFormat(a.maghrib, "HH:mm", { zone: timezone }),
                isha: DateTime.fromFormat(a.isya, "HH:mm", { zone: timezone })
            }))
        };

        return data;
    }

    public async getStates(): Promise<Place[]> {
        if (!this.isInitialized) throw new Error("Imsakiyah belum diinisialisasi.");

        const res = await fetch("https://bimasislam.kemenag.go.id/jadwalimsakiyah", {
            headers: {
                cookie: this.cookie
            }
        });

        if (!res.ok) throw new Error("Tidak dapat mengambil data provinsi.");

        // this.setCookie(res);

        const text = await res.text();
        const statesRaw = this.statesRegex.exec(text);

        if (statesRaw === null) throw new Error("Tidak dapat menemukan data provinsi.");

        return this.toPlaces(statesRaw.groups!.states.trim());
    }

    public async getCities(stateId: string): Promise<Place[]> {
        if (!this.isInitialized) throw new Error("Imsakiyah belum diinisialisasi.");

        const res = await fetch("https://bimasislam.kemenag.go.id/ajax/getKabkoshalat", {
            headers: {
                cookie: this.cookie,
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
            },
            method: "POST",
            body: `x=${stateId}`
        });

        if (!res.ok) throw new Error("Tidak dapat mengambil data kota.");

        // this.setCookie(res);

        const text = await res.text();

        return this.toPlaces(text.trim());
    }

    private toPlaces(htmlOptions: string): Place[] {
        return [...this.matchPlaces(htmlOptions)];
    }

    private * matchPlaces(htmlOptions: string): Generator<Place> {
        let match;
        while ((match = this.placesRegex.exec(htmlOptions)) !== null) {
            const { id, name } = match.groups!;
            yield { id, name };
        }
    }

    private async getCoordinate(state: string, city: string): Promise<Coordinate> {
        const geoUrl = new URL("https://secure.geonames.org/searchJSON");

        console.log(state, city);

        geoUrl.searchParams.set("maxRows", "1");
        geoUrl.searchParams.set("country", "ID");
        geoUrl.searchParams.set("featureClass", "A");
        geoUrl.searchParams.set("q", `${state}, ${city}`);
        geoUrl.searchParams.set("username", "hzmi");

        const res = await fetch(geoUrl.href);

        if (!res.ok) throw new Error("Tidak dapat mengambil data koordinat.");

        const geo = await res.json() as GeoResult;

        if (geo.geonames.length === 0) throw new Error("Tidak dapat menemukan data koordinat.");

        return {
            latitude: geo.geonames[0].lat,
            longitude: geo.geonames[0].lng
        };
    }

    private async getTimezone(coordinate: Coordinate): Promise<string> {
        const timeUrl = new URL("https://www.timeapi.io/api/Time/current/coordinate");

        timeUrl.searchParams.set("latitude", String(coordinate.latitude));
        timeUrl.searchParams.set("longitude", String(coordinate.longitude));

        const res = await fetch(timeUrl.href);

        if (!res.ok) throw new Error("Tidak dapat mengambil data timezone.");

        const tz = await res.json() as { timeZone: string; };

        return tz.timeZone;
    }

    private setCookie(res: Response): void {
        this.cookie = res.headers.getSetCookie()
            .map(a => a.split(";")[0])
            .join("; ");
    }
}

export type Place = {
    id: string;
    name: string;
};

export type Coordinate = {
    longitude: string;
    latitude: string;
};

type GeoResult = { geonames: { lng: string; lat: string; }[]; };

export type JadwalImsakiyahRaw = {
    status: number;
    message: string;
    prov: string;
    kabko: string;
    hijriah: string;
    tahun: string;
    data: Record<string, {
        tanggal: string;
        imsak: string;
        subuh: string;
        terbit: string;
        dhuha: string;
        dzuhur: string;
        ashar: string;
        maghrib: string;
        isya: string;
    }>;
};

export type JadwalImsakiyah = {
    state: string;
    city: string;
    hijriYear: number;
    year: number;
    data: Hari[];
};

export type Hari = {
    date: number;
    imsak: DateTime;
    fajr: DateTime;
    sunrise: DateTime;
    duha: DateTime;
    dhuhr: DateTime;
    asr: DateTime;
    maghrib: DateTime;
    isha: DateTime;
};
