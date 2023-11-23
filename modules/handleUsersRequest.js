import { USERS } from '../index.js'
import { sendData, sendError } from './send.js'
import fs from 'node:fs/promises'

export const handleUsersRequest = async (req, res, ticketNumber) => {
  try {
    const userData = await fs.readFile(USERS, 'utf-8')
    const users = JSON.parse(userData)

    const user = users.find((c) => c.ticketNumber === ticketNumber)

    if (!user) {
      sendError(res, 404, 'Пользователь с данным номером билета отсутствует')
      return
    }

    sendData(res, user)
  } catch (error) {
    console.error(`Ошибка при обработке запроса: ${error}`)
    sendError(res, 500, 'Ошибка сервера при обработке запроса пользователя')
  }
}
