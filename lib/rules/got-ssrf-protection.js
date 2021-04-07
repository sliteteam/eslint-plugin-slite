function lookForGotSSRFFunction(node) {
  const [, options] = node.arguments;
  return (
    !!options &&
    !!options.callee &&
    ["gotSSRFProtected", "gotSSRFUnprotected"].includes(options.callee.name)
  );
}

function set(cache, context, key, value) {
  if (context.getFilename() !== cache.previousFilename) {
    delete cache.save[cache.previousFilename];
    cache.previousFilename = context.getFilename();
    cache.save[context.getFilename()] = {};
  }
  cache.save[context.getFilename()][key] = value;
}

function get(cache, context, key, fallback) {
  if (cache.save[context.getFilename()]) {
    return cache.save[context.getFilename()][key]
      ? cache.save[context.getFilename()][key]
      : fallback;
  }
  return fallback;
}

module.exports = {
  meta: {
    fixable: "code",
    type: "problem",
  },

  create(context) {
    const cache = {
      previousFilename: undefined,
      save: {},
    };

    return {
      ImportDeclaration(node) {
        if (
          node.source.type === "Literal" &&
          node.source.value === "got" &&
          node.specifiers[0].type === "ImportDefaultSpecifier"
        ) {
          set(cache, context, "importedGot", node.specifiers[0].local.name);
        }
      },
      CallExpression(node) {
        if (
          node.callee.name === "require" &&
          node.arguments[0].value === "got" &&
          node.parent.id.type === "Identifier"
        ) {
          return set(cache, context, "importedGot", node.parent.id.name);
        }

        const got = get(cache, context, "importedGot", "got");
        if (
          node.callee.name === got ||
          (node.callee.object &&
            node.callee.object.name === got &&
            node.callee.type === "MemberExpression" &&
            !node.callee.property.name.startsWith("mock"))
        ) {
          const expliciteProtection = lookForGotSSRFFunction(node);

          if (!expliciteProtection) {
            context.report({
              node: node.callee,
              message:
                `got calls should explicitly specify if they should be protected against SSRF` +
                " with gotSSRFProtected or gotSSRFUnprotected function from helpers/ssrfProtection",
            });
          }
        }
      },
    };
  },
};
