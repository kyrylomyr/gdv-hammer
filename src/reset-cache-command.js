const cacheName = "gdv-fields-cache";

const resetCacheCommand = async (context) => {
  await context.globalState.update(cacheName, {});
};

module.exports = {
  resetCacheCommand
};
