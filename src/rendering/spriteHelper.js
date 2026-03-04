/**
 * Renders a sprite defined as an array of strings.
 * Each character maps to a palette color. '.' = transparent.
 * 
 * @param {CanvasRenderingContext2D} ctx
 * @param {string[]} rows  - array of equal-length strings
 * @param {Object} palette - char -> CSS color string
 * @param {number} p       - pixel size (screen pixels per sprite pixel)
 */
export function renderSprite(ctx, rows, palette, p) {
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    for (let c = 0; c < row.length; c++) {
      const ch = row[c];
      if (ch === '.') continue;
      const color = palette[ch];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(c * p, r * p, p, p);
    }
  }
}
