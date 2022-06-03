const rule = require("../../../lib/rules/api-ensure-transaction-is-passed-to-sequelize");
const { RuleTester } = require("eslint");
const ruleTester = new RuleTester({
  parserOptions: { ecmaVersion: 10, sourceType: "module" },
});

ruleTester.run("ensure-repository-has-context", rule, {
  valid: [
    {
      code: `response.locals.services.metrics.increment('http_request')`
    },
    { 
      code: `
        PGNote.findOne({ transaction, where: {noteId, organizationId} })
      `
    },
    { 
      code: `
        services.db.sequelize.query('SELECT * FROM organizations', { transaction })
      `
    },
    { 
      code: `
        PGNoteDisplayOption.create({ noteId }, {
          transaction: services.transaction,
        })
      `
    },
    { 
      code: `
        const where = {noteId: 'noteId'};
        PGNote.upsert({
            organizationId: 'organizationId'
          },
          {
            transaction: services.transaction,
          }
        );
      `
    },
    { code:`
      PGDiscussionReply.update({id: testId}, {
        where: {
          id: replyId,
        },
        transaction,
      })
    `
    },
    { code:`
      PGDiscussionReply.findAll({
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
    `
    }
  ],
  invalid: [
    { 
      code: `
        PGNote.findOne({ where: {noteId, organizationId} })
      `,
      errors: [rule.errors.missingTransaction]
    },
    {
      code: `
        services.db.sequelize.query('SELECT * FROM organizations')
      `,
      errors: [rule.errors.missingTransaction]
    },
    { 
      code: `
        PGNoteDisplayOption.create({ noteId })
      `,
      errors: [rule.errors.missingTransaction]
    },
    { 
      code: `
        const where = {noteId: 'noteId'};
        PGNote.upsert({
          organizationId: 'organizationId'
          }, 
        );
      `,
      errors: [rule.errors.missingTransaction]
    },
    { code:`
      PGDiscussionReply.update(
        { id: 'testId' },
        {
          where: {
            id: 'replyId',
          },
        }
      )
    `,
      errors: [rule.errors.missingTransaction]
    },
    { code:`
      PGDiscussionReply.findAll({
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
    `,
    errors: [rule.errors.missingTransaction]
    }
  ],
});
