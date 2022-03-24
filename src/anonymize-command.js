const vscode = require("vscode");

const targetFields = [/^0100.{9}(.{17}).*1$/gm];

const anonymizeCommand = () => {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const text = editor.document.getText();

  const replacements = [];
  targetFields.forEach((regex) => {
    let match;
    while ((match = regex.exec(text)) !== null) {
      replacements.push(...getReplacements(match[1].trim()));
    }
  });

  editor.edit((builder) => {
    replacements.forEach((item) => {
      builder.replace(item.range, item.replacement);
    });
  });
};

const getReplacements = (value) => {
  if (value.length === 0) {
    return;
  }

  const editor = vscode.window.activeTextEditor;
  const text = editor.document.getText();

  const regex = new RegExp(value, "gm");
  const replacement = "".padEnd(value.length, value[0]);

  const replacements = [];

  let match;
  while ((match = regex.exec(text)) !== null) {
    const startPos = editor.document.positionAt(match.index);
    const endPos = editor.document.positionAt(match.index + match[0].length);
    const range = new vscode.Range(startPos, endPos);
    replacements.push({ range, replacement });
  }

  return replacements;
};

module.exports = {
  anonymizeCommand
};
