// Generated by the Freon Language Generator.
// Run this as the main program.
import { UndoModelEnvironment } from "../config/gen/UndoModelEnvironment";
import { FreonCommandLine } from "./FreonCommandLine";
import { DummyAction } from "./DummyAction";

// ensure language is initialized
const tmp = UndoModelEnvironment.getInstance();

// Create the command line object
const cli: FreonCommandLine = new FreonCommandLine();

// Add specific actions to the command line tool
// REPLACE WITH YOUR OWN
cli.addAction(new DummyAction());

// Run it
cli.execute();
