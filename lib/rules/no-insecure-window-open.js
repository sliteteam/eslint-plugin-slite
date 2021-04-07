const MANDATORY_FEATURES = ["noreferrer", "noopener"];

function isValidOptions(rawFeatures) {
  const features = rawFeatures.split(",").map((f) => f.trim());
  return MANDATORY_FEATURES.every((f) => features.includes(f));
}

module.exports = {
  meta: {
    fixable: "code",
    type: "problem",
  },

  create(context) {
    const message =
      "window.open should be called with `noreferrer` AND `noopener` for un-trusted URLs";

    return {
      CallExpression(node) {
        if (
          !node.callee.object ||
          node.callee.object.name !== "window" ||
          !node.callee.property ||
          node.callee.property.name !== "open"
        ) {
          return;
        }

        if (node.arguments.length < 3) {
          return context.report({ node, message });
        }

        const argument = node.arguments[2];
        switch (argument.type) {
          case "Literal": {
            if (!isValidOptions(node.arguments[2].value)) {
              context.report({ node, message });
            }
            return;
          }

          case "TemplateLiteral":
            // console.log(argument);
            const quasis = [...argument.quasis];
            let rawFeatures = "";

            if (quasis.length === 1) {
              if (!isValidOptions(quasis[0].value.cooked)) {
                context.report({ node, message });
              }
              return;
            }

            quasis.map((el) => {
              if (el.tail) {
                rawFeatures += el.value.cooked;
                return;
              }
              rawFeatures += el.value.cooked + "${}";
            });

            if (!isValidOptions(rawFeatures)) {
              context.report({ node, message });
            }
            return;

          default:
            throw new Error(`Unsupported type "${argument.type}"`);
        }
      },
    };
  },
};
