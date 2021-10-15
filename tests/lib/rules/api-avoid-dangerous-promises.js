const rule = require("../../../lib/rules/api-avoid-dangerous-promises");

async function invalidFunction() {
  return await Promise.all([]);
}

async function validFunction() {
  await Promise.resolve();
}

// eslint-disable-next-line node/no-unpublished-require
const { RuleTester } = require("eslint");
const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 10 } });

const errors = [
  {
    message: rule.errorMessage,
  },
];

ruleTester.run("api-avoid-dangerous-promises", rule, {
  valid: [
    {
      filename: "app/src/repositories/foobar.js",
      code: invalidFunction.toString(),
    },
    {
      filename: "app/src/repositories/foobar.js",
      code: validFunction.toString(),
    },
    {
      filename: "api/src/repositories/foobar.js",
      code: validFunction.toString(),
    },
  ],
  invalid: [
    {
      filename: "api/src/repositories/foobar.js",
      code: invalidFunction.toString(),
      errors,
    },
  ],
});
