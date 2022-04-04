const vscode = require("vscode");

const { getFieldsCache } = require("./fields-cache");

const detectFieldCommand = async (context) => {
  const fields = await getFieldsCache(context);
};

module.exports = {
    detectFieldCommand
};
