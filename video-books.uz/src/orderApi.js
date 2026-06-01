/** Buyurtma POST manzili (Vite `base` bo'lsa ham to'g'ri ishlaydi) */
export function getOrderSubmitUrl() {
  const base = import.meta.env.BASE_URL || '/'
  try {
    return new URL('api/order', window.location.origin + base).href
  } catch {
    return '/api/order'
  }
}
