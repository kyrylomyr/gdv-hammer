const vscode = require("vscode");

const { getFieldsCache } = require("./fields-cache");

const detectFieldCommand = async (context) => {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const fields = await getFieldsCache(context);

  const line = editor.document.lineAt(editor.selection.active.line).text;
  

  showResult(line);
};

async function showResult(content) {
  const document = await vscode.workspace.openTextDocument({
    language: "markdown",
    content
  });

  vscode.window.showTextDocument(document);
}

module.exports = {
  detectFieldCommand
};
