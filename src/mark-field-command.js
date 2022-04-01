const vscode = require("vscode");
const axios = require("axios");
const jsdom = require("jsdom");

const { fieldDecorationType } = require("./decorations");

const cacheName = "gdv-fields-cache";
let fieldsDict = {};

const markFieldCommand = async (context) => {
  fieldsDict = context.globalState.get(cacheName, {});
  let fields = Object.values(fieldsDict);
  if (fields.length === 0) {
    vscode.window.showInformationMessage("Downloading GDV fields...");
    await downloadFields();
    await context.globalState.update(cacheName, fieldsDict);
    fields = Object.values(fieldsDict);
    vscode.window.showInformationMessage("GDV fields have been downloaded and cached.");
  }

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

const downloadFields = async () => {
  try {
    const indexResponse = await axios({
      url: "http://www.gdv-online.de/vuvm/bestand/rel2018/samenue.html",
      method: "get"
    });

    const indexLinks = extractIndexLinks(indexResponse.data);
    for (let i = 0; i < indexLinks.length; i++) {
      const link = indexLinks[i];
      const response = await axios({
        url: link,
        method: "get",
        responseType: "arraybuffer",
        reponseEncoding: "binary"
      });

      const decoder = new TextDecoder("ISO-8859-1");
      let html = decoder.decode(response.data);

      extractFields(html);
    }
  } catch (error) {
    console.error(error);
    return;
  }
};

const extractIndexLinks = (html) => {
  const regex = /ds.+?\.htm/g;
  const indexLinks = [];

  let match;
  while ((match = regex.exec(html)) !== null) {
    indexLinks.push("http://www.gdv-online.de/vuvm/bestand/rel2018/" + match[0]);
  }

  return indexLinks;
};

const extractFields = (html) => {
  const doc = new jsdom.JSDOM(html, "text/html").window.document;
  const headerTable = doc.querySelector("body > table > tbody > tr > td:nth-child(3) > table:nth-child(4)");

  const kapitel = headerTable.querySelector("tbody > tr:nth-child(1) > td:nth-child(2) > b").innerHTML;
  const bezeichnung = headerTable.querySelector("tbody > tr:nth-child(2) > td:nth-child(2) > b").innerHTML;
  const satzart = headerTable.querySelector("tbody > tr:nth-child(2) > td:nth-child(3) > b").innerHTML;

  const fieldsTable = doc.querySelector("body > table > tbody > tr > td:nth-child(3) > table:nth-child(5) > tbody");

  let satznummer = 0;
  for (let i = 0; i < fieldsTable.children.length; i++) {
    const tr = fieldsTable.children[i];

    const teildatensatz = tr.querySelector("td > div > b");
    if (teildatensatz && teildatensatz.innerHTML.includes("Teildatensatz")) {
      satznummer++;
    }

    const fieldNum = Number(tr.querySelector("td").innerHTML);
    if (fieldNum && Number.isInteger(fieldNum) && fieldNum > 0) {
      const fieldName = tr.querySelector("td:nth-child(2)").innerHTML;
      const fieldLength = tr.querySelector("td:nth-child(4) > p").innerHTML;
      const fieldPosition = tr.querySelector("td:nth-child(5) > p").innerHTML;

      if (fieldName && !fieldName.startsWith("- ")) {
        const field = {
          label: `${satzart}.${satznummer} - ${kapitel} / ${bezeichnung} - ${fieldName}`,
          satzart: satzart,
          position: Number(fieldPosition),
          length: Number(fieldLength),
          satznummer: satznummer
        };

        fieldsDict[field.label] = field;
      }
    }
  }
};

module.exports = {
  markFieldCommand
};
