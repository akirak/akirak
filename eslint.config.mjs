import antfu from "@antfu/eslint-config"
import * as graphqlEslint from "@graphql-eslint/eslint-plugin"

export default antfu({
  stylistic: {
    indent: 2,
    quotes: "double",
  },
  ignores: [
    "dist",
  ],
  rules: {
    "no-console": "off",
  },
}, {
  // This isn't working. Please check for updates in the plugin
  files: ["**/*.ts"],
  processor: graphqlEslint.processors.graphql,
  languageOptions: {
    parserOptions: {
      schema: "./node_modules/@octokit/graphql-schema/schema.graphql",
    },
  },
})
