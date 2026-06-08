/**
 * Kategori pemasukkan yang memicu pemilihan menu catering (sinkron dengan kontrak backend nanti).
 * Cocokkan case-insensitive; "penjualan" sebagai substring umum untuk label seperti "Penjualan catering".
 */
export function isSalesCategory(categoryName: string): boolean {
  const c = categoryName.trim().toLowerCase();
  if (!c) return false;
  if (c.includes("penjualan")) return true;
  if (c === "catering" || c.startsWith("catering ")) return true;
  return false;
}
