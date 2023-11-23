import http from 'node:http'
import fs from 'node:fs/promises'
import { sendData, sendError } from './modules/send.js'
import { checkFile } from './modules/checkFile.js'
import { handleEventsRequest } from './modules/handleEventsRequest.js'
import { handleAddUser } from './modules/handleAddUser.js'
import { handleUsersRequest } from './modules/handleUsersRequest.js'
import { handleUpdateUser } from './modules/handleUpdateUser.js'

const PORT = 8080
const EVENTS = './events.json'
export const USERS = './users.json'

const startServer = async () => {
  if (!(await checkFile(EVENTS))) {
    return
  }
  await checkFile(USERS, true)

  const eventsData = await fs.readFile(EVENTS, 'utf-8')
  const events = JSON.parse(eventsData)
  http
    .createServer(async (req, res) => {
      try {
        res.setHeader('Access-Control-Allow-Origin', '*')

        const segments = req.url.split('/').filter(Boolean)

        if (req.method === 'GET' && segments[0] === 'events') {
          handleEventsRequest(req, res, events, segments)
          return
        }

        if (req.method === 'POST' && segments[0] === 'users') {
          handleAddUser(req, res)
          return
        }

        if (
          req.method === 'GET' &&
          segments[0] === 'users' &&
          segments.length === 2
        ) {
          const ticketNumber = segments[1]
          handleUsersRequest(req, res, ticketNumber)
          return
        }

        if (
          req.method === 'PATCH' &&
          segments[0] === 'users' &&
          segments.length === 2
        ) {
          handleUpdateUser(req, res, segments)
          return
        }
        sendError(res, 404, 'Not found')
      } catch (error) {
        sendError(res, 500, 'Band not found', `Ошибка сервера: ${error}`)
      }
    })
    .listen(PORT)

  console.log(`Сервер запущен на http://localhost:${PORT}`)
}

startServer()
