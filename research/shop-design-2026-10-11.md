# Homepage catalogue design

The product shelf uses four compact cards per desktop row beside the editorial
panel, three on tablets and two on small screens. Pack photography stays
unchanged, with contain framing in 125px desktop and 115px mobile image areas.
Prices and add controls share one row, reducing card height and excess whitespace.
Mobile uses a 44px plus control with an accessible text label; desktop also
shows the label. Favourite controls and discreet badges retain the hierarchy.

The 12 October refinement features eight products, filling two four-card desktop
rows instead of leaving the second row half empty. The server-rendered selection
matches the interactive selection. The editorial image aligns with the bottom
of the first two actual rows and recalculates after filtering, resizing or font
loading; short filtered results retain sufficient room for its copy. On phones
the image stays beneath the products. Browser checks verified row alignment in
all three languages as well as the existing shopping controls.

Search and sort sit in one rounded toolbar; category filters are capsules and
scroll horizontally on phones. The original food photograph remains in a
rounded editorial panel with a thin gold frame and green contrast treatment.
Styles are scoped to the homepage catalogue, preserving the offers and hero.

Browser validation exercised search, sorting, detail dialogs, favourites and
the browser-only cart in Persian, Italian and English at 320, 390, 768 and
1440 pixels. No production order was created. The asset and catalogue checker
also passed. Product links and existing server-rendered metadata are retained.
