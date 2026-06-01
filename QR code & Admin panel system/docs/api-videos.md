# API Docs: `GET /api/videos`

## Maqsad
`/api/videos` endpointi QR tizimidagi videolar ro'yxatini qaytaradi.
Ro'yxatga faqat:
- `includeInVideoList = true` qilib belgilangan yozuvlar
- `file.mimeType` qiymati `video/*` bo'lgan fayllar
kiradi.

Bu endpoint `routes/web.routes.js` ichida `getVideoListApi` controlleriga ulangan.

## Endpoint
- **Method:** `GET`
- **Path:** `/api/videos`
- **Auth:** hozirgi kodda **talab qilinmaydi** (`requireAuth` ulanmagan)
- **Content-Type (response):** `application/json`

## Data manbasi
`controllers/qr.controller.js` dagi `getVideoListApi` quyidagi query bilan oladi:
- `includeInVideoList: true`
- `"file.mimeType": /^video\//i`
- sort: `createdAt` bo'yicha kamayish tartibida (`-1`)

## Response (200)
```json
{
  "success": true,
  "count": 2,
  "videos": [
    {
      "id": "681ddd18d8b9b98363e3f5a9",
      "name": "Promo video",
      "mimeType": "video/mp4",
      "originalName": "promo.mp4",
      "size": 10485760,
      "qrToken": "f1b2c3d4e5f678901234567890abcdef",
      "watchUrl": "http://localhost:3000/q/f1b2c3d4e5f678901234567890abcdef",
      "streamUrl": "http://localhost:3000/q/f1b2c3d4e5f678901234567890abcdef/stream",
      "createdAt": "2026-05-09T11:20:41.245Z",
      "updatedAt": "2026-05-09T11:20:41.245Z"
    }
  ]
}
```

## Response maydonlari
- `success` (`boolean`): so'rov muvaffaqiyati
- `count` (`number`): `videos` uzunligi
- `videos` (`array`): video obyektlar ro'yxati
  - `id` (`string`): QR item ID
  - `name` (`string`): video nomi
  - `mimeType` (`string`): fayl MIME turi
  - `originalName` (`string`): yuklangan fayl original nomi
  - `size` (`number`): baytlardagi hajm
  - `qrToken` (`string`): QR token
  - `watchUrl` (`string`): player sahifa URL (`/q/:token`)
  - `streamUrl` (`string`): stream URL (`/q/:token/stream`)
  - `createdAt` (`string`, ISO date)
  - `updatedAt` (`string`, ISO date)

## Xatolik holatlari
Controller ichida xatolik bo'lsa `next(error)` ga uzatiladi va global error middleware ishlaydi.
Loyihadagi umumiy xato javobi odatda `500` HTML sahifa (`errors/500`) qaytarishi mumkin.

## cURL misol
```bash
curl -X GET http://localhost:3000/api/videos
```

## Tanlov qanday boshqariladi
`/admin/qr` sahifasida checkboxlar orqali tanlov qilinadi va:
- `POST /admin/qr/video-list-selection`
endpointi orqali `includeInVideoList` maydoni yangilanadi.

Shundan keyin `GET /api/videos` aynan o'sha tanlangan video yozuvlarni qaytaradi.
