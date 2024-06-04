import { FreNamedNode, FreNode } from "../ast/index";
import { FreLogger } from "../logging/index";
import { FreLionwebSerializer, FreModelSerializer, FreSerializer } from "../storage/index";
import { FreErrorSeverity } from "../validator/index";
import type { IServerCommunication } from "./IServerCommunication";

const LOGGER = new FreLogger("ServerCommunication"); // .mute();
const modelUnitInterfacePostfix: string = "Public";

export class ServerCommunication implements IServerCommunication {
    get nodePort(): any {
        return this._nodePort;
    }

    set nodePort(value: any) {
        this._nodePort = value;
        this.SERVER_URL = `${this._SERVER_IP}:${this._nodePort}/`;
    }

    get SERVER_URL(): string {
        return this._SERVER_URL;
    }

    set SERVER_URL(value: string) {
        this._SERVER_URL = value;
    }
    get SERVER_IP(): string {
        return this._SERVER_IP;
    }

    set SERVER_IP(value: string) {
        this._SERVER_IP = value;
        this.SERVER_URL = `${this._SERVER_IP}:${this._nodePort}/`;
    }
    static serial: FreSerializer = new FreModelSerializer();
    static lionweb_serial: FreSerializer = new FreLionwebSerializer();
    static instance: ServerCommunication;

    static getInstance(): ServerCommunication {
        if (!(!!ServerCommunication.instance)) {
            ServerCommunication.instance = new ServerCommunication();
        }
        return ServerCommunication.instance;
    }

    private static findParams(params?: string) {
        if (!!params && params.length > 0) {
            return "?" + params;
        } else {
            return "";
        }
    }

    private _nodePort = process.env.NODE_PORT || 8001;
    private _SERVER_IP = `http://127.0.0.1`;
    private _SERVER_URL = `${this._SERVER_IP}:${this._nodePort}/`;

    onError(msg: string,  severity: FreErrorSeverity): void {
        // default implementation
        console.error(`ServerCommunication ${severity}: ${msg}`);
    }

    async generateIds(quantity: number, callback: (strings: string[]) => void): Promise<string[]> {
        return null
    }


    /**
     * Takes 'piUnit' and stores it as 'unitName' in the folder 'modelName' on the server at SERVER_URL.
     * 'unitName' must start with a character and contain only characters and/or numbers.
     * @param modelName
     * @param unitName
     * @param piUnit
     */
    async putModelUnit(modelName: string, unitName: string, piUnit: FreNamedNode) {
        LOGGER.log(`ServerCommunication.putModelUnit ${modelName}/${unitName}`);
        if (!!unitName && unitName.length > 0 && unitName.match(/^[a-z,A-Z][a-z,A-Z0-9_\-\.]*$/)) {
            const model = ServerCommunication.lionweb_serial.convertToJSON(piUnit);
            const publicModel = ServerCommunication.lionweb_serial.convertToJSON(piUnit, true);
            let output = {
                "serializationFormatVersion": "2023.1",
                "languages": [],
                // "__version": "1234abcdef",
                "nodes": model
            }

            await this.putWithTimeout(`putModelUnit`, output, `folder=${modelName}&name=${unitName}` );
            let publicOutput = {
                "serializationFormatVersion": "2023.1",
                "languages": [],
                // "__version": "1234abcdef",
                "nodes": publicModel
            }
            await this.putWithTimeout(
                `putModelUnit`,
                publicOutput,
                `folder=${modelName}&name=${unitName}${modelUnitInterfacePostfix}`
            );
        } else {
            LOGGER.error( "Name of Unit '" + unitName + "' may contain only characters, numbers, '_', or '-', and must start with a character.");
            this.onError("Name of Unit '" + unitName
                + "' may contain only characters, numbers, '_', or '-', and must start with a character.", FreErrorSeverity.NONE);
        }
    }

    /**
     * Deletes the unit indicated by 'modelInfo' including its interface.
     * @param modelName
     * @param unitName
     */
    async deleteModelUnit(modelName: string, unitName: string) {
        LOGGER.log(`ServerCommunication.deleteModelUnit ${modelName}/${unitName}`);
        if (!!unitName && unitName.length > 0) {
            await this.fetchWithTimeout<any>(`deleteModelUnit`, `folder=${modelName}&name=${unitName}`);
            await this.fetchWithTimeout<any>(`deleteModelUnit`, `folder=${modelName}&name=${unitName}${modelUnitInterfacePostfix}`);
        }
    }

    /**
     * Deletes the complete model named 'modelName'.
     * @param modelName
     */
    async deleteModel(modelName: string ) {
        LOGGER.log(`ServerCommunication.deleteModel ${modelName}`);
        if (!!modelName && modelName.length > 0) {
            await this.fetchWithTimeout<any>(`deleteModel`, `folder=${modelName}`);
        }
    }

    /**
     * Reads the list of models that are available on the server and calls 'modelListCallback'.
     * @param modelListCallback
     */
    async loadModelList(modelListCallback: (names: string[]) => void) {
        LOGGER.log(`ServerCommunication.loadModelList`);
        const res: string[] = await this.fetchWithTimeout<string[]>(`getModelList`);
        if (!!res) {
            modelListCallback(res);
        } else {
            modelListCallback([]);
        }
    }

