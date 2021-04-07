const rule = require("../../../lib/rules/no-insecure-window-open");

const { RuleTester } = require("eslint");
const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 2018 } });

const ERROR_MSG_NOT_STYLED =
  "window.open should be called with `noreferrer` AND `noopener` for un-trusted URLs";

ruleTester.run("no-insecure-window.open", rule, {
  valid: [
    {
      code:
        'window.open("https://google.com", "_blank", "noreferrer,noopener")',
    },
    {
      code:
        'window.open("https://google.com", "_blank", `noreferrer,noopener`)',
    },
    {
      code:
        'window.open("https://google.com", "_blank", `noreferrer, noopener`)',
    },
    {
      code:
        'window.open("https://google.com", "_blank", `${unrelatedVar},noreferrer,noopener`)',
    },
  ],
  invalid: [
    {
      code: 'window.open("https://google.com", "_blank", "argument")',
      errors: [{ message: ERROR_MSG_NOT_STYLED }],
    },
    {
      code: 'window.open("https://google.com")',
      errors: [{ message: ERROR_MSG_NOT_STYLED }],
    },
    {
      code: 'window.open("https://google.com", "_blank")',
      errors: [{ message: ERROR_MSG_NOT_STYLED }],
    },
    {
      code: 'window.open("https://google.com", undefined)',
      errors: [{ message: ERROR_MSG_NOT_STYLED }],
    },
    {
      code: 'window.open("https://google.com", "_blank", `${unrelatedVar}`)',
      errors: [{ message: ERROR_MSG_NOT_STYLED }],
    },
  ],
});
