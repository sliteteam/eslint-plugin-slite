const rule = require("../../../lib/rules/api-file-scoped-unique-id");

// eslint-disable-next-line node/no-unpublished-require
const { RuleTester } = require("eslint");
const ruleTester = new RuleTester();

const nonObject = `
fileScopedUniqueId("id", { filename: __filename, id: "id-1" })
`
const noArgument = `
fileScopedUniqueId()
`
const filenameTypo = `
fileScopedUniqueId({ filenme: __filename, id: "id-1" })
`
const filenameTypoBis = `
fileScopedUniqueId({ filename: _filename, id: "id-1" })
`

const idTypo  =`
fileScopedUniqueId({ filename: __filename, d: "id-1" })
`
const idNonLiteral = `
fileScopedUniqueId({ filename: __filename, id: [1] })
`
const nonUnique = `
fileScopedUniqueId({ filename: __filename, id: "id-1" })
fileScopedUniqueId({ filename: __filename, id: "id-1" })
`
const validCode = `
fileScopedUniqueId({ filename: __filename, id: "id-1" })
`
const anotherFunctionCode = `
log({ filename: __filename, id: "id-1" })
`

ruleTester.run("api-file-scoped-unique-id", rule, {
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
