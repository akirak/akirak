import QuickChart from 'quickchart-js'
import { DATABASE, queryDuckdb } from './duckdb'

export const CHART_FILE = 'assets/chart.png'

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
        text: 'Star history by language (using akirak/yastar)',
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
        yAxes: [
          { position: 'right' },
        ],
      },
    },
  })
  return chart
}

export async function writeChartFile() {
  const chart = (await getChart()).setWidth(450).setHeight(280)
  chart.toFile(CHART_FILE)
}

writeChartFile()
