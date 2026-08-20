# Decisions

## 2026-07-27 - Multiple dreams per calendar date
Dropped the UNIQUE(date) constraint. Why: users may log more than one dream
a night; forcing one entry per date was an artificial limit.

## 2026-07-27 - Free-text tags, no tags table
Tags stay a JSON array column with a free-text input + recent-tag chips,
not a normalized table. Why: no cross-device sync or tag analytics need
exists yet; a join table is unjustified abstraction at this scale.

## 2026-07-27 - No tab navigator
Search/settings are pushed screens reachable via header icons, not tabs.
Why: the app has three destinations total; a tab bar is unneeded structure.

## 2026-07-27 - Export only, no import
JSON export via the share sheet (native) or a browser download (web) ships;
re-import does not. Why: safely reconciling id collisions/schema drift on
import isn't trivial and no one has asked for cross-device restore yet.

## 2026-07-27 - Reminder time is now editable (supersedes "fixed time" above)
Added `@react-native-community/datetimepicker`; the settings screen lets
the user pick any hour/minute. The scheduled notification's own trigger is
the source of truth for the current time (read back via
`getAllScheduledNotificationsAsync`) — no separate settings table. Why:
the user asked for it directly; reading the trigger back avoids
duplicating state that could drift from what's actually scheduled. Not
available on web (`expo-notifications` doesn't implement scheduling there).

## 2026-07-27 - Mood and "type of dream" are separate per-dream fields
Mood (emotional tone: great/good/neutral/bad/nightmare) and dream type
(normal/lucid/nightmare/recurring/vivid) are two independent fixed-choice
fields on each dream, alongside free-text tags and the description. Why:
user explicitly wants both tracked distinctly rather than collapsed into
one field, even though "nightmare" is a valid value in both.

## 2026-07-27 - Sleep hours and quality moved from per-dream to per-day
New `day_logs` table (one row per date: sleep_hours, sleep_quality) since
sleep is a property of the night, not of an individual dream — this also
resolved the ambiguity from when multiple dreams could share a date but
each carried its own (redundant) sleep_hours value. Sleep quality uses the
same 5-point qualitative chip pattern as mood (excellent/good/fair/poor/
terrible) rather than a star rating, for UI consistency with mood/type.

## 2026-07-27 - Drag-to-reorder dreams within a day
Added `react-native-draggable-flatlist` (builds on the reanimated +
gesture-handler already in the app) and a `sort_order` column on `dreams`.
Order is per-date only; dragging in the day list persists immediately via
`reorderDreams`. Why: user wants dreams numbered #1, #2... within a day
and able to manually reorder them, which requires a persisted order beyond
creation time.
