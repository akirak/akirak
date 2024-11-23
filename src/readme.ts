import { toHtml } from 'hast-util-to-html'
import { h } from 'hastscript'
import * as StarHistory from './star-history'
import * as RecentLanguages from './recent-languages'

async function generateReadme(filename: string) {
  const file = Bun.file(filename)
  const writer = file.writer()
  writer.write(toHtml(h('figure', [
    h('img', {
      src: StarHistory.CHART_FILE,
      alt: 'Star history',
    }),
    h('img', {
      src: RecentLanguages.CHART_FILE,
      alt: 'Recently used languages',
    }),
  ])))

  writer.end()
}

generateReadme('README.md')
