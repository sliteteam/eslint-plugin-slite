const path = require("path");

const errors = {
  mustExportSameType: `The name of the exported function must be aligned with the type option value.

ℹ️ Example:

async function UserSaysHiCallback(services: Services) {
  services.logger.info('Hi')
}

export const UserSaysHi = createSliteContext(
  { type: SliteContextType.USER }, // <-- Ok because the type and the function both start with 'user'
  UserSaysHiCallback
)`,
  mustBeExported: `Please export this context to make it usable outside.`,
  mustHaveMatchingFilename: `Context modules are expected to have the same name (snake case) as the context function they export.

ℹ️ Example:

// system-says-hi.ts
async function SystemSaysHiCallback(services: Services) {
  services.logger.info('hi')
}

export const SystemSaysHi = createSliteContext(
  { type: SliteContextType.SYSTEM },
  SystemSaysHiCallback
)`,
  mustHaveACallbackName: `For observability purposes the callback and exported function must follow the following rules:

- the callback must be the context name suffixed with "Callback"
- the exported function must be the callback name without "Callback" suffix

ℹ️ Example:

async function SystemDoesSomething(services: Services) {
  services.logger.info('did something')
}

export const SystemDoesSomething = createSliteContext(
  { type: SliteContextType.SYSTEM },
  SystemDoesSomethingCallback
)`,

  mustDefineCallbackOutsideOfWrapper: `For typing purposes the callback function must be defined outside of the wrapper.

In order for the wrapper to infer types properly it relies on the function receiving '...args: any[]' as arguments.
Because of that, it would allow untyped arguments in the callback if specified directly in the wrapper.
Defining the callback outside of the wrapper will let typescript verify that every argument is properly typed and not assumed to be 'any' automatically.

ℹ️ Example:

// would fail because services would implicitely have 'any' type.
// Albeit a bit annoying, this brings more type safety.
async function SystemDoesSomething(services) {
  services.logger.info('did something')
}

export const SystemDoesSomething = createSliteContext(
  { type: SliteContextType.SYSTEM },
  SystemDoesSomethingCallback
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
          node.declarations[0]?.init.arguments?.[1].name;
        const startsWithSameType = contextName
          .toLowerCase()
          .startsWith(
            contextTypeProperty?.toLowerCase().replace(/(\-|\_)/g, "")
          );
        const callbackType = node.declarations[0]?.init.arguments?.[1]?.type;
        const callbackTypeIsFunction = [
          "ArrowFunctionExpression",
          "FunctionExpression",
        ].includes(callbackType);

        /**
         * Contexts must have a slugified version of the context name for filename
         */
        const fileNameMatchesContextName =
          basename.split(".").shift() === slugify(contextName);
        const contextCallbackNameIsAsExpected =
          `${contextName}Callback` === contextCallbackName;

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

        if (callbackTypeIsFunction) {
          context.report({
            node,
            message: errors.mustDefineCallbackOutsideOfWrapper,
          });
        }

        if (!fileNameMatchesContextName) {
          context.report({
            node,
            message: errors.mustHaveMatchingFilename,
          });
        }

        if (!contextCallbackNameIsAsExpected) {
          context.report({
            node,
            message: errors.mustHaveACallbackName,
          });
        }
      },
    };
  },
};
