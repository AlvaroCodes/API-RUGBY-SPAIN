
import * as cheerio from 'cheerio'
import { writeFile } from 'node:fs/promises'
import path from 'node:path'

const URLs = {
  leaderBoard: 'https://ferugby.habitualdata.com/FerClasificacion.aspx?cat=DH'
}

async function scrape (url) {
  const res = await fetch(url)
  const html = await res.text()
  return cheerio.load(html)
}

const LEADER_BOARD_SELECTORS = {
  position: { selector: 0, typeOf: 'number' },
  team: { selector: 2, typeOf: 'string' },
  played: { selector: 3, typeOf: 'number' },
  victories: { selector: 4, typeOf: 'number' },
  tied: { selector: 5, typeOf: 'number' },
  loses: { selector: 6, typeOf: 'number' },
  soAgainst: { selector: 7, typeOf: 'number' },
  difference: { selector: 8, typeOf: 'number' },
  soFavor: { selector: 9, typeOf: 'number' },
  tryFavor: { selector: 10, typeOf: 'number' },
  tryAgainst: { selector: 11, typeOf: 'number' },
  tryDifference: { selector: 12, typeOf: 'number' },
  offensiveBonus: { selector: 13, typeOf: 'number' },
  defensiveBonus: { selector: 14, typeOf: 'number' },
  totalPoint: { selector: 15, typeOf: 'number' }
}

async function getLeaderBoard () {
  const $ = await scrape(URLs.leaderBoard)
  const $row = $('table tbody tr')
  const leaderBoard = []
  $row.each((index, element) => {
    const $el = $(element)
    if (index !== 0) {
      const loaderBoardEntries = Object.entries(LEADER_BOARD_SELECTORS).map(([key, { selector, typeOf }]) => {
        const rowValue = $el.children('td').eq(selector).text()
        const value = typeOf === 'number' ? Number(rowValue) : rowValue
        return [key, value]
      })
      leaderBoard.push(Object.fromEntries(loaderBoardEntries))
    }
  })
  return leaderBoard
}

const leaderBoard = await getLeaderBoard()
const filePath = path.join(process.cwd(), './db/leaderBoard.json')
await writeFile(filePath, JSON.stringify(leaderBoard, null, 2), 'utf-8')
