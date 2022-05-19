const rule = require("../../../lib/rules/api-unique-debugging-id");

const { RuleTester } = require("eslint");
const ruleTester = new RuleTester();

const nonObject = `
uniqueDebuggingId("id", { filename: __filename, id: "id-1" })
`
const noArgument = `
uniqueDebuggingId()
`
const filenameTypo = `
uniqueDebuggingId({ filenme: __filename, id: "id-1" })
`
const filenameTypoBis = `
uniqueDebuggingId({ filename: _filename, id: "id-1" })
`

const idTypo  =`
uniqueDebuggingId({ filename: __filename, d: "id-1" })
`
const idNonLiteral = `
uniqueDebuggingId({ filename: __filename, id: [1] })
`
const nonUnique = `
uniqueDebuggingId({ filename: __filename, id: "id-1" })
uniqueDebuggingId({ filename: __filename, id: "id-1" })
`
const validCode = `
uniqueDebuggingId({ filename: __filename, id: "id-1" })
`
const anotherFunctionCode = `
log({ filename: __filename, id: "id-1" })
`

ruleTester.run("api-unique-debugging-id", rule, {
  valid: [ {code: validCode}, { code: anotherFunctionCode } ],
  invalid: [
    {
      code: nonObject,
      errors: [{
        messageId: 'oneObjectArgument',
      }],
    },
    {
      code: noArgument,
      errors: [{
        messageId: 'oneObjectArgument'
      }]
    },
    {
      code: filenameTypo,
      errors: [{
        messageId: 'noFilename'
      }]
    },
    {
      code: filenameTypoBis,
      errors: [{
        messageId: 'noFilename'
      }]
    },
    {
      code: idTypo,
      errors: [{
        messageId: 'noId'
      }]
    },
    {
      code: idNonLiteral,
      errors: [{
        messageId: 'nonLiteralId'
      }]
    },
    {
      code: nonUnique,
      errors: [{
        messageId: 'nonUniqueId',
        data: {
          nonUniqueValue: "id-1"
        }
      }]
    },
  ],
});
