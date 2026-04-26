# Node.js Full Stack Starter

JavaScript asosidagi boshlang'ich loyiha:

- Backend: Node.js + Express + MongoDB (Mongoose)
- Frontend: EJS (server-rendered) + TailwindCSS
- Arxitektura: `controllers`, `routes`, `models`, `views`, `middlewares`, `services`
- Auth: `express-session` orqali admin login/logout
- QR CRUD: nom + ixtiyoriy turdagi bitta fayl (video, rasm, pdf va h.k.)

## Ishga tushirish

1. Paketlarni o'rnating:

```bash
npm install
```

2. `.env` yarating:

```bash
copy .env.example .env
```

3. Tailwind CSS build qiling:

```bash
npm run tailwind:build
```

4. Serverni ishga tushiring:

```bash
npm run dev
```

5. Admin user yarating:

```bash
npm run create-admin
```

Kiritiladigan maydonlar:

- `name`
- `phone`
- `username`
- `password`

## QR CRUD imkoniyatlari

- Admin panel ichida QR yaratish, tahrirlash, o'chirish
- Har bir QR uchun:
  - `name`
  - `file` (cheklovsiz fayl turi)
- QR link format: `/q/:token`
- Tahrirlaganda `token` o'zgarmaydi, ya'ni QR o'zgarmaydi

## Scriptlar

- `npm run dev` - nodemon bilan server
- `npm run start` - production start
- `npm run create-admin` - terminaldan admin yaratish
- `npm run tailwind:build` - bir martalik CSS build
- `npm run tailwind:watch` - CSS watch rejim
