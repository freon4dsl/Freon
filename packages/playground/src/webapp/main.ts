import { PiLogger } from "@projectit/core";
import App from './App.svelte';

// Mute or unmute logs here (in addition to elsewhere).

// PiLogger.mute("TextComponent");
PiLogger.mute("AUTORUN");
PiLogger.mute("AFTER_UPDATE");
PiLogger.mute("SelectOptionList");
// PiLogger.muteAllLogs()

const app = new App({
	target: document.body,
});

export default app;

PiLogger.unmute("AUTORUN");

