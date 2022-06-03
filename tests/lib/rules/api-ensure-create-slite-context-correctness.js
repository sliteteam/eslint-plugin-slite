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
    async function SystemTestContextCallback(_, input) {
      return input.n
    }
    export const SystemTestContext = createSliteContext(
      { type: SliteContextType.SYSTEM },
      SystemTestContextCallback
    )
    `,
    },
    {
      filename: "api/src/repositories/user-test-context.ts",
      code: `
    async function UserTestContextCallback(_, input) {
      return input.n
    }
    export const UserTestContext = createSliteContext(
      { type: SliteContextType.USER },
      UserTestContextCallback
    )
    `,
    },
    {
      filename:
        "api/src/repositories/public-sharing-gets-collection-public-notes-connection.ts",
      code: `
    async function PublicSharingGetsCollectionPublicNotesConnectionCallback() {
      return input.n
    }

    export const PublicSharingGetsCollectionPublicNotesConnection = createSliteContext(
      { type: SliteContextType.PUBLIC_SHARING },
         PublicSharingGetsCollectionPublicNotesConnectionCallback
    )
    `,
    },
  ],
  invalid: [
    {
      filename: "api/src/repositories/system-test-context.ts",
      code: `
        async function SystemTestContextCallback(_, input) {
          return input.n
        }
        const SystemTestContext = createSliteContext(
          { type: SliteContextType.SYSTEM },
    	  SystemTestContextCallback
        )
        `,
      errors: [{ message: rule.errors.mustBeExported }],
    },
    {
      filename: "api/src/repositories/i-am-a-table.ts",
      code: `
        async function SystemTestContext(_, input) {
          return input.n
        }
        export const Foobar = createSliteContext(
          { type: SliteContextType.SYSTEM },
          SystemTestContext
        )
        `,
      errors: [
        { message: rule.errors.mustExportSameType },
        { message: rule.errors.mustHaveMatchingFilename },
        { message: rule.errors.mustHaveACallbackName },
      ],
    },
    {
      filename: "api/src/repositories/system-test-context.ts",
      code: `
      export const SystemTestContext = createSliteContext(
        { type: SliteContextType.SYSTEM },
        async function SystemTestContextCallback(_, input) {
          return input.n
        }
      )`,
      errors: [
        { message: rule.errors.mustDefineCallbackOutsideOfWrapper },
        { message: rule.errors.mustHaveACallbackName },
      ],
    },
  ],
});
