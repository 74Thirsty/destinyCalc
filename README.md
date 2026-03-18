# Destiny Engine PWA

A small installable PWA that blends:
- Western zodiac
- Chinese zodiac with Chinese New Year adjustment
- Chinese element mapping
- Numerology life path

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Test

```bash
npm test
```

## Notes

- Everything runs client-side.
- No auth, backend, or database is included.
- The Chinese New Year lookup table covers 1990-2035 in full and falls back to Gregorian year logic outside that range.
- For `1979-06-01`, the numerology life path is `33`, not `6`, because the engine preserves master numbers `11`, `22`, and `33`.
