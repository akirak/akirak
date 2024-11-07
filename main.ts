async function generateReadme(filename: string) {
  const file = Bun.file(filename);
  await Bun.write(file, `
![Number of stargazers by language](./generated/star-history.svg)
`);
}

generateReadme("README.md");
