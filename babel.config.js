module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      "module-resolver",
      {
        "root": "./",
        "extensions": [".ios.js", ".android.js", ".web.js", ".js", ".json"],
        "alias": {
          "~": "./src",
        }
      }
    ]
  ],
};
