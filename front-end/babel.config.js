export default function (api) {
  api.cache(true);
  return {
    plugins: ['macros'],
  }
}