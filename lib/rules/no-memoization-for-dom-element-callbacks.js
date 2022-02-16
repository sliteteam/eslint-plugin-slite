const message = `⚠️ There is no benefit to memoizing callbacks to DOM elements
  https://github.com/facebook/react/issues/17055
`

function isReactMemoizedCallback(node) {
  if (!node.init || !node.init.callee) {
    return false
  }
  const { callee } = node.init
  return (
    callee.name === 'useCallback' ||
    (callee.type === 'MemberExpression' &&
      callee.object.name === 'React' &&
      callee.property.name === 'useCallback')
  )
}

function jsxAttributeIsDOMNode(node) {
  const tag = node.parent.name.name
  return (tag && typeof tag === 'string' && tag[0] !== tag[0].toUpperCase())
}

module.exports = {
  meta: {
    fixable: "code",
    type: "problem",
  },
  message,

  create(context) {
    return {
      JSXAttribute(node) {
        if (!jsxAttributeIsDOMNode(node)) { 
          // This is a Component, not a DOM node
          return
        }

        if (!node.value || !node.value.expression) {
          return
        }

        if (node.name.name === 'ref') {
          // memoizing a ref function makes sense
          return
        }

        const name = node.value.expression.name

        // traverse scopes upward to check for variable declaration
        let scope = context.getScope()
        let variableDefinition = null

        while (scope && !variableDefinition) {
          variableDefinition = scope.variables.find((variable) => 
            variable.name === name &&
            variable.defs &&
            variable.defs[0] &&
            variable.defs[0].node 
          )
          scope = scope.upper
        }

        if (!variableDefinition) {
          return
        }

        if (!isReactMemoizedCallback(variableDefinition.defs[0].node)) {
          return
        }

        // check if this variabe is used in multiple places, and another is valid
        const hasOtherValidUse = variableDefinition.references.some((reference) => {
          if (
            reference.identifier.parent.type === 'JSXExpressionContainer' &&
            reference.identifier.parent.parent.type === 'JSXAttribute'
          ) {
            if (!jsxAttributeIsDOMNode(reference.identifier.parent.parent)) {
              // supplied to a custom component
              return true
            }
          } else if (reference.identifier.parent.type !== 'VariableDeclarator') {
            // some other invocation in the component, outside jsx
            return true 
          }
        })

        if (hasOtherValidUse) {
          return
        }

        context.report({
          node,
          message
        })
      },
    }
  },
}
