const vscode = require("vscode");

const { getFieldsCache } = require("./fields-cache");
const { fieldDecorationType } = require("./decorations");

const markFieldCommand = async (context) => {
  const fields = await getFieldsCache(context);
  vscode.window.showQuickPick(fields).then((field) => {
    if (field) {
      markField(field);
    }
  });
};

const markField = (field) => {
  const activeEditor = vscode.window.activeTextEditor;
  if (!activeEditor) {
    return;
  }

  const regex = getRegex(field);
  const text = activeEditor.document.getText();

  const decorations = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    const startPos = activeEditor.document.positionAt(match.index + match[1].length);
    const endPos = activeEditor.document.positionAt(match.index + match[1].length + match[2].length);
    const decoration = { range: new vscode.Range(startPos, endPos) };
    decorations.push(decoration);
  }

  activeEditor.setDecorations(fieldDecorationType, decorations);
};

const getRegex = (field) => {
  // BUG: Sometimes GDV documentation contains Teildatensatz number, but Satznummer is actually not present on the line. For example, in Nachsatz.
  const parts = field.satzart.split(".");
  if (parts.length === 1) {
    return new RegExp(`^(${field.satzart}.{${field.position - 5}})(.{${field.length}}).*${field.satznummer}$`, "gm");
  } else {
    return new RegExp(
      `^(${parts[0]}.{6}${parts[1]}.{${field.position - 14}})(.{${field.length}}).*${field.satznummer}$`,
      "gm"
    );
  }
};

module.exports = {
  markFieldCommand
};
