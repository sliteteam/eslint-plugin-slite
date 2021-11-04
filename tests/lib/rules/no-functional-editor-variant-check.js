const rule = require("../../../lib/rules/no-functional-editor-variant-check.js");

const isEditorVariant = () => null
const EditorVariant = { foo: true }

function validPlugin() {
  const isFooEditor = isEditorVariant(EditorVariant.foo) 
  return {
    queries: {
      bar(editor) {
        if (isFooEditor) {
          return 
        }
        return editor.value.startNode
      }
    }
  }
}

function validPluginWithQuery() {
  return {
    queries: {
      bar(editor) {
        if (editor.isEditorVariant(EditorVariant.foo)) {
          return 
        }
        return editor.value.startNode
      }
    }
  }
}

function invalidPlugin() {
  return {
    queries: {
      bar(editor) {
        if (isEditorVariant(EditorVariant.foo)) {
          return 
        }
        return editor.value.startNode
      }
    }
  }
}

function invalidPluginWithNestedCommand() {
  const maybeClearSelection = (editor) => {
    return () => {
      if (isEditorVariant(EditorVariant.foo)) {
        editor.setSelection({})
      }
    }
  }
  return {
    queries: {
      bar(editor) {
        return editor.value.startNode
      }
    },
    commands: {
      doSomething: (editor, arg, next) => {
        next(maybeClearSelection(editor))
      }
    }
  }
}

// eslint-disable-next-line node/no-unpublished-require
const { RuleTester } = require("eslint");
const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 10 } });

const errors = [
  {
    message: rule.message,
  },
];

ruleTester.run("no-functional-editor-variant-check", rule, {
  valid: [
    {
      code: validPlugin.toString(),
    },
    {
      code: validPluginWithQuery.toString(),
    },
  ],
  invalid: [
    {
      code: invalidPlugin.toString(),
      errors,
    },
    {
      code: invalidPluginWithNestedCommand.toString(),
      errors,
    },
  ],
});
