const { resetFieldsCache } = require("./fields-cache");

const resetCacheCommand = async (context) => {
  await resetFieldsCache(context);
};

module.exports = {
  resetCacheCommand
};
