function findProperty(objectExpression, keyName) {
  return objectExpression?.properties?.find((property) => {
    return property.key?.name === keyName
  })
}

function isTransactionUsed(objectExpression) {
  const transactionProperty = findProperty(objectExpression, 'transaction')
  if (transactionProperty) {
    return true
  }

  return false
}

module.exports = {
  errors: {
    missingTransaction: `You should always pass the services.transaction as transaction to sequelize in case the current function is wrapped in a transaction.`,
  },
  meta: {
    fixable: 'code',
    type: 'problem',
  },

  create(context) {
    return {
      CallExpression(node) {
        const callName = node.callee?.property?.name
        const objectName = node.callee?.object?.name
        if (
          !callName ||
          (!objectName &&
            callName !== 'query' &&
            node.callee?.object?.property?.name !== 'sequelize') ||
          (objectName && !objectName.startsWith('PG'))
        ) {
          return
        }

        const sequelizeProtectedCallsWithOneArgument = [
          'findOne',
          'findAll',
          'count',
          'findAndCountAll',
          'findOrBuild',
          'findOrCreate',
          'truncate',
          'destroy',
          'restore',
        ]
        if (sequelizeProtectedCallsWithOneArgument.includes(callName)) {
          const transactionIsUsed = isTransactionUsed(node.arguments[0])
          if (!transactionIsUsed) {
            return context.report({
              node,
              message: module.exports.errors.missingTransaction,
            })
          }
        }

        const sequelizeProtectedCallsWithTwoArguments = [
          'query',
          'create',
          'findByPk',
          'update',
          'upsert',
          'max',
          'min',
          'sum',
          'bulkCreate',
          'increment',
          'decrement',
        ]
        if (sequelizeProtectedCallsWithTwoArguments.includes(callName)) {
          const transactionIsUsed = isTransactionUsed(node.arguments[1])
          if (!transactionIsUsed) {
            return context.report({
              node,
              message: module.exports.errors.missingTransaction,
            })
          }
        }
      },
    }
  },
}
