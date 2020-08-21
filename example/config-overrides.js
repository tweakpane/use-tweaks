const {
  addWebpackAlias,
  removeModuleScopePlugin,
  babelInclude,
  override,
} = require("customize-cra");
const path = require("path");

module.exports = (config, env) => {
  config.resolve.extensions = [...config.resolve.extensions, ".ts", ".tsx"];
  return override(
    removeModuleScopePlugin(),
    babelInclude([
      path.resolve("src"),
      path.resolve("../../src"),
      path.resolve("../../dist"),
    ]),
    addWebpackAlias({
      react: path.resolve("node_modules/react"),
      "react-dom": path.resolve("node_modules/react-dom"),
    })
  )(config, env);
};
