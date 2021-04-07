const rule = require("../../../lib/rules/got-ssrf-protection");

// eslint-disable-next-line node/no-unpublished-require
const { RuleTester } = require("eslint");
const ruleTester = new RuleTester();

const errors = [
  {
    message:
      "got calls should explicitly specify if they should be protected against SSRF with gotSSRFProtected or gotSSRFUnprotected function from helpers/ssrfProtection",
  },
];

ruleTester.run("got-ssrf-protection", rule, {
  valid: [
    { code: 'got("http://lolcat.host", gotSSRFProtected({}))' },
    {
      code: 'got.post("http://lolcat.host", gotSSRFProtected({data: "test"}))',
    },
  ],
  invalid: [
    {
      code: 'got("http://lolcat.host")',
      errors,
    },
    {
      code: 'got.post("http://lolcat.host", {data: "test"})',
      errors,
    },
  ],
});
