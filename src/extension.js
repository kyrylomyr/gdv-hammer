const vscode = require("vscode");
const axios = require("axios");

const { markFieldCommand } = require("./mark-field-command");
const { clearMarkCommand } = require("./clear-mark-command");
const { anonymizeCommand } = require("./anonymize-command");

axios
  .get("http://www.gdv-online.de/vuvm/bestand/rel2018/samenue.html")
  .then((response) => {
    const regex = /ds\d{4}.htm/g;
    const indexLinks = [];

    let match;
    while ((match = regex.exec(response.data)) !== null) {
      indexLinks.push(match[0]);
    }

    return indexLinks;
  })
  .then((indexLinks) => {
    console.log(indexLinks);
  })
  .catch((error) => {
    console.error(error);
  });

const activate = (context) => {
  context.subscriptions.push(vscode.commands.registerCommand("extension.markField", markFieldCommand));
  context.subscriptions.push(vscode.commands.registerCommand("extension.clearMark", clearMarkCommand));
  context.subscriptions.push(vscode.commands.registerCommand("extension.anonymize", anonymizeCommand));
};

module.exports = {
  activate
};
