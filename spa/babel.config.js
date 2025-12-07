// eslint-disable-next-line no-undef
module.exports = function (api) {
  api.cache(true);
  return {
    plugins: ['macros'],
  }
}