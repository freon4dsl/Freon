import * as fs from "fs";
import { IRouterContext } from "koa-router";
var path = require("path");

const storeFolder = "./modelstore";

export class ModelRequests {
    public static async putModelUnit(foldername: string, name: string, ctx: IRouterContext) {
        try {
            this.checkStoreFolder();
            const body = ctx.request.body;
            if (!fs.existsSync(path.join(`${storeFolder}`, foldername))) {
                fs.mkdirSync(path.join(`${storeFolder}`, foldername));
            }
            fs.writeFileSync(path.join(`${storeFolder}`, foldername, `${name}.json`), JSON.stringify(body, null, 3));
        } catch (e) {
            console.log(e.message);
        }
    }

    public static async getModelUnit(foldername: string, name: string, ctx: IRouterContext) {
        try {
            this.checkStoreFolder();
            ctx.response.body = fs.readFileSync(path.join(`${storeFolder}`, foldername, `${name}.json`));
        } catch (e) {
            console.log(e.message);
        }
    }

    public static async getUnitList(foldername: string, ctx: IRouterContext) {
        try {
            this.checkStoreFolder();
            if (!fs.existsSync(path.join(`${storeFolder}`, foldername))) {
                fs.mkdirSync(path.join(`${storeFolder}`, foldername));
            }
            const dir = fs
                .readdirSync(path.join(`${storeFolder}`, foldername))
                .filter((f) => f.endsWith(".json"))
                .map((f) => f.substring(0, f.length - 5));
            // FIXME A hack to return a specific unit as the ffirst, only for Education demo!!
            const tmp = dir.findIndex((s) => s === "Fractions10");
            if (tmp !== -1) {
                dir.splice(tmp, 1);
                dir.splice(0, 0, "Fractions10");
            }
            // FIXME End
            ctx.response.body = dir;
        } catch (e) {
            console.log(e.message);
        }
    }

    public static async getModelList(ctx: IRouterContext) {
        try {
            this.checkStoreFolder();
            const dir = fs.readdirSync(`${storeFolder}`);
            ctx.response.body = dir;
        } catch (e) {
            console.log(e.message);
        }
    }

    public static async deleteModelUnit(foldername: string, name: string, ctx: IRouterContext) {
        try {
            this.checkStoreFolder();
            fs.unlinkSync(path.join(`${storeFolder}`, foldername, `${name}.json`));
        } catch (e) {
            console.log(e.message);
            ctx.request.body = e.message;
        }
    }

    public static async deleteModel(foldername: string, ctx: IRouterContext) {
        try {
            this.checkStoreFolder();
            console.log("Unlink: " + path.join(`${storeFolder}`, foldername));
            fs.rmdirSync(path.join(`${storeFolder}`, foldername), { recursive: true });
        } catch (e) {
            console.log(e.message);
            ctx.request.body = e.message;
        }
    }

    private static checkStoreFolder() {
        try {
            if (!fs.existsSync(`${storeFolder}`)) {
                fs.mkdirSync(`${storeFolder}`);
            }
        } catch (e) {
            console.log(e.message);
        }
    }
}
