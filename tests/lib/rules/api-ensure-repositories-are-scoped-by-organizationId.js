const rule = require("../../../lib/rules/api-ensure-repositories-are-scoped-by-organizationId");
const { RuleTester } = require("eslint");
const ruleTester = new RuleTester({
  parserOptions: { ecmaVersion: 10, sourceType: "module" },
});

ruleTester.run("ensure-repository-has-context", rule, {
  valid: [
    { 
      code: `
        PGNote.findOne({ transaction, where: {noteId, organizationId} })
      `
    },
    { 
      code: `
        PGNoteDisplayOption.findOne({
          where: { noteId },
          transaction: services.transaction,
          include: [{ model: PGNote, required: true, where: { organizationId }, attributes: [] }],
        })
      `
    },
    { 
      code: `
        const where = {noteId: 'noteId'};
        PGNote.findOne({
          where: {...where, organizationId: 'organizationId'},
          transaction: services.transaction,
        });
      `
    },
    { code:`
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
    `},
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
    `},
    {code: `
    async function context() {
      paginateFindAll(
        services,
        PGSyncedTiles,
        {
          where: {
            remoteId,
            organizationId,
          },
          transaction: services.transaction,
        }
      )
    }`}
  ],
  invalid: [
    {code: `
    async function context() {
      paginateFindAll(
        services,
        PGSyncedTiles,
        {
          where: {
            remoteId,
          },
          transaction: services.transaction,
        }
      )
    }
    `,
    errors: [rule.errors.findOneAll]
    },
    { code: `
        PGNote.findByPk(noteId, { transaction })
      `,
      errors: [rule.errors.findByPk]
    },
    { 
      code: `
        PGNote.findOne({ transaction, where: {noteId} })
      `,
      errors: [rule.errors.findOneAll]
    },
    {
      code: `
        PGNoteDisplayOption.findOne({
          where: { noteId },
          transaction: services.transaction,
          include: [{ model: PGNote, required: true }],
        })
      `,
      errors: [rule.errors.findOneAll]
    }
  ],
});
