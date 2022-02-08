function findProperty(objectExpression, keyName){
  return objectExpression?.properties?.find(property => {
    return property.key?.name === keyName
  })
}

function isOrganizationIdUsed(objectExpression) {
  const whereProperty = findProperty(objectExpression, 'where')
  if(!whereProperty){
    return false
  }

  if(whereProperty.value.type === 'ObjectExpression'){
    const organizationIdWhereProperty = findProperty(whereProperty.value, 'organizationId')
    if(organizationIdWhereProperty){
      return true
    }
  }
  
  const includeProperty = findProperty(objectExpression, 'include')
  if(!includeProperty){
    return false
  }
  for(const includedModel of includeProperty.value.elements) {
    const organizationIdIsUsed = isOrganizationIdUsed(includedModel)
    if(organizationIdIsUsed) {
      return true
    }
  }
  return false
}

module.exports = {
  meta: {
    fixable: "code",
    type: "problem",
  },

  create(context) {
    return {
      CallExpression(node) {
        const callName = node.callee?.property?.name
        if(!callName){
          return
        }
        if(callName === 'findByPk'){
          return context.report({
            node,
            message:
              `findByPk should be used with extra care as it opens code to direct object access.
You should consider using findOne({where: {id, organizationId}}) instead (and add the more context you can like organizationId)`,
          }); 
        }

        const sequelizeProtectedCalls = ['findOne', 'findAll']
        if(sequelizeProtectedCalls.includes(callName)){
          if(callName.startsWith('find')){
            const organizationIdIsUsed = isOrganizationIdUsed(node.arguments[0])
            if(!organizationIdIsUsed){
              return context.report({
                node,
                message:
                  `${callName} should somehow use organizationId to scope the query to the organization.`,
              });
            }
          }
        }
      },
    };
  },
};
