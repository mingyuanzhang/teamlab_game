# Little Wonders

An original, side-on browser playground about small lives and unexpected discoveries. Forty-eight little people walk along lines, climb ladders, fall under gravity, and bounce off spring paths. Their individual pace, appearance, curiosity, and willingness to step off an edge vary.

Six unnamed geometric shapes have six copies each, for up to 36 objects. Place one to discover its timed illustration. Move it to relocate the next reveal. Each shape repeats its animation automatically; selecting a tray shape places another copy until all six are in use. Each copy has its own clock and can be moved independently. Shapes can overlap each other and any running illustrations; placement or movement is blocked only where the shape would cover a little person.

Open `index.html` in a modern browser, or serve this folder:

```sh
python3 -m http.server 8000
```

Visit http://localhost:8000. No build or install is required. The page works offline using local fonts.

## Play

- Select a shape below the world, then tap to place it. Or drag it straight from the tray.
- Select the arrow (Move), then drag a placed shape to move it. The six dots beneath each tray shape indicate how many copies are in the world.
- Select Path, Ladder, or Bounce on the right, then drag to draw. A very steep path becomes a ladder. Ladders work best when their ends meet a path or the ground.
- Undo reverses a placement, move, or drawn line. Reset returns all copies to their tray and restores the starting paths.
- Pause freezes the people, discovery clocks, and illustrations.
- Music begins after your first click, tap, or game key. Every discovery has its own melody and enters with its illustration on the soundtrack's beat. The Music menu selects Default, Jazz, Rock, Classical, Bach, or Chopin; all six shapes follow that theme's harmony and groove. The speaker button or **M** mutes everything. Theme and mute preferences are remembered. Audio pauses with the world and while the tab is hidden; browsers without Web Audio still play silently.
- Keys 1–6 select shapes. Enter on a focused shape places it. V selects Move, L selects Path, H selects Ladder, B selects Bounce, Space pauses, M toggles sound, and Escape cancels a drag or selection. Ctrl/Cmd+Z undoes an edit. Selecting a tray shape stays in placement mode, including when tapping on top of another shape.

This is a small 2D simulation, not a full pathfinding system: people choose their own direction and decide whether to climb ladders they encounter. Released illustrations continue from their release position; moving a shape relocates future releases.

## Validation

```sh
node --test tests/*.test.cjs
```

Tests cover gravity, slope collisions, spring launches, ladder ascent, removing occupied supports, 36-object inventory, repeat timers, movement and undo, varied edge behavior, and ten simulated minutes at desktop and phone dimensions. `simulation.js` contains the physics and clocks; `world.js` draws the illustrations and handles browser input.

The application harness loads the actual HTML and audio distribution and checks Canvas drawing at desktop and phone dimensions, all six themes, real reveal events and repeats, synchronized visual entrances and ribbon gusts, pending entrances after theme changes, saved preferences, mute, pause, visibility, reset, undo, and restricted storage. It does not replace listening and visual testing in a real browser.

## Shared music library

`vendor/wonder-audio/` is a generated local distribution of the standalone `wonder-audio` package shared with Little Wonders 3D. It includes a version/SHA-256 manifest and [score attribution](vendor/wonder-audio/NOTICE.md), including the adapted Chopin notation's CC BY-SA 3.0 license. The game needs no sibling checkout or build to run.

To change the music, edit the sibling `../wonder-audio/audio.js`, run `npm test` in that package, then `npm run vendor` to update both games. `npm run vendor:check` checks the distributions and CSS/JavaScript cache hashes. Keep the generated audio, notice, manifest, and updated HTML together in each game's commit. The library owns the synthesis and scheduling tests; this repository owns the 2D integration tests.

The shape, drawing, pause, and sound controls use icons. The music selector shows theme names. Controls and status announcements retain screen-reader labels.
