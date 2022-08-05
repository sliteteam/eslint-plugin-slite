const rule = require("../../../lib/rules/api-enforce-create-slite-context-usage");

const { RuleTester } = require("eslint");
const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 10, sourceType: "module" }, });

const errors = [
  {
    message: rule.errorMessage,
  },
];

ruleTester.run("api-enforce-create-slite-context-usage", rule, {
  valid: [
    {
      filename: "src/contexts/activity-registry/user-acknowledge-channel-activity.ts",
      code: `
        import { Services } from '../../services'
        async function UserAcknowledgeChannelActivityCallback(services, { channelId }) {
          
        }
        
        export const UserAcknowledgeChannelActivity = createSliteContext(
          { type: SliteContextType.USER, permissionsAsserters: [assertCanReadChannelId] },
          UserAcknowledgeChannelActivityCallback
        )
      `,
    },
    {
      filename: "src/contexts/activity-registry/__tests__/user-acknowledge-channel-activity.spec.ts",
      code: `
        describe('UserAcknowledgeChannelActivity', () => {
          
        })
      `,
    },
    {
      filename: "src/contexts/activity-registry/utils.ts",
      code: `
        export async function UserAcknowledgeChannelActivity(services, { channelId }) {
            
        }
      `,
    },
    {
      filename: "src/contexts/activity-registry/user-acknowledge-channel-activity.spec.ts",
      code: `
        describe('UserAcknowledgeChannelActivity', () => {
            
        })
      `,
    },
  ],
  invalid: [
    {
      filename: "src/contexts/activity-registry/user-acknowledge-channel-activity.ts",
      code: `
        import { Services } from '../../services'
        export async function UserAcknowledgeChannelActivity(services, { channelId }) {
          
        }
      `,
      errors
    },
    {
      filename: "src/contexts/activity-registry/system-acknowledge-channel-activity.ts",
      code: `
        export async function SystemAcknowledgeChannelActivity(services, { channelId }) {
          
        }
      `,
      errors
    },
    {
      filename: "src/contexts/activity-registry/public-sharing-acknowledge-channel-activity.ts",
      code: `
        export async function PublicSharingAcknowledgeChannelActivity(services, { channelId }) {
          
        }
      `,
      errors
    },
    {
      filename: "src/contexts/activity-registry/anonymous-acknowledge-channel-activity.ts",
      code: `
        export async function AnonymousAcknowledgeChannelActivity(services, { channelId }) {
          
        }
      `,
      errors
    },
  ],
});
