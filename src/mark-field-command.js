const vscode = require("vscode");

const { fieldDecorationType } = require("./decorations");

const fields = [
  {
    label: "Allgemeine Daten - 0100 Adressteil - Satz 1 - Name 1",
    satzart: "0100",
    position: 44,
    length: 30,
    satznummer: "1"
  },
  {
    label: "Allgemeine Daten - 0100 Adressteil - Satz 1 - Name 3",
    satzart: "0100",
    position: 104,
    length: 30,
    satznummer: "1"
  },
  {
    label: "Allgemeine Daten - 0200 Allgemeiner Vertragsteil - Satz 1 - Personen-/Kundennummer des Vermittlers",
    satzart: "0200",
    position: 176,
    length: 17,
    satznummer: "1"
  }
];

const markFieldCommand = () => {
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

  const regex = new RegExp(
    `^(${field.satzart}.{${field.position - field.satzart.length - 1}})(.{${field.length}}).*${field.satznummer}$`,
    "gm"
  );

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

module.exports = {
  markFieldCommand
};
