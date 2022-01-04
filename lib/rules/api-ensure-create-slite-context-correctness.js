const path = require("path");

const errors = {
  mustBeExported: `Please export this context to make it usable outside.`,
  mustHaveSameNameAsCallback: `For observability purposes both the callback and the exported variable must have the same name.

ℹ️ Example:

export const SystemDoesSomething = createSliteContext(
  { type: SliteContextType.SYSTEM },
  async function SystemDoesSomething(services: Services) {
    services.logger.info('did something')
  }
)`,
};

module.exports = {
  meta: {
    fixable: "code",
    type: "problem",
  },

  errors,

  create(context) {
    let shouldIgnore = false;

    return {
      Program() {
        const filename = context.getFilename();
        const absolutePath = path.resolve(filename);

        shouldIgnore = absolutePath.includes("api/src") === false;

        if (shouldIgnore) {
          return;
        }
      },

      VariableDeclaration(node) {
        if (shouldIgnore) {
          return;
        }

        const isCreateSliteContext =
          node.declarations[0]?.init?.callee?.name === "createSliteContext";
        const isExported = node.parent.type === "ExportNamedDeclaration";

        if (!isCreateSliteContext) {
          return;
        }

        if (!isExported) {
          context.report({
            node,
            message: errors.mustBeExported,
          });
        }

        const contextName = node.declarations[0]?.id.name;
        const contextCallbackName =
          node.declarations[0]?.init.arguments[1]?.id.name;

        if (contextName !== contextCallbackName) {
          context.report({
            node,
            message: errors.mustHaveSameNameAsCallback,
          });
        }
      },
    };
  },
};
