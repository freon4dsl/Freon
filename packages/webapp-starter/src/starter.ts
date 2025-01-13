import { FreonLayout, WebappConfigurator, setDevelopment } from "@freon4dsl/webapp-lib";
import { configureExternals } from "./externals.js";
import { configureLoggers } from "./loggers.js";
import { LanguageEnvironment } from "@freon4dsl/samples-example";
import { ServerCommunication} from "@freon4dsl/core";
// import { LionWebRepositoryCommunication } from "@freon4dsl/core"
import { setDevelopment } from "@freon4dsl/webapp-lib";

/**
 * Initialize everything
 */
WebappConfigurator.getInstance().setEditorEnvironment(LanguageEnvironment.getInstance());
WebappConfigurator.getInstance().setServerCommunication(ServerCommunication.getInstance());
setDevelopment(true)
configureExternals()
configureLoggers()

/**
 * Now start the app ...
 */
const app = new FreonLayout({
    target: document.body,
});
export default app;
