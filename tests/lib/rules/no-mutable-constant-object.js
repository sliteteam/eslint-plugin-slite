const rule = require("../../../lib/rules/no-mutable-constant-object");

// eslint-disable-next-line node/no-unpublished-require
const { RuleTester } = require("eslint");
const ruleTester = new RuleTester();
// const errors = ;

ruleTester.run("no-mutable-constant-object", rule, {
  valid: [
    {
      code: `
      /*eslint-env es6*/
      const ThisIsNotAConstantArray = "elem1";
    `,
    },
    {
      code: `
      /*eslint-env es6*/
      const THIS_IS_A_CONSTANT_STRING = "elem1";
    `,
    },
    {
      code: `
      /*eslint-env es6*/
      const ThisIsNotAConstantArray = ["elem1", "elem2"];
    `,
    },
    {
      code: `
        /*eslint-env es6*/
        const THIS_IS_A_CONSTANT_ARRAY = Object.freeze(["elem1", "elem2"]);
      `,
    },
    {
      code: `
        /*eslint-env es6*/
        const THIS_IS_A_CONSTANT_OBJECT = Object.freeze({elem1:"elem1", elem2: "elem2"});
      `,
    },
    {
      code: `
        /*eslint-env es6*/
        const THIS_IS_A_CONSTANT_ARRAY = Object.freeze(["elem1", "elem2"].sort());
      `,
    },
    {
      code: `
        /*eslint-env es6*/
        const THIS_IS_A_CONSTANT_ARRAY = Object.freeze(customFunction(["elem1", "elem2"].sort()));
      `,
    },
  ],
  invalid: [
    {
      code: `
        /*eslint-env es6*/
        const THIS_IS_A_CONSTANT_ARRAY = ["elem1", "elem2"];
      `,
      errors: [
        {
          message:
            "Constant THIS_IS_A_CONSTANT_ARRAY should be frozen (Object.freeze) to prevent mutation of this constant.",
        },
      ],
    },
    {
      code: `
        /*eslint-env es6*/
        const THIS_IS_A_CONSTANT_OBJECT = {elem1:"elem1", elem2: "elem2"};
      `,
      errors: [
        {
          message:
            "Constant THIS_IS_A_CONSTANT_OBJECT should be frozen (Object.freeze) to prevent mutation of this constant.",
        },
      ],
    },
    {
      code: `
        /*eslint-env es6*/
        const THIS_IS_A_CONSTANT_ARRAY = ["elem1", "elem2"].sort();
      `,
      errors: [
        {
          message:
            "Constant THIS_IS_A_CONSTANT_ARRAY should be frozen (Object.freeze) to prevent mutation of this constant.",
        },
      ],
    },
    {
      code: `
        /*eslint-env es6*/
        const THIS_IS_A_CONSTANT_ARRAY = customFunction(["elem1", "elem2"].sort());
      `,
      errors: [
        {
          message:
            "Constant THIS_IS_A_CONSTANT_ARRAY should be frozen (Object.freeze) to prevent mutation of this constant.",
        },
      ],
    },
  ],
});
