const message = `🚨 Do not use the functional isEditorVariant() after plugin/editor creation;
  -> use query editor.isEditorVariant(), or in components call hook useEditorVariants() 
`;

module.exports = {
  meta: {
    fixable: "code",
    type: "problem",
  },
  message,

  create(context) {
    return {
      CallExpression(node) {
        const isCheckEditorVaraint = (
          node.callee.name === 'isEditorVariant'
        )

        if (!isCheckEditorVaraint) {
          return;
        }

        const isUsingEditorQuery = (
          node.callee.type === 'MemberExpression' &&
          node.callee.object &&
          node.callee.object.name === 'editor'
        )

        if (isUsingEditorQuery) {
          return;
        }

        // traverse scopes upward to check for editor instance 
        let scope = context.getScope()
        let isEditorInScope = false

        while (scope && !isEditorInScope) {
          isEditorInScope = scope.variables.some((variable) => {
            return variable.name === 'editor'
          }) 
          scope = scope.upper
        }

        if (isEditorInScope) {
          context.report({ node, message }); 
        }
         
      },
    };
  },
};
