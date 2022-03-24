const vscode = require("vscode");

const fieldDecorationType = vscode.window.createTextEditorDecorationType({
  borderWidth: "1px",
  borderStyle: "solid",
  overviewRulerColor: "lightblue",
  overviewRulerLane: vscode.OverviewRulerLane.Right,
  light: { borderColor: "blue" },
  dark: { borderColor: "lightblue" }
});

module.exports = {
  fieldDecorationType
};
