const rule = require("../../../lib/rules/no-unchecked-drop-migrations");

// eslint-disable-next-line node/no-unpublished-require
const { RuleTester } = require("eslint");
const ruleTester = new RuleTester();

const errors = [
  {
    message: `🚨 This will perform a destructive operation on the database
Have you made sure that the code relying on this is already removed and shipped into production?
Please make sure of that first, and then feel free to mark this rule as ignored to move forward.

See documentation: https://slite.slite.com/app/channels/-KVU-RnkHfQaEvkG_xi2/notes/DdBYshN1y1
`,
  },
];

ruleTester.run("no-unchecked-drop-migrations", rule, {
  valid: [
    {
      code: `queryInterface.whatever()`,
    },
  ],
  invalid: [
    {
      code: `queryInterface.removeColumn('table', 'column')`,
      errors,
    },
    {
      code: `queryInterface.dropTable('table', 'column')`,
      errors,
    },
  ],
});
