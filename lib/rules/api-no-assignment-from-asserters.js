const errors = {
  noAssignmentFromAsserters: `Asserters are supposed to throw or do nothing but they are not supposed to return anything.
  Doing so could hide a future problem as we saw with the [Wrong privilege assignment on guest link invitation](https://slite.slite.com/app/docs/W3IxlN8RKSMurD).
  Either rename the function to be more explicit about what it does or fetch the thing you want in another function.
  `,
};

const ASSIGNMENT_AST = ['VariableDeclarator', 'AssignmentExpression']

module.exports = {
  meta: {
    fixable: "code",
    type: "problem",
  },

  errors,

  create(context) {
    return {
      CallExpression(node) {
        const callName = node.callee?.name
        if(!callName || !callName.startsWith('assert')){
          return
        }

        if(ASSIGNMENT_AST.includes(node.parent?.type) || (node.parent?.type === 'AwaitExpression' && ASSIGNMENT_AST.includes(node.parent.parent?.type))) {
          context.report({
            node,
            message: module.exports.errors.noAssignmentFromAsserters
          });
        }
    }
    };
  },
};
