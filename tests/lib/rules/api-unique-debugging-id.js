const rule = require("../../../lib/rules/api-unique-debugging-id");

const { RuleTester } = require("eslint");
const ruleTester = new RuleTester();

const nonObject = `
generateUniqueDebuggingId("id", { filename: __filename, id: "id-1" })
`;
const noArgument = `
generateUniqueDebuggingId()
`;
const filenameTypo = `
generateUniqueDebuggingId({ filenme: __filename, id: "id-1" })
`;
const filenameTypoBis = `
generateUniqueDebuggingId({ filename: _filename, id: "id-1" })
`;

const idTypo = `
generateUniqueDebuggingId({ filename: __filename, d: "id-1" })
`;
const idNonLiteral = `
generateUniqueDebuggingId({ filename: __filename, id: [1] })
`;
const nonUnique = `
generateUniqueDebuggingId({ filename: __filename, id: "id-1" })
generateUniqueDebuggingId({ filename: __filename, id: "id-1" })
`;
const validCode = `
generateUniqueDebuggingId({ filename: __filename, id: "id-1" })
`;
const anotherFunctionCode = `
log({ filename: __filename, id: "id-1" })
`;

ruleTester.run("api-unique-debugging-id", rule, {
  valid: [{ code: validCode }, { code: anotherFunctionCode }],
  invalid: [
    {
      code: nonObject,
      errors: [
        {
          messageId: "oneObjectArgument",
        },
      ],
    },
    {
      code: noArgument,
      errors: [
        {
          messageId: "oneObjectArgument",
        },
      ],
    },
    {
      code: filenameTypo,
      errors: [
        {
          messageId: "noFilename",
        },
      ],
    },
    {
      code: filenameTypoBis,
      errors: [
        {
          messageId: "noFilename",
        },
      ],
    },
    {
      code: idTypo,
      errors: [
        {
          messageId: "noId",
        },
      ],
    },
    {
      code: idNonLiteral,
      errors: [
        {
          messageId: "nonLiteralId",
        },
      ],
    },
    {
      code: nonUnique,
      errors: [
        {
          messageId: "nonUniqueId",
          data: {
            nonUniqueValue: "id-1",
          },
        },
      ],
    },
  ],
});
