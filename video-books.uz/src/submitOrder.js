import { getOrderSubmitUrl } from './orderApi.js'
import { buildTelegramOrderHtml } from '../lib/telegramOrderHtml.js'
import { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } from './orderSiteConfig.js'

function resolveTelegramCredentials() {
  const token = typeof TELEGRAM_BOT_TOKEN === 'string' ? TELEGRAM_BOT_TOKEN.trim() : ''
  const chatIdRaw =
    TELEGRAM_CHAT_ID !== undefined && TELEGRAM_CHAT_ID !== null
      ? String(TELEGRAM_CHAT_ID).trim()
      : ''
  return { token, chatIdRaw }
}

/**
 * @param {{ name: string, phone: string }} payload
 * @returns {Promise<void>}
 */
export async function submitOrder({ name, phone }) {
  const { token, chatIdRaw } = resolveTelegramCredentials()

  if (token && chatIdRaw) {
    const chatId = /^-?\d+$/.test(chatIdRaw) ? Number(chatIdRaw) : chatIdRaw
    const text = buildTelegramOrderHtml({ name, phone })
    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    })
    const tgJson = await tgRes.json().catch(() => ({}))
    if (!tgJson.ok) {
      throw new Error(tgJson.description || 'Telegram API xatosi')
    }
    return
  }

  const res = await fetch(getOrderSubmitUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, phone }),
  })
  const rawText = await res.text()
  let data = {}
  try {
    data = rawText ? JSON.parse(rawText) : {}
  } catch {
    throw new Error(
      "Server noto'g'ri javob qaytardi (ehtimol /api/order ishlamayapti). `src/orderSiteConfig.js` da TELEGRAM_* ni to‘ldiring.",
    )
  }
  if (!res.ok || !data.ok) {
    throw new Error(data.message || `Xato: ${res.status}`)
  }
}
