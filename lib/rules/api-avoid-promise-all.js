const path = require("path");

const errorMessage = `🚨 Have you checked that this is safe?

Promise.all will allow to run several promises concurrently and whilst great in many uses cases, it can be quite detrimental in some situations.

In the case of API, because we are limited in the number of established database connections, we need to be careful about the volume of operations being made concurrently.

Our PSQL connection pool is limited to share those connections between all of the API processes, so unchecked Promise.all calls could easily deplete the pool and slow down the event loop dramatically.

ℹ️ You have two ways of fixing this:
- Doing your loads in sequential calls to load X items per call until you have what you need.
- Querying in bulk instead of making several single queries.

\`\`\`
const userIdList = Array(3000)
  .fill(null)
  .map((_) => Math.random());

// bulk load example
const users = await findUsersByIdList({ userIdList })

// pagination example

const userPages = paginate(50, userIdList)
const users = []
for (const page of userPages) {
	users.push(...await findUsers(...page))
}
\`\`\`

⚠️ Ignore only if absolutely sure about what you're doing but ideally this should be avoided.
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
