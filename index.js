module.exports = {
  rules: {
    "got-ssrf-protection": require("./lib/rules/got-ssrf-protection"),
    "no-insecure-window-open": require("./lib/rules/no-insecure-window-open"),
    "no-mutable-constant-object": require("./lib/rules/no-mutable-constant-object"),
    "no-unchecked-drop-migrations": require("./lib/rules/no-unchecked-drop-migrations"),
    "api-avoid-dangerous-promises": require("./lib/rules/api-avoid-dangerous-promises"),
    "api-ensure-create-slite-context-correctness": require("./lib/rules/api-ensure-create-slite-context-correctness"),
    "api-ensure-repositories-are-scoped-by-organizationId": require("./lib/rules/api-ensure-repositories-are-scoped-by-organizationId"),
    "no-functional-editor-variant-check": require("./lib/rules/no-functional-editor-variant-check"),
    "no-memoization-for-dom-element-callbacks": require("./lib/rules/no-memoization-for-dom-element-callbacks"),
    "api-unique-debugging-id": require("./lib/rules/api-unique-debugging-id"),
    "api-ensure-transaction-is-passed-to-sequelize": require("./lib/rules/api-ensure-transaction-is-passed-to-sequelize"),
    "api-avoid-empty-permissions-asserters": require("./lib/rules/api-avoid-empty-permissions-asserters"),
    "api-avoid-unsafe-function": require("./lib/rules/api-avoid-unsafe-function"),
    "api-enforce-create-slite-context-usage": require("./lib/rules/api-enforce-create-slite-context-usage"),
    "api-no-assignment-from-asserters": require("./lib/rules/api-no-assignment-from-asserters"),
  },
};
