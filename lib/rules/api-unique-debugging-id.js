module.exports = {
  meta: {
    type: "problem",
    messages: {
      oneObjectArgument: `uniqueDebuggingId argument must be only one Object`,
      noFilename: `uniqueDebuggingId object argument must contain "filename: __filename"`,
      noId: `uniqueDebuggingId object argument must contain a key "id"`,
      nonLiteralId: `uniqueDebuggingId argument must contain an "id" as a string literal ("example-id" or 'example-id') to be statically analyzed.`,
      nonUniqueId: `uniqueDebuggingId "id" : "{{nonUniqueValue}}" already exists in this file.`,
    },
  },
  create(context) {
    const identifiers = new Set();
    return {
      CallExpression(node) {
        if (node.callee.type !== "Identifier" || node.callee.name !== "uniqueDebuggingId") {
          return;
        }
        if (node.arguments.length !== 1 || node.arguments[0].type !== "ObjectExpression") {
          context.report({
            node: node,
            messageId: "oneObjectArgument",
          });
          return;
        }
        const objectArgument = node.arguments[0];
        const filenameArgument = objectArgument.properties.find(
          (p) => p.type === "Property" && p.key.name === "filename" && p.value.type === "Identifier" && p.value.name === "__filename"
        );
        if (!filenameArgument) {
          context.report({ node: objectArgument, messageId: "noFilename" });
          return;
        }

        const idArgument = objectArgument.properties.find((p) => p.type === "Property" && p.key.name === "id");
        if (!idArgument) {
          context.report({ node: objectArgument, messageId: "noId" });
          return;
        }
        if (idArgument.value.type !== "Literal") {
          context.report({
            node: idArgument.value,
            messageId: "nonLiteralId"
          });
          return;
        }
        const idArgumentValue = idArgument.value.value;

        if (identifiers.has(idArgumentValue)) {
          context.report({
            node: idArgument.value,
            messageId: "nonUniqueId",
            data: {
              nonUniqueValue: idArgumentValue
            }
          });
          return;
        }
        identifiers.add(idArgumentValue);
      }
    };
  }
}
