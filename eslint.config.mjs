import antfu from '@antfu/eslint-config'

export default antfu({
  stylistic: {
    indent: 2,
  },
  ignores: [
    '*.md',
  ],
  rules: {
    'no-console': 'off',
  },
}, {
  files: ['*.ts'],
})
