const { basename } = require('path')

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function camelize(text) {
  return text.replace(/^([A-Z])|[\s-_]+(\w)/g, function(match, p1, p2, offset) {
      if (p2) return p2.toUpperCase();
      return p1.toLowerCase();        
  });
}

const errorMessage = `🚨 Please use createSliteContext helper to build your context.

It help avoiding missing security checks and add useful logs.

Example:
\`\`\`
async function UserAcknowledgeChannelActivityCallback(services, { channelId }) {
          
}

export const UserAcknowledgeChannelActivity = createSliteContext(
  { type: SliteContextType.USER, permissionsAsserters: [assertCanReadChannelId] },
  UserAcknowledgeChannelActivityCallback
)
\`\`\`
`
function findContextTypeFromFileName(filename) {
  const [type] = filename.split('-')
  if (type === 'user') {
    return {pascalCase: 'User', contextType: 'USER'}
  }
  if (type === 'public') {
    return {pascalCase: 'PublicSharing', contextType: 'PUBLIC_SHARING'}
  }
  if (type === 'anonymous') {
    return {pascalCase: 'Anonymous', contextType: 'ANONYMOUS'}
  }
  if (type === 'system') {
    return {pascalCase: 'System', contextType: 'SYSTEM'}
  }
  return null
}

function isContext(filepath){
  if(filepath.includes('/__tests__/') || filepath.includes('.spec.')){
    return false
  }
  const fileName = basename(filepath, filepath.split('.').pop())
  const type = findContextTypeFromFileName(fileName)
  return type !== null
}

module.exports = {
  meta: {
    type: 'suggestion',
    hasSuggestions: true,
  },

  errorMessage,

  create(context) {
    let foundCreateSliteContextUsage = false
    let serviceAlreadyImported = false
    return {
      ImportDeclaration(node){
        if(serviceAlreadyImported === false){
          serviceAlreadyImported = Boolean(context.getDeclaredVariables(node).find(({name}) => name === 'Services'))
        }
      },
      VariableDeclaration(node) {
        if(foundCreateSliteContextUsage === false){
          const isCreateSliteContext = node.declarations[0]?.init?.callee?.name === "createSliteContext";

          if (isCreateSliteContext) {
            foundCreateSliteContextUsage = true
          }
        }
      },
      onCodePathEnd(codePath, node) {
        const filepath =context.getFilename()
        if(node.type === 'Program' && isContext(filepath) && foundCreateSliteContextUsage === false) {
          const loc = {
            start: {line: node.loc.end.line, column: 0},
            end: {line: node.loc.end.line + 1, column: 0}
          }

          context.report({
            loc,
            message: errorMessage,
            suggest:[
              {
                desc: 'Use createSliteContext.',
                fix: function(fixer) {
                  const filename = basename(filepath).split('.').shift()
                  const {pascalCase, contextType} = findContextTypeFromFileName(filename)
                  
                  const name = capitalizeFirstLetter(camelize(filename.split('-').slice(1).join('-')))

                  const fixedCode = `
async function ${pascalCase}${name}Callback(services: Services){

}

export const ${pascalCase}${name} = createSliteContext(
  { type: SliteContextType.${contextType} },
  ${pascalCase}${name}Callback
)
`
                  const filepathAfterContext = filepath.split('/contexts/').pop()
                  const pathToSrc = filepathAfterContext.split('/').map(() => '..').join('/')
                  const importCode = [`import { createSliteContext, SliteContextType } from '${pathToSrc}/helpers/contexts'`]
                  if(!serviceAlreadyImported){
                    importCode.push(`import { Services } from '${pathToSrc}/services'`)
                  }
                  importCode.push('')

                  return [fixer.insertTextBefore(node, importCode.join('\n')), fixer.insertTextAfter(node, fixedCode)]
                }
              }
            ]
            
          });
        }
      },
    }
  },
}
