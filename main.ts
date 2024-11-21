import { toHtml } from 'hast-util-to-html'
import { h } from 'hastscript'
import QuickChart from 'quickchart-js'

const DATABASE = 'github-stars.duckdb'

async function queryDuckdb<T>(database: string, sql: string): Promise<T[]> {
  const proc = Bun.spawn(['duckdb', '-json', '-no-stdin', database, sql])
  return await new Response(proc.stdout).json()
}

async function getStarredLanguages(thres: number) {
  return queryDuckdb<{ primary_language: string }>(DATABASE, `
SELECT
  primary_language
FROM
  total_stars_by_language
WHERE
stargazers >= ${thres}
`).then(result => result.map(({ primary_language }) => primary_language))
}

async function getLanguageStarHistory(language: string) {
  return queryDuckdb<{ x: string, y: string }>(DATABASE, `
WITH activities AS (
  SELECT
    strftime (s.starred_at, '%Y-%m-%d') AS date,
    row_number() OVER () AS idx
  FROM
    repository_primary_languages l
    INNER JOIN stargazers s
    ON l.owner = s.owner AND l.name = s.name
  WHERE
    l.primary_language = '${language}'
)
SELECT
  date AS x,
  count(idx) OVER (ORDER BY date ROWS UNBOUNDED PRECEDING) AS y
FROM
  activities
ORDER BY
  date
`)
}

async function getChart() {
  const chart = new QuickChart()
  const languages = await getStarredLanguages(10)
  const datasets = []
  for (const language of languages) {
    const data = await getLanguageStarHistory(language)
    datasets.push({
      label: language,
      fill: false,
      data,
      borderWidth: 1,
    })
  }
  chart.setConfig({
    type: 'line',
    data: {
      datasets,
    },
    options: {
      title: {
        display: true,
        text: 'Star history by language',
      },
      legend: {
        display: true,
        position: 'bottom',
      },
      elements: {
        point: {
          radius: 1,
        },
      },
      scales: {
        xAxes: [
          { type: 'time' },
        ],
      },
    },
  })
  return chart
}

async function generateReadme(filename: string) {
  const file = Bun.file(filename)
  const writer = file.writer()

  const chart = (await getChart()).setWidth(450).setHeight(280)
  writer.write(toHtml(h('figure', [
    h('img', {
      src: await chart.toDataUrl(),
      alt: 'star history',
    }),
  ])))

  writer.end()
}

generateReadme('README.md')
