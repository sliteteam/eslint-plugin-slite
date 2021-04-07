module.exports = {
  meta: {
    fixable: "code",
    type: "problem",
  },

  create(context) {
    return {
      VariableDeclarator(node) {
        if (
          node.id &&
          node.id.name &&
          node.id.name.match(/^[_A-Z]+$/g) &&
          node.init &&
          (["ObjectExpression", "ArrayExpression"].includes(node.init.type) ||
            (node.init.type === "CallExpression" &&
              (!node.init.callee ||
                !node.init.callee.object ||
                !node.init.callee.property ||
                node.init.callee.object.name !== "Object" ||
                node.init.callee.property.name !== "freeze")))
        ) {
          context.report({
            node,
            message: `Constant ${node.id.name} should be frozen (Object.freeze) to prevent mutation of this constant.`,
          });
        }
      },
    };
  },
};
