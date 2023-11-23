import { USERS } from '../index.js'
import { sendData, sendError } from './send.js'
import fs from 'node:fs/promises'

export const handleUpdateUser = (req, res, segments) => {
  let body = ''
  const ticketNumber = segments[1]
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
      const updateDataUser = JSON.parse(body)

      if (
        !updateDataUser.fullName ||
        !updateDataUser.phone ||
        !updateDataUser.ticketNumber ||
        !updateDataUser.reservation
      ) {
        sendError(res, 400, 'Неверные основные данные пользователя')
        return
      }

      if (
        updateDataUser.reservation &&
        (!updateDataUser.reservation.length ||
          !Array.isArray(updateDataUser.reservation) ||
          !updateDataUser.reservation.every((item) => item.band && item.time))
      ) {
        sendError(res, 400, 'Неверно заполнены поля бронирования')
        return
      }

      const userData = await fs.readFile(USERS, 'utf-8')
      const users = JSON.parse(userData)
      const userIndex = users.findIndex((c) => c.ticketNumber === ticketNumber)

      if (userIndex === -1) {
        sendError(res, 404, 'Пользователь с данным номером билета не найден')
      }
      users[userIndex] = {
        ...users[userIndex],
        ...updateDataUser
      }

      await fs.writeFile(USERS, JSON.stringify(users))
      sendData(res, users[userIndex])
    } catch (error) {
      console.error(`error: ${error}`)
      sendError(res, 500, 'Ошибка сервера при обновлении данных пользователя')
    }
  })
}
