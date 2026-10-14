/* Keep the document useful without JavaScript; enhance only while this observer is active. */
(() => {
  const tracked = new WeakMap();
  const reveal = image => {
    const revision = tracked.get(image);
    const finish = () => requestAnimationFrame(() => requestAnimationFrame(() => {
      if (image.isConnected && tracked.get(image) === revision) image.setAttribute('data-image-ready', '');
    }));
    // Decode before the fade so partially decoded files do not flash into view.
    if (image.naturalWidth && image.decode) image.decode().catch(() => {}).then(finish);
    else finish(); // A failed image still exposes its alternate text.
  };
  const track = image => {
    if (tracked.has(image)) return;
    tracked.set(image, 0);
    image.addEventListener('load', () => reveal(image));
    image.addEventListener('error', () => reveal(image));
    if (image.complete) reveal(image);
  };
  const scan = node => {
    if (node instanceof HTMLImageElement) track(node);
    node.querySelectorAll?.('img').forEach(track);
  };
  const observer = new MutationObserver(records => {
    for (const record of records) {
      if (record.type === 'childList') record.addedNodes.forEach(scan);
      else {
        const image = record.target;
        if (!(image instanceof HTMLImageElement)) continue;
        track(image);
        tracked.set(image, tracked.get(image) + 1);
        image.removeAttribute('data-image-ready');
        if (image.complete) reveal(image);
      }
    }
  });
  observer.observe(document.documentElement, {subtree:true, childList:true, attributes:true, attributeFilter:['src','srcset']});
  document.documentElement.classList.add('images-enhanced');
  scan(document);
})();
