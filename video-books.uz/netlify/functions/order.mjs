import { buildTelegramOrderHtml } from '../../lib/telegramOrderHtml.js'
import { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } from '../../src/orderSiteConfig.js'

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(body),
  }
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: '',
    }
  }

  if (event.httpMethod !== 'POST') {
    return json(405, { ok: false, message: 'Method not allowed' })
  }

  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return json(400, { ok: false, message: "Noto'g'ri JSON" })
  }

  const name = String(body.name || '').trim()
  const phone = String(body.phone || '').trim()

  if (!name || name.length > 200) {
    return json(400, { ok: false, message: 'Ism familiya kiritilmagan yoki juda uzun' })
  }
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 12 || !phone.includes('+998')) {
    return json(400, { ok: false, message: "Telefon noto'g'ri" })
  }

  const token = String(TELEGRAM_BOT_TOKEN || '').trim()
  const chatIdRaw =
    TELEGRAM_CHAT_ID !== undefined && TELEGRAM_CHAT_ID !== null
      ? String(TELEGRAM_CHAT_ID).trim()
      : ''
  if (!token || !chatIdRaw) {
    return json(500, {
      ok: false,
      message: 'Telegram sozlanmagan: `src/orderSiteConfig.js` da TELEGRAM_BOT_TOKEN va TELEGRAM_CHAT_ID ni to‘ldiring',
    })
  }

  const chatId = /^-?\d+$/.test(chatIdRaw)
    ? Number(chatIdRaw)
    : chatIdRaw

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
    return json(502, {
      ok: false,
      message: tgJson.description || 'Telegram API xatosi',
    })
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({ ok: true }),
  }
}
