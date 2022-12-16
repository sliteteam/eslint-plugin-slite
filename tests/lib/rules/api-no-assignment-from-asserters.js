const rule = require("../../../lib/rules/api-no-assignment-from-asserters");

const { RuleTester } = require("eslint");
const ruleTester = new RuleTester({
  parserOptions: { ecmaVersion: 10, sourceType: "module" },
});

ruleTester.run("api-no-assignment-from-asserters", rule, {
  valid: [
    {
      filename: "api/src/helpers/authentication.ts",
      code: `
      async function a(){
        await assertCanAutoJoin({
          services,
          loginData,
          organization,
        })
      }
    `,
    },
    {
      filename: "api/src/helpers/authentication.ts",
      code: `
      assertIsGuest({
        user,
      })
    `,
    },
  ],
  invalid: [
    {
      filename: "api/src/helpers/authentication.ts",
      code: `
      async function a(){
        const { joinToken, autoJoinMethod } = await assertCanAutoJoin({
          services,
          loginData,
          organization,
        })
      }
        `,
      errors: [{ message: rule.errors.noAssignmentFromAsserters }],
    },
    {
      filename: "api/src/helpers/authentication.ts",
      code: `
      const guest = assertIsGuest({
        user
      })
        `,
      errors: [{ message: rule.errors.noAssignmentFromAsserters }],
    },
    {
      filename: "api/src/helpers/authentication.ts",
      code: `
      let guest = null
      guest = assertIsGuest({
        user
      })
        `,
      errors: [{ message: rule.errors.noAssignmentFromAsserters }],
    },
    {
      filename: "api/src/helpers/authentication.ts",
      code: `
        async function a(){
          const guest = await assertIsGuest({
            user
          })
        }
        `,
      errors: [{ message: rule.errors.noAssignmentFromAsserters }],
    },
    {
      filename: "api/src/helpers/authentication.ts",
      code: `
      async function a(){
        const {guest} = await assertIsGuest({
          user
        })
      }
      
        `,
      errors: [{ message: rule.errors.noAssignmentFromAsserters }],
    },
  ],
});
