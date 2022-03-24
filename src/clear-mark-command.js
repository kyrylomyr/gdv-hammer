const vscode = require("vscode");

const { fieldDecorationType } = require("./decorations");

const clearMarkCommand = () => {
  let activeEditor = vscode.window.activeTextEditor;
  if (activeEditor) {
    activeEditor.setDecorations(fieldDecorationType, []);
  }
};

module.exports = {
  clearMarkCommand
};
