const vscode = require("vscode");
const axios = require("axios");
const jsdom = require("jsdom");

const oldCacheName = "gdv-fields-cache";
const cacheNameV110 = "gdv-fields-cache-v110";

const getFieldsCache = async (context) => {
  await context.globalState.update(oldCacheName, null);

  let fields = context.globalState.get(cacheNameV110, []);
  if (fields && fields.length > 0) {
    return fields;
  }

  vscode.window.showInformationMessage("Caching GDV fields...");

  fields = await downloadFields();
  await context.globalState.update(cacheNameV110, fields);

  vscode.window.showInformationMessage("GDV fields have been cached.");

  return fields;
};

const resetFieldsCache = async (context) => {
  await context.globalState.update(cacheNameV110, []);

  vscode.window.showInformationMessage("The cache have been resetted.");
};

const downloadFields = async () => {
  try {
    const indexResponse = await axios({
      url: "http://www.gdv-online.de/vuvm/bestand/rel2018/samenue.html",
      method: "get"
    });

    const indexLinks = extractIndexLinks(indexResponse.data);

    const fieldsDict = {};
    for (let i = 0; i < indexLinks.length; i++) {
      const link = indexLinks[i];
      const response = await axios({
        url: link,
        method: "get",
        responseType: "arraybuffer",
        reponseEncoding: "binary"
      });

      const decoder = new TextDecoder("ISO-8859-1");
      const html = decoder.decode(response.data);

      extractFields(html, fieldsDict);
    }

    return Object.values(fieldsDict);
  } catch (error) {
    vscode.window.showErrorMessage(error.message);
    console.error(error);
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

const extractFields = (html, fieldsDict) => {
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
        const position = Number(fieldPosition);
        const length = Number(fieldLength);
        const field = {
          label: `${satzart}.${satznummer} - ${kapitel} / ${bezeichnung} - ${position}-${length} / ${fieldName}`,
          satzart: satzart,
          position: position,
          length: length,
          satznummer: satznummer
        };

        fieldsDict[field.label] = field;
      }
    }
  }
};

module.exports = {
  getFieldsCache,
  resetFieldsCache
};
