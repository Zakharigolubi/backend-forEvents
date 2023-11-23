import { USERS } from '../index.js'
import { sendData, sendError } from './send.js'
import fs from 'node:fs/promises'

export const handleAddUser = (req, res) => {
  let body = ''
  try {
    req.on('data', (chunk) => {
      body += chunk
    })
  } catch (error) {
    console.log(`Ошибка при чтении запроса`)
    sendError(res, 500, 'Ошибка сервера при чтении запроса')
  }

  req.on('end', async () => {
    try {
      const newUser = JSON.parse(body)

      if (
        !newUser.fullName ||
        !newUser.phone ||
        !newUser.ticketNumber ||
        !newUser.reservation
      ) {
        sendError(res, 400, 'Неверные основные данные пользователя')
        return
      }

      if (
        newUser.reservation &&
        (!newUser.reservation.length ||
          !Array.isArray(newUser.reservation) ||
          !newUser.reservation.every((item) => item.band && item.time))
      ) {
        sendError(res, 400, 'Неверно заполнены поля бронирования')
        return
      }

      const userData = await fs.readFile(USERS, 'utf-8')
      const users = JSON.parse(userData)

      users.push(newUser)

      await fs.writeFile(USERS, JSON.stringify(users))
      sendData(res, newUser)
    } catch (error) {
      console.error(`error: ${error}`)
    }
  })
}
