const errorMessage = `🚨 Are you sure you need the unsafe version of this function ?

\`unsafe\` repository functions usage should be restricted to internal usage (via Forest), scheduled global tasks or very specific public related contexts

Indeed, these functions are not scoped with the concerned \`organizationId\` so it could lead to vulnerabilities in
our horizontal segmentation (an attacker could access data across organizations).

Always try to find a way to retrieve \`organizationId\` for which you are doing the current action.

From a \`USER\` context, you can use:

\`\`\`
const {
  userId,
  organizationId,
} = services.permissions.getAuthenticatedUserAndOrganizationId()
\`\`\`


From a \`SYSTEM\` context, you could surely find \`organizationId\` attached to some already resolved PG Objects.

⚠️ If you still need to use it, please add a comment to explain why as security team may have a second look.
`;

module.exports = {
  meta: {
    fixable: "code",
    type: "problem",
  },

  errorMessage,

  create(context) {
    return {
      CallExpression(node) {
        if(node.callee.name.startsWith('unsafe')){
          context.report({
            node: node.callee,
            message: errorMessage,
          });
        }
      },
    };
  },
};
