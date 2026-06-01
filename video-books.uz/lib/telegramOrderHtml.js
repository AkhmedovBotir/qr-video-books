/** Xabar matnida HTML injeksiyasini oldini olish */
export function escapeHtml(s) {
  if (s == null) return ''
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Telegram sendMessage uchun HTML (parse_mode: HTML)
 */
export function buildTelegramOrderHtml({ name, phone }) {
  const when = new Date().toLocaleString('uz-UZ', {
    timeZone: 'Asia/Tashkent',
    dateStyle: 'long',
    timeStyle: 'short',
  })
  const safeName = escapeHtml(name)
  const safePhone = escapeHtml(phone)
  const safeWhen = escapeHtml(when)

  return [
    '📚 <b>Yangi kitob buyurtmasi</b>',
    '┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈',
    '',
    '👤 <b>Ism familiya</b>',
    safeName,
    '',
    '📱 <b>Telefon</b>',
    `<code>${safePhone}</code>`,
    '',
    '🌐 <b>Manba</b>',
    '<a href="https://video-books.uz">Video-Books.uz</a>',
    '',
    `🗓 <i>${safeWhen} (Oʻzbekiston)</i>`,
  ].join('\n')
}
