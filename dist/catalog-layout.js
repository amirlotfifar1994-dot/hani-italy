// Keep the editorial photograph aligned with two actual product rows.
const grid = document.querySelector('#shop #products');
const panel = document.querySelector('#shop .catalog-editorial');
if (grid && panel) {
  const desktop = matchMedia('(min-width:901px)');
  let frame;
  function alignPanel() {
    frame = undefined;
    if (!desktop.matches) {
      panel.style.removeProperty('--catalog-editorial-height');
      return;
    }
    const cards = [...grid.querySelectorAll('.product-card')];
    if (!cards.length) {
      panel.style.removeProperty('--catalog-editorial-height');
      return;
    }
    const top = grid.getBoundingClientRect().top;
    let rowTop, rows = 0, bottom = top;
    for (const card of cards) {
      const rect = card.getBoundingClientRect();
      if (rowTop === undefined || Math.abs(rect.top - rowTop) > 1) {
        if (++rows > 2) break;
        rowTop = rect.top;
      }
      bottom = Math.max(bottom, rect.bottom);
    }
    // A short filtered list must still leave room for the editorial copy.
    const copy = panel.querySelector('div');
    const height = Math.ceil(Math.max(bottom - top, copy?.scrollHeight || 0));
    panel.style.setProperty('--catalog-editorial-height', height + 'px');
  }
  function queueAlignment() {
    if (frame === undefined) frame = requestAnimationFrame(alignPanel);
  }
  new ResizeObserver(queueAlignment).observe(grid);
  new MutationObserver(queueAlignment).observe(grid, {childList:true});
  desktop.addEventListener('change', queueAlignment);
  document.fonts.ready.then(queueAlignment);
  queueAlignment();
}
