const vscode = require("vscode");

const { markFieldCommand } = require("./mark-field-command");
const { clearMarkCommand } = require("./clear-mark-command");
const { anonymizeCommand } = require("./anonymize-command");
const { resetCacheCommand } = require("./reset-cache-command");

const activate = (context) => {
  context.subscriptions.push(vscode.commands.registerCommand("extension.markField", async () => await markFieldCommand(context)));
  context.subscriptions.push(vscode.commands.registerCommand("extension.clearMark", clearMarkCommand));
  context.subscriptions.push(vscode.commands.registerCommand("extension.anonymize", anonymizeCommand));
  context.subscriptions.push(vscode.commands.registerCommand("extension.resetCache", async () => await resetCacheCommand(context)));
};

module.exports = {
  activate
};
