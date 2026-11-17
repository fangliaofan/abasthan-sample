# abasthan-sample

Minimal placeholder to claim the one free Abasthan Web Service slot
(512MB RAM / 0.1 vCPU, $0, free `.abasthan.app` subdomain).

`server.js` also spawns the Komari probe (`komari-agent` 1.5.11, bundled)
reporting to the panel; it connects with a per-client token from the
`KOMARI_TOKEN` env var (set in the Abasthan console, never in this repo).
Replace `index.html` with a real app whenever he names one.
