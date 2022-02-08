const rule = require("../../../lib/rules/api-ensure-repositories-are-scoped-by-organizationId");
const { RuleTester } = require("eslint");
const ruleTester = new RuleTester({
  parserOptions: { ecmaVersion: 10, sourceType: "module" },
});

const errorFindByPk = {
  message:
      `findByPk should be used with extra care as it opens code to direct object access.
You should consider using findOne({where: {id, organizationId}}) instead (and add the more context you can like organizationId)`,
}

const errorFindOne = {
  message: `findOne should somehow use organizationId to scope the query to the organization.`,
}

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
  ],
  invalid: [
    { code: `
        PGNote.findByPk(noteId, { transaction })
      `,
      errors: [errorFindByPk]
    },
    { 
      code: `
        PGNote.findOne({ transaction, where: {noteId} })
      `,
      errors: [errorFindOne]
    },
    {
      code: `
        PGNoteDisplayOption.findOne({
          where: { noteId },
          transaction: services.transaction,
          include: [{ model: PGNote, required: true }],
        })
      `,
      errors: [errorFindOne]
    }
  ],
});
