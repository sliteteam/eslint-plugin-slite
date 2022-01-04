const path = require("path");

const errors = {
  mustExportSameType: `The name of the exported function must be aligned with the type option value.

ℹ️ Example:

export const UserSaysHi = createSliteContext(
  { type: SliteContextType.USER }, // <-- Ok because the type and the function both start with 'user'
  async function UserSaysHi(services: Services) {
    services.logger.info('Hi')
  }
)`,
  mustBeExported: `Please export this context to make it usable outside.`,
  mustHaveMatchingFilename: `Context modules are expected to have the same name (snake case) as the context function they export.

ℹ️ Example:

// system-says-hi.ts

export const SystemSaysHi = createSliteContext(
  { type: SliteContextType.SYSTEM },
  async function SystemSaysHi(services: Services) {
    services.logger.info('hi')
  }
)`,
  mustHaveSameNameAsCallback: `For observability purposes both the createSliteContext callback and the exported const must have the same name.

ℹ️ Example:

export const SystemDoesSomething = createSliteContext(
  { type: SliteContextType.SYSTEM },
  async function SystemDoesSomething(services: Services) {
    services.logger.info('did something')
  }
)`,
};

function slugify(name) {
  return name.replace(/[A-Z]/g, function toLowerSlug(match, index) {
    return `${index > 0 ? "-" : ""}${match}`.toLowerCase();
  });
}

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

        try {
          const isCreateSliteContext =
            node.declarations[0]?.init?.callee?.name === "createSliteContext";

          if (!isCreateSliteContext) {
            return;
          }

          const basename = path.basename(context.getFilename());
          const isExported = node.parent.type === "ExportNamedDeclaration";
          const contextName = node.declarations[0]?.id.name;
          const contextTypeProperty =
            // 👷 Much drilling
            node.declarations[0]?.init.arguments?.[0]?.properties?.filter(
              (property) => property.key.name === "type"
            )[0]?.value.property.name;
          const contextCallbackName =
            node.declarations[0]?.init.arguments?.[1]?.id.name;
          const startsWithSameType = contextName
            .toLowerCase()
            .startsWith(contextTypeProperty?.toLowerCase());

          /**
           * Contexts must have a slugified version of the context name for filename
           */
          const fileNameMatchesContextName =
            basename.split(".").shift() === slugify(contextName);

          if (!isExported) {
            context.report({
              node,
              message: errors.mustBeExported,
            });
          }

          if (!startsWithSameType) {
            context.report({
              node,
              message: errors.mustExportSameType,
            });
          }

          if (!fileNameMatchesContextName) {
            context.report({
              node,
              message: errors.mustHaveMatchingFilename,
            });
          }

          if (contextName !== contextCallbackName) {
            context.report({
              node,
              message: errors.mustHaveSameNameAsCallback,
            });
          }
        } catch (error) {
          console.log(error);
        }
      },
    };
  },
};
