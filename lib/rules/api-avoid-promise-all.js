const path = require("path");

const errorMessage = `🚨 Have you checked that this is safe?

Using Promise.all in SQL calls can be dangerous for \`api\` as we have a limited number of available connections.

If this is used in contexts where volume is not controlled, we could end up doing a denial of service on ourselves.

Please disable this rule only if this is controlled and sure that we couldn't end up using that footgun ourselves.

\`\`\`
async function incorrectExample() {
  const userIdList = Array(3000)
    .fill(null)
    .map((_) => Math.random());
  const users = await Promise.all(userIdList.map((userId) => findUser(userId)));
}

// Correct
async function correctExample() {
  const userIdList = Array(3000)
    .fill(null)
    .map((_) => Math.random());

  const users = await findUserList({ userIdList });
}
\`\`\`
`;

module.exports = {
  meta: {
    fixable: "code",
    type: "problem",
  },

  errorMessage,

  create(context) {
    let shouldIgnore = false;

    return {
      Program(node) {
        const filename = context.getFilename();
        const absolutePath = path.resolve(filename);

        shouldIgnore = absolutePath.includes("api/src") === false;

        if (shouldIgnore) {
          return;
        }
      },

      /** JS files */
      MemberExpression(node) {
        if (shouldIgnore) {
          return;
        }

        const isPromiseAllCall =
          node.object.name === "Promise" && node.property.name === "all";

        if (isPromiseAllCall) {
          context.report({
            node,
            message: module.exports.errorMessage,
          });
        }
      },

      /** Typescript files */
      PropertyAccessExpression(node) {
        if (shouldIgnore) {
          return;
        }

        const isPromiseAllCall =
          node.expression.escapedText === "Promise" &&
          node.name.escapedText === "all";

        if (isPromiseAllCall) {
          context.report({
            node,
            message: module.exports.errorMessage,
          });
        }
      },
    };
  },
};
