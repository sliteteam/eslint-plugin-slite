const rule = require("../../../lib/rules/api-avoid-empty-permissions-asserters");

const { RuleTester } = require("eslint");
const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 10 } });

const errors = [
  {
    message: rule.errorMessage,
  },
];

ruleTester.run("api-avoid-empty-permissions-asserters", rule, {
  valid: [
    {
      code: `
      const UserAcknowledgesNoteActivity = createSliteContext(
        { type: SliteContextType.USER, permissionsAsserters: [assertCanReadNoteId] },
        UserAcknowledgesNoteActivityCallback
      )      
      `,

      code: `
      const SystemAcknowledgesNoteActivity = createSliteContext(
        { type: SliteContextType.SYSTEM },
        SystemAcknowledgesNoteActivityCallback
      )      
      `,
    },
  ],
  invalid: [
    {
      code: `
      const UserAcknowledgesNoteActivity = createSliteContext(
        { type: SliteContextType.USER, permissionsAsserters: [] },
        UserAcknowledgesNoteActivityCallback
      )      
      `,
      errors,
    },
  ],
});
