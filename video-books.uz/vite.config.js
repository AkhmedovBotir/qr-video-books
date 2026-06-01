import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { buildTelegramOrderHtml } from './lib/telegramOrderHtml.js'
import { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } from './src/orderSiteConfig.js'

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (c) => chunks.push(c))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

function isOrderApiPost(req) {
  if (req.method !== 'POST') return false
  const path = req.url?.split('?')[0] ?? ''
  return path === '/api/order' || path.endsWith('/api/order')
}

// https://vite.dev/config/
export default defineConfig(() => {
  const token = String(TELEGRAM_BOT_TOKEN || '').trim()
  const chatIdRaw =
    TELEGRAM_CHAT_ID !== undefined && TELEGRAM_CHAT_ID !== null
      ? String(TELEGRAM_CHAT_ID).trim()
      : ''

  return {
    plugins: [
      /* Devda /api/order — boshqa plaginlardan OLDIN (ichki SPA qayta ishlatmasin) */
      {
        name: 'order-api-dev',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (!isOrderApiPost(req)) {
              next()
              return
            }
            try {
              const raw = await readRawBody(req)
              let body
              try {
                body = JSON.parse(raw || '{}')
              } catch {
                res.statusCode = 400
                res.setHeader('Content-Type', 'application/json; charset=utf-8')
                res.end(JSON.stringify({ ok: false, message: "Noto'g'ri JSON" }))
                return
              }
              const name = String(body.name || '').trim()
              const phone = String(body.phone || '').trim()
              if (!name || name.length > 200) {
                res.statusCode = 400
                res.setHeader('Content-Type', 'application/json; charset=utf-8')
                res.end(
                  JSON.stringify({ ok: false, message: 'Ism familiya kiritilmagan yoki juda uzun' }),
                )
                return
              }
              const digits = phone.replace(/\D/g, '')
              if (digits.length < 12 || !phone.includes('+998')) {
                res.statusCode = 400
                res.setHeader('Content-Type', 'application/json; charset=utf-8')
                res.end(JSON.stringify({ ok: false, message: "Telefon noto'g'ri" }))
                return
              }
              if (!token || !chatIdRaw) {
                res.statusCode = 500
                res.setHeader('Content-Type', 'application/json; charset=utf-8')
                res.end(
                  JSON.stringify({
                    ok: false,
                    message:
                      "Telegram sozlanmagan. `src/orderSiteConfig.js` da TELEGRAM_BOT_TOKEN va TELEGRAM_CHAT_ID ni to‘ldiring.",
                  }),
                )
                return
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
              const tgJson = await tgRes.json()
              if (!tgJson.ok) {
                res.statusCode = 502
                res.setHeader('Content-Type', 'application/json; charset=utf-8')
                res.end(
                  JSON.stringify({
                    ok: false,
                    message: tgJson.description || 'Telegram API xatosi',
                  }),
                )
                return
              }
              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json; charset=utf-8')
              res.end(JSON.stringify({ ok: true }))
            } catch (e) {
              console.error('[api/order]', e)
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json; charset=utf-8')
              res.end(JSON.stringify({ ok: false, message: 'Server xatosi' }))
            }
          })
        },
      },
      react(),
      tailwindcss(),
    ],
  }
})
