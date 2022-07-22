const errorMessage = `🚨 Are you sure you don't need any permissions asserters ?

Most of the USER or PUBLIC_SHARING contexts represent actions on some objects (note, discussion, channel...) done by a specific user.

First thing we should think about is: Is the user allowed to execute this action ?

Based on the parameter names of your context you should get an idea of what permission you should check.

Ex: \`commentId\`, is the user allowed to act on this \`commentId\` ?

Fortunately we already have plenty of generic asserters in \`src/helpers/permissions.ts\`, don't hesitate to have a look.

In our example you can use \`assertCanActOnCommentId\` which will retrieve the thread of the comment 
and then check for the read permission on the note of the thread.

Of course you can chain multiple generic asserters together to cover every parameters.

Ex:

\`\`\`
async function UserMovesNotesToChannelCallback(
  services: Services,
  {
    noteIdList,
    channelId,
  }: {
    noteIdList: PGNote['id'][]
    channelId: PGChannel['id']
  }
) 

[...]

export const UserMovesNotesToChannel = createSliteContext(
  {
    type: SliteContextType.USER,
    wrapInTransaction: true,
    permissionsAsserters: [
      assertCanWriteChannelId,
      assertCanManageNoteIdList,
    ]
  }
)
\`\`\`

It could also be global organization permissions like \`assertCanManageOrganization\` or \`assertCanUpdateOrganization\`...

And of course there is some cases where there is no need to check for any permissions.

⚠️ If you specify an empty array, please add a comment to explain why as security team may have a second look.
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
        if(node.callee.name !== 'createSliteContext'){
          return
        }
        const emptyPermissionAssertersArgument = node.arguments[0].properties.find((property) => property.key.name === 'permissionsAsserters' && property.value.elements.length === 0)
        if(emptyPermissionAssertersArgument){
          context.report({
            node: node.callee,
            message: errorMessage,
          });
        }     
      },
    };
  },
};
