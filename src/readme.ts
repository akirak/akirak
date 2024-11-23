import { toHtml } from 'hast-util-to-html'
import { h } from 'hastscript'

async function generateReadme(filename: string) {
  const file = Bun.file(filename)
  const writer = file.writer()
  writer.write(toHtml(h('img', {
    src: 'assets/combined-charts.png',
    alt: 'Charts',
  }),
  ))

  writer.end()
}

generateReadme('README.md')
