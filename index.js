module.exports = {
  rules: {
    "got-ssrf-protection": require("./lib/rules/got-ssrf-protection"),
    "no-insecure-window-open": require("./lib/rules/no-insecure-window-open"),
    "no-mutable-constant-object": require("./lib/rules/no-mutable-constant-object"),
    "no-unchecked-drop-migrations": require("./lib/rules/no-unchecked-drop-migrations"),
  },
};
