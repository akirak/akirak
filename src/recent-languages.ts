import process from 'node:process'
import { Octokit } from 'octokit'
import QuickChart from 'quickchart-js'

export const CHART_FILE = 'assets/pie-chart.png'

const auth = process.env.GITHUB_API_TOKEN

const octokit = new Octokit({ auth })

interface Node {
  repository: {
    primaryLanguage: {
      name: string
    }
  }
  occurredAt: string
}

async function getRecentContributions(count: number): Promise<Node[]> {
  const {
    viewer: {
      contributionsCollection: {
        repositoryContributions: {
          nodes,
        },
      },
    },
  } = await octokit.graphql(`
  query recentContributionLanguages($count: Int) {
    viewer {
      contributionsCollection {
        repositoryContributions(first: $count, orderBy: {direction:DESC}) {
          nodes {
            repository {
              primaryLanguage {
                name
              }
            }
            occurredAt
          }
        }
      }
    }
  }
`, {
    count,
  })

  return nodes
}

async function getChart() {
  const nodes = Array.from(await getRecentContributions(30))

  const since
        = /^\d{4}-\d{2}-\d{2}/.exec(nodes[nodes.length - 1].occurredAt)?.[0]

  const groups = Object.groupBy(
    nodes.map(node => node.repository?.primaryLanguage?.name),
    (name, _) => name,
  )

  const entries = Object.entries(groups)
    .map(([name, items]) =>
      ({
        name,
        count: items?.length as number,
      }),
    )
    .sort((a, b) => b.count - a.count)

  const total = entries.reduce((acc, o) => acc + o.count, 0)

  const chart = new QuickChart()
  chart.setConfig({
    type: 'pie',
    data: {
      datasets: [{
        data: entries.map(o => o.count / total * 100),
      }],
      labels: entries.map(o => o.name),
    },
    options: {
      title: {
        display: true,
        text: `Recently used languages (since ${since})`,
      },
      legend: {
        display: false,
      },
      plugins: {
        datalabels: {
          display: true,
          formatter: (val: number, ctx) => {
            if (val < 5)
              return null
            return ctx.chart.data.labels[ctx.dataIndex]
          },
          color: '#fff',
          backgroundColor: '#404040',
        },
      },
    },
  })
  return chart
}

export async function writeChartFile() {
  const chart = (await getChart()).setWidth(400).setHeight(280)
  chart.toFile(CHART_FILE)
}

writeChartFile()
