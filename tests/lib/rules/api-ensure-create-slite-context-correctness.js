const rule = require("../../../lib/rules/api-ensure-create-slite-context-correctness");

// eslint-disable-next-line node/no-unpublished-require
const { RuleTester } = require("eslint");
const ruleTester = new RuleTester({
  parserOptions: { ecmaVersion: 10, sourceType: "module" },
});

ruleTester.run("api-ensure-create-slite-context-correctness", rule, {
  valid: [
    {
      filename: "api/src/repositories/system-test-context.ts",
      code: `
export const SystemTestContext = createSliteContext(
  { type: SliteContextType.SYSTEM },
  async function SystemTestContext(_, input) {
    return input.n
  }
)
`,
    },
  ],
  invalid: [
    {
      filename: "api/src/repositories/system-test-context.ts",
      code: `
        const SystemTestContext = createSliteContext(
          { type: SliteContextType.SYSTEM },
          async function SystemTestContext(_, input) {
            return input.n
          }
        )
        `,
      errors: [{ message: rule.errors.mustBeExported }],
    },
    {
      filename: "api/src/repositories/i-am-a-table.ts",
      code: `
        export const Foobar = createSliteContext(
          { type: SliteContextType.SYSTEM },
          async function SystemTestContext(_, input) {
            return input.n
          }
        )
        `,
      errors: [
        { message: rule.errors.mustExportSameType },
        { message: rule.errors.mustHaveMatchingFilename },
        { message: rule.errors.mustHaveSameNameAsCallback },
      ],
    },
  ],
});
