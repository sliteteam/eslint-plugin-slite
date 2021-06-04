module.exports = {
  meta: {
    fixable: "code",
    type: "problem",
  },

  create(context) {
    return {
      MemberExpression(node) {
        if (
          ["removeColumn", "dropTable", "renameColumn"].includes(
            node.property.name
          )
        ) {
          context.report({
            node: node,
            message: `🚨 This will perform a destructive operation on the database
Have you made sure that the code relying on this is already removed and shipped into production?
Please make sure of that first, and then feel free to mark this rule as ignored to move forward.

See documentation: https://slite.slite.com/app/channels/-KVU-RnkHfQaEvkG_xi2/notes/DdBYshN1y1
`,
          });
        }
      },
    };
  },
};
