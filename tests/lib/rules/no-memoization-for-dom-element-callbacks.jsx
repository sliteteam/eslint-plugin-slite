const rule = require("../../../lib/rules/no-memoization-for-dom-element-callbacks.js")

const ValidComponentWithoutMemo = `
  const MyComponent = () => {
    const handleClick = (event) => {
      event.preventDefault
    }
    return (
      <div
        onClick={handleClick}
      />
    )
  }
`

const ValidComponentWithInlineFunction = `
  const MyComponent = () => {
    return (
      <div
        onClick={(event) => event.preventDefault}
      />
    )
  }
`

const ValidComponentWithMixedUses = `
  const MyComponent = () => {
    const handleClick = React.useCallback((event) => {
      event.preventDefault
    }, [])
    return (
      <div>
        <CustomComponent
          onClick={handleClick}
        />
        <div onClick={handleClick} />
      </div>
    )
  }
`

const ValidComponentWithRef = `
const MyComponent = () => {
  const refCallback = useCallback((element) => {
    element.focus()
  }, [])
  return (
    <div
      ref={refCallback}
    />
  )
}
`

const InvalidComponentWithMemo = `
  const MyComponent = () => {
    const handleClick = React.useCallback((event) => {
      event.preventDefault
    }, [])
    return (
      <div
        onClick={handleClick}
      />
    )
  }
`

const InvalidComponentWithMemoAlt = `
  const MyComponent = () => {
    const handleClick = useCallback((event) => {
      event.preventDefault
    }, [])
    return (
      <div
        onClick={handleClick}
      />
    )
  }
`

// eslint-disable-next-line node/no-unpublished-require
const { RuleTester } = require("eslint")
const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 10, ecmaFeatures: { jsx: true } } })

const errors = [
  {
    message: rule.message,
  },
]

ruleTester.run("no-memoization-for-dom-element-callbacks", rule, {
  valid: [
    {
      code: ValidComponentWithoutMemo,
    },
    {
      code: ValidComponentWithInlineFunction,
    },
    {
      code: ValidComponentWithMixedUses,
    },
    {
      code: ValidComponentWithRef,
    }
  ],
  invalid: [
    {
      code: InvalidComponentWithMemo,
      errors,
    },
    {
      code: InvalidComponentWithMemoAlt,
      errors,
    }
  ],
})