    /**
     * Reads the list of units in model 'modelName' that are available on the server and calls 'modelListCallback'.
     * @param modelName
     * @param modelListCallback
     */
    async loadUnitList(modelName: string, modelListCallback: (names: string[]) => void) {
        LOGGER.log(`ServerCommunication.loadUnitList`);
        let modelUnits: string[] = await this.fetchWithTimeout<string[]>(`getUnitList`, `folder=${modelName}`);
        // filter out the modelUnitInterfaces
        if (!!modelUnits) {
            modelUnits = modelUnits.filter( (name: string) => name.indexOf(modelUnitInterfacePostfix) === -1 );
            modelListCallback(modelUnits);
        } else {
            modelListCallback([]);
        }
    }

    /**
     * Loads the unit named 'unitName' of model 'modelName' from the server and calls 'loadCallBack',
     * which takes the unit as parameter.
     * @param modelName
     * @param unitName
     * @param loadCallback
     */
    async loadModelUnit(modelName: string, unitName: string, loadCallback: (piUnit: FreNamedNode) => void) {
        LOGGER.log(`ServerCommunication.loadModelUnit ${unitName}`);
        if (!!unitName && unitName.length > 0) {
            const res = await this.fetchWithTimeout<Object>(`getModelUnit`, `folder=${modelName}&name=${unitName}`);
            if (!!res) {
                try {
                    let unit: FreNode;
                    if (res["$typename"] === undefined) {
                        unit = ServerCommunication.lionweb_serial.toTypeScriptInstance(res);
                    } else {
                        unit = ServerCommunication.serial.toTypeScriptInstance(res);
                    }
                    loadCallback(unit as FreNamedNode);
                } catch (e) {
                    LOGGER.error( "loadModelUnit, " + e.message);
                    this.onError(e.message, FreErrorSeverity.NONE);
                    console.log(e.stack);
                }
            }
        }
    }

    /**
     * Loads the interface of the unit named 'unitName' of model 'modelName' from the server and calls 'loadCallBack',
     * which takes the unit as parameter.
     * @param modelName
     * @param unitName
     * @param loadCallback
     */
    async loadModelUnitInterface(modelName: string, unitName: string, loadCallback: (piUnitInterface: FreNamedNode) => void) {
        LOGGER.log(`ServerCommunication.loadModelUnitInterface for ${modelName}/${unitName}`);
        if (!!unitName && unitName.length > 0) {
            const res = await this.fetchWithTimeout<Object>(`getModelUnit`, `folder=${modelName}&name=${unitName}${modelUnitInterfacePostfix}`);
            if (!!res) {
                try {
                    let unit: FreNode;
                    if (res["$typename"] === undefined) {
                        unit = ServerCommunication.lionweb_serial.toTypeScriptInstance(res);
                    } else {
                        unit = ServerCommunication.serial.toTypeScriptInstance(res);
                    }
                    // const model = ServerCommunication.serial.toTypeScriptInstance(res);
                    loadCallback(unit as FreNamedNode);
                } catch (e) {
                    LOGGER.error( "loadModelUnitInterface, " + e.message);
                    this.onError(e.message, FreErrorSeverity.NONE);
                }
            }
        }
    }

    async fetchWithTimeout<T>(method: string, params?: string): Promise<T> {
        params = ServerCommunication.findParams(params);
        LOGGER.log("fetchWithTimeout Params = " + params);
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);
            LOGGER.log("Input: " + `${this._SERVER_URL}${method}${params}`)
            const promise = await fetch(
                `${this._SERVER_URL}${method}${params}`,
                {
                    signal: controller.signal,
                    method: "get",
                    headers: {
                        "Content-Type": "application/json"
                }
            });
            clearTimeout(timeoutId);
            return await promise.json() ;
        } catch (e) {
            this.handleError(e);
        }
        return null;
    }

    private async putWithTimeout(method: string, data: Object, params?: string) {
        params = ServerCommunication.findParams(params);
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);
            await fetch(
                `${this._SERVER_URL}${method}${params}`,
                {
                    signal: controller.signal,
                    method: "put",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data)
                });
            clearTimeout(timeoutId);
        } catch (e) {
            this.handleError(e);
        }
    }

    private handleError(e: Error) {
        let errorMess: string = e.message;
        if (e.message.includes("aborted")) {
            errorMess = `Time out: no response from ${this._SERVER_URL}.`;
        }
        LOGGER.error( errorMess);
        this.onError(errorMess, FreErrorSeverity.NONE);
    }

    async renameModelUnit(modelName: string, oldName: string, newName: string, piUnit: FreNamedNode) {
        LOGGER.log(`ServerCommunication.renameModelUnit ${modelName}/${oldName} to ${modelName}/${newName}`);
        // put the unit and its interface under the new name
        this.putModelUnit(modelName, newName, piUnit);
        // remove the old unit and interface
        this.deleteModelUnit(modelName, oldName);
    }

}
