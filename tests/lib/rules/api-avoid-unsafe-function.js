const rule = require("../../../lib/rules/api-avoid-unsafe-function");

const { RuleTester } = require("eslint");
const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 10 } });

const errors = [
  {
    message: rule.errorMessage,
  },
];

ruleTester.run("api-avoid-unsafe-function", rule, {
  valid: [
    {
      code: `
      async function context() {
        const note = await findNoteById(services, { noteId })
      }
      `,
    },
  ],
  invalid: [
    {
      code: `
      async function context() {
        const note = await unsafeFindNoteById(services, { noteId })
      }
      `,
      errors,
    },
  ],
});
