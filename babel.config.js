module.exports = function (api) {
  api.cache(true);

  return {
    presets: ['babel-preset-expo'],

    // Metro's built-in tsconfig-paths support already resolves "@/*" using
    // the ["./src/*", "./*"] fallback order in tsconfig.json. A module-resolver
    // alias here would hardcode "@" to a single root and break that fallback.
    plugins: ['react-native-worklets/plugin'],
  };
};
