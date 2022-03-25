const vscode = require("vscode");
const randomstring = require("randomstring");

const targetFields = [
  /^0100.{9}(.{17}).*1$/gm, // Versicherungsschein-Nummer
  /^0100.{39}(.{30}).*1$/gm, // Name 1
  /^0100.{69}(.{30}).*1$/gm, // Name 2
  /^0100.{99}(.{30}).*1$/gm, // Name 3
  /^0100.{152}(.{6}).*1$/gm, // Postleitzahl
  /^0100.{158}(.{25}).*1$/gm, // Ort
  /^0100.{183}(.{30}).*1$/gm, // Straße
  /^0100.{154}(.{20}).*2$/gm, // Kommunikationsnummer 1
  /^0100.{176}(.{20}).*2$/gm, // Kommunikationsnummer 2
  /^0100.{198}(.{20}).*2$/gm, // Kommunikationsnummer 3
  /^0100.{220}(.{20}).*2$/gm, // Kommunikationsnummer 4
  /^0100.{40}(.{60}).*3$/gm, // Kommunikationsnummer 5
  /^0100.{102}(.{60}).*3$/gm, // Kommunikationsnummer 6
  /^0100.{164}(.{60}).*3$/gm, // Kommunikationsnummer 7
  /^0100.{182}(.{11}).*4$/gm, // BIC 1
  /^0100.{193}(.{11}).*4$/gm, // BIC 2
  /^0100.{204}(.{34}).*4$/gm // IBAN 1
];

const anonymizeCommand = () => {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const text = editor.document.getText();
  if (text.length > 256 * 10 * 20) {
    vscode.window.showErrorMessage("The file is too big for anonymization.");
    return;
  }

  const targetStrings = new Set();
  targetFields.forEach((fieldRegex) => {
    let match;
    while ((match = fieldRegex.exec(text)) !== null) {
      targetStrings.add(match[1]);
    }
  });

  const replacements = [];
  targetStrings.forEach((str) => {
    replacements.push(...getReplacements(str));
  });

  editor.edit((builder) => {
    replacements.forEach((replacement) => {
      builder.replace(replacement.range, replacement.text);
    });
  });
};

const getReplacements = (value) => {
  if (value.trim().length === 0) {
    return [];
  }

  const editor = vscode.window.activeTextEditor;
  const text = editor.document.getText();

  const regex = new RegExp(escapeRegex(value), "gm");
  const replacementText = anonymizeString(value);

  const replacements = [];

  let match;
  while ((match = regex.exec(text)) !== null) {
    const startPos = editor.document.positionAt(match.index);
    const endPos = editor.document.positionAt(match.index + match[0].length);
    const range = new vscode.Range(startPos, endPos);
    replacements.push({ range, text: replacementText });
  }

  return replacements;
};

const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const anonymizeString = (original) => {
  const numbersMask = randomstring.generate({
    length: 3,
    charset: "numeric"
  });

  const charsMask = randomstring.generate({
    length: 3,
    charset: "alphabetic",
    capitalization: "lowercase"
  });

  const result = [];
  for (let i = 0; i < original.length; i++) {
    const currentChar = original[i];
    if (currentChar >= "0" && currentChar <= "9") {
      result.push(numbersMask[i % 3]);
    } else if (currentChar >= "a" && currentChar <= "z") {
      result.push(charsMask[i % 3].toLowerCase());
    } else if (currentChar >= "A" && currentChar <= "Z") {
      result.push(charsMask[i % 3].toUpperCase());
    } else {
      result.push(currentChar);
    }
  }

  return result.join("");
};

module.exports = {
  anonymizeCommand
};
