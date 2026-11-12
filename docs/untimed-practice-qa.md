# Untimed practice validation

Issue: #213. Practice is opt-in on level selection. Mode changes cannot alter
scoring rules mid-round. Timed saves retain their keys; practice scores, level
progress and daily history are separate.

## Automated checks

- 184 tests across 9 files pass: equal practice credit for fast and slow answers,
  separate records, legacy saves, round resets, persistence and DOM accessibility.
- Changed-source formatting, diff whitespace and Vite production build pass.
  Full-tree formatting passed in the Linux checkout; Windows reports CRLF
  differences in untouched files. Those files were not rewritten.
- StrictMode regression coverage protects saved records from the mount-time
  restore/save race found during interactive reload testing and fixed here.
- Standalone `tsc --noEmit` remains blocked by the existing TypeScript 4 /
  `moduleResolution: "bundler"` configuration mismatch, unrelated to this change.

## Interactive checks (Chrome on Windows, 2026-11-12)

- Native checkbox Space activation, visible focus, correct label/description.
- Completed a five-question practice level using keyboard answer entry/Enter:
  score 57, accuracy 100%, three stars. No countdown or time penalty.
- Completed practice level again after hydration fix; reload retained its three
  stars and unlocked level 2. Toggling timed showed its separate untouched
  records and a 30-second countdown; practice retained its best score 57.
- Reload retained selected practice mode and dismissed-tutorial preference.
- Started practice daily challenge; untimed label remained and best score came
  from practice. Spanish and French labels updated through language controls.
- Inspected desktop and 390 x 844 mobile layouts: practice label, description,
  records status and game score panel readable without horizontal clipping.
  Temporary viewport override reset afterward.

## Remaining coverage limitations

No real assistive-technology speech-output audit was performed. The native
checkbox and its accessible label/description are covered, but this is not a
claim that the entire existing game is screen-reader accessible. Daily-history
separation is covered by automated tests; a full daily round in each mode has
not been manually completed. Existing daily/world labels are not fully localized.