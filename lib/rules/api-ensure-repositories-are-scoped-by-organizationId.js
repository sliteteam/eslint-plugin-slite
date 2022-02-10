function findProperty(objectExpression, keyName){
  return objectExpression?.properties?.find(property => {
    return property.key?.name === keyName
  })
}

function isOrganizationIdUsed(objectExpression) {
  const whereProperty = findProperty(objectExpression, 'where')
  if(whereProperty && whereProperty.value.type === 'ObjectExpression'){
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
  errors: {
    findByPk:
        `findByPk should be used with extra care as it opens code to direct object access.
You should consider using findOne({where: {id, organizationId}}) instead (and add the more context you can like organizationId)`,
    findOneAll: `findOne/findAll should somehow use organizationId to scope the query to the organization.
You can do SQL JOIN by using sequelize include option and even nested include.
By specifying "attributes:[]" in the include, the JOIN would only be used for filtering without returning the object.

ℹ️ Example:

// PGDiscussionReply is a child of PGThread which is a child of PGNote which contains organizationId

PGDiscussionReply.findOne({
  where: {
    id: replyId,
  },
  transaction,
  include: [
    {
      model: PGThread,
      required: true,
      include: [
        {
          model: PGNote,
          where: { organizationId },
          attributes: [],
          required: true,
        },
      ],
    },
  ],
})

// This would add the following INNER JOIN to the SQL query:

// INNER JOIN "threads" AS "thread"
// ON "PGDiscussionReply"."threadId" = "thread"."id"
// INNER JOIN "notes" AS "thread->note"
// ON "thread"."noteId" = "thread->note"."id" AND "thread->note"."organizationId" = 'organizationId'
`
  },
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
            message: module.exports.errors.findByPk,
          }); 
        }

        const sequelizeProtectedCalls = ['findOne', 'findAll']
        if(sequelizeProtectedCalls.includes(callName)){
          if(callName.startsWith('find')){
            const organizationIdIsUsed = isOrganizationIdUsed(node.arguments[0])
            if(!organizationIdIsUsed){
              return context.report({
                node,
                message: module.exports.errors.findOneAll,
              });
            }
          }
        }
      },
    };
  },
};
