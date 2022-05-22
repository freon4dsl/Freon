import { editorEnvironment } from "../../config/WebappConfiguration";

export class MenuItem {
    title: string;
    action: (id: number) => void;
    icon?: Object;
    id: number;
}
