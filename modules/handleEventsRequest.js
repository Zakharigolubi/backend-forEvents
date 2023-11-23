import { sendData, sendError } from './send.js'

export const handleEventsRequest = async (req, res, events, segments) => {
  if (segments.length === 2) {
    const band = events.find((c) => c.id === segments[1])

    if (!band) {
      sendError(res, 404, 'Band not found')
      return
    }
    sendData(res, band)
    return
  }
  sendData(res, events)
}
