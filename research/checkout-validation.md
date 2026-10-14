# Checkout verification — 2026-10-03

- Mixed basket: pistachios (€6.50) + Hani Ghormeh Sabzi (€4.90), subtotal €11.40.
- Three-digit CAP rejected; Italian five-digit CAP accepted.
- Destination can be edited before confirmation.
- Persian digits ۰۰۱۸۵ normalize to 00185 without losing leading zeroes.
- Confirming a demo creates a local reference and removes purchased basket quantities.
- Downloaded receipt verified at research/demo-receipt-example.txt.
- Saved receipts reopen after a page reload. Italian and Persian flows tested.
- Mobile browser viewport reported 480 px, with no horizontal overflow. Interactive controls were enlarged for touch.
- Favourites clear the previous search when opened through the header.
- Automated checks reject malformed/duplicate saved receipt lines and invalid CAP values, and verify historical totals use captured prices.

No payment, real shipment or server order was performed.
