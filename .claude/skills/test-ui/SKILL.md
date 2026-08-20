---
name: test-ui
description: "Drive this Expo app's web build with headless Playwright to verify a UI change end-to-end: launch expo start --web, click through the actual feature, screenshot, check for console errors."
---

Run and drive `my-app` (Expo SDK 54, expo-router 6) on web to prove a UI
change works — not just that it type-checks or lints. Use this before
reporting any frontend/screen change as done. Produces screenshots at each
step plus a console-error check.

## Why headless Chromium against `--web`, not a simulator

This is the cheapest way to visually exercise expo-router screens in this
sandbox: no simulator/EAS build, and most business logic (SQLite via
`expo-sqlite`, routing, hooks) behaves the same on web. Known web-only gaps
to watch for (see Gotchas) — if a flow depends on one of those, note it as
unverified rather than skipping the whole check.

## Step 1: One-time Playwright setup (isolated, not a project dependency)

Do **not** add `playwright` to `package.json` — this app doesn't ship
tests, and the CLAUDE.md rule against unnecessary dependencies applies.
Instead install it into the scratchpad, once per session:

```bash
PW_DIR="$TMPDIR/pw-test"   # or the session scratchpad dir if one is set
mkdir -p "$PW_DIR" && cd "$PW_DIR"
[ -f package.json ] || npm init -y >/dev/null
npm ls playwright >/dev/null 2>&1 || npm install playwright@1.62.0
npx playwright install chromium   # no-ops instantly if already cached
cd -
```

`npx playwright install chromium` needs network access — if the sandbox
blocks it, retry with `dangerouslyDisableSandbox: true` (same for the
`npm install`).

## Step 2: Start the dev server

```bash
rm -f dreams.db   # optional: start from an empty DB for a clean run
lsof -ti:8098 -sTCP:LISTEN | xargs -r kill 2>/dev/null
nohup npx expo start --web --port 8098 > /tmp/expo-web.log 2>&1 & disown
timeout 40 bash -c 'until curl -sf http://localhost:8098 >/dev/null; do sleep 1; done'
```

Requires `dangerouslyDisableSandbox: true` (binds a port, spawns a
long-running background process). Pick a port, remember it, and always
`lsof -ti:<port> -sTCP:LISTEN | xargs -r kill` before relaunching or you'll
hit `EADDRINUSE`.

## Step 3: Drive it with a script, not by hand

Write a Node script (scratchpad, not the repo) that requires Playwright
from `$PW_DIR/node_modules/playwright` and drives the page. Template —
adapt the `nav`/interaction block to the feature under test, keep the
harness:

```js
const { chromium } = require('/absolute/path/to/pw-test/node_modules/playwright');
const SHOT_DIR = '/absolute/path/to/scratchpad/shots';
require('fs').mkdirSync(SHOT_DIR, { recursive: true });
const errors = [];

async function shot(page, name) {
  await page.screenshot({ path: `${SHOT_DIR}/${name}.png` });
  console.log(`[shot] ${name}`);
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 420, height: 900 } });
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', (err) => errors.push(String(err)));
  page.on('dialog', async (dialog) => { console.log('[dialog]', dialog.message()); await dialog.accept(); });

  await page.goto('http://localhost:8098', { waitUntil: 'domcontentloaded' });
  await page.getByText('Dream Atlas').waitFor({ timeout: 20000 });
  await shot(page, '01-start');

  // ... feature-specific nav/fill/click steps, screenshot after each ...

  console.log('CONSOLE_ERRORS:', JSON.stringify(errors));
  await browser.close();
})().catch((err) => { console.error('SCRIPT_FAILED:', err); process.exit(1); });
```

Run it with `node <script>.js` (`dangerouslyDisableSandbox: true` —
launches a browser process). Read the resulting screenshots with the Read
tool and actually look at them; a script exiting 0 with no console errors
is necessary but not sufficient — a blank or error-overlay frame still
passes both checks.

## Step 4: Clean up

```bash
lsof -ti:8098 -sTCP:LISTEN | xargs -r kill 2>/dev/null
rm -f dreams.db   # if you reset it in step 2, don't leave a throwaway DB behind
```

## Gotchas specific to this app

- **`Alert.alert` is a no-op on `react-native-web`** (confirmed via
  `node_modules/react-native-web/dist/exports/Alert` — the whole class is
  `static alert() {}`). Any confirm-before-destructive-action flow must go
  through `@/utils/confirm.ts` (`window.confirm` on web, `Alert.alert` on
  native), not raw `Alert.alert`, or the button will silently do nothing
  on web and nothing will look wrong until you check.
- **`expo-notifications` local-scheduling calls throw on web**
  (`getAllScheduledNotificationsAsync`, `scheduleNotificationAsync`, etc.).
  `services/notifications.ts` guards every call behind
  `Platform.OS !== 'web'`; if you add a new notifications call, guard it
  the same way or the dev error overlay will eat all further clicks on
  that screen (looks like a hang, not a crash, in a driver script).
- **Playwright's `getByLabel` matches substrings by default.** Two
  `accessibilityLabel`s like `"Delete dream"` and `"Delete dream from
  list"` will both match `getByLabel('Delete dream')` — use
  `{ exact: true }` or give overlapping controls distinct labels. This
  bites especially because `expo-router` keeps the screen underneath a
  `presentation: 'modal'` route mounted, so labels from both screens are
  live in the DOM simultaneously.
- **`react-native-gesture-handler`'s `Swipeable`** needs
  `GestureHandlerRootView` wrapping the app root (`app/_layout.tsx`) or
  swipe actions won't register on any platform, web included.
- **Mood chips vs. tags vs. dream type**: mood is the fixed emotional-tone
  enum (`constants/moods.ts`), dream type is a separate fixed enum
  (`normal`/`lucid`/`nightmare`/`recurring`/`vivid`, `constants/
  dream-types.ts`) — both render as similarly-styled chips on the same
  screen, so a text-based click locator can hit the wrong one. Prefer
  `{ exact: true }` and, where both lists share a value (`nightmare`
  appears in both), disambiguate with `.first()`/`.last()` or scope to a
  container. Tags are free text, no fixed list.
- **`react-native-draggable-flatlist` drag can't be reliably proven from
  headless Chromium.** Wiring `drag()` off a handle's `onLongPress` (the
  library's documented pattern) is correct, but simulating the
  long-press-then-pan activation with Playwright's synthetic
  `page.mouse.down()` / `move()` / `up()` did not trigger a reorder in
  practice — this reads as a mouse-event/gesture-handler-web activation
  gap, not proof the feature is broken. Treat drag-to-reorder (and any
  other gesture-handler-driven interaction beyond simple tap/swipe) as
  **render-verified only** on web; confirm the actual drag on a real
  device or simulator before calling it done.
- **`@react-native-community/datetimepicker` has no web implementation**
  (no `*.web.*` files in the package) — gate any `<DateTimePicker>` render
  behind a `Platform.OS !== 'web'` check (see `services/notifications.ts`'s
  `isReminderSupported`) and provide a plain-text fallback, the same
  pattern already used for the reminder toggle.
- **`expo-sqlite` on web persists per browser profile.** Each
  `chromium.launch()` in a fresh Node script starts an ephemeral profile
  with empty IndexedDB — data written in one script run is gone in the
  next. To verify a multi-step flow (e.g. create dreams, then reorder
  them), do it in one script/one page session; don't split it across
  separate `node` invocations expecting state to carry over.
