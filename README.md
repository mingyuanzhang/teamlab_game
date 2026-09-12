# Little Wonders

An original, side-on browser playground about small lives and unexpected discoveries. Forty-eight little people walk along lines, climb ladders, fall under gravity, and bounce off spring paths. Their individual pace, appearance, curiosity, and willingness to step off an edge vary.

Six unnamed geometric shapes are the entire inventory. Place one to discover its timed illustration. Move it to relocate the next reveal. Each shape repeats its animation automatically; selecting it again moves the existing object rather than making a copy.

Open `index.html` in a modern browser, or serve this folder:

```sh
python3 -m http.server 8000
```

Visit http://localhost:8000. No build or install is required. Google Fonts are optional; local fonts work offline.

## Play

- Select a shape below the world, then tap to place it. Or drag it straight from the tray.
- Drag a placed shape to move it. The small mark beneath its tray slot indicates it is in the world.
- Select Path, Ladder, or Bounce on the right, then drag to draw. A very steep path becomes a ladder. Ladders work best when their ends meet a path or the ground.
- Undo reverses a placement, move, or drawn line. Reset returns the six shapes to their tray and restores the starting paths.
- Pause freezes the people, discovery clocks, and illustrations.
- Keys 1–6 select shapes. Enter on a focused shape places it. V selects Move, L selects Path, H selects Ladder, B selects Bounce, and Escape cancels a drag or selection. Ctrl/Cmd+Z undoes an edit.

This is a small 2D simulation, not a full pathfinding system: people choose their own direction and decide whether to climb ladders they encounter. Released illustrations continue from their release position; moving a shape relocates future releases.

## Validation

```sh
node tests/world.test.cjs
```

Tests cover gravity, slope collisions, spring launches, ladder ascent, removing occupied supports, six-object inventory, repeat timers, movement and undo, varied edge behavior, and ten simulated minutes at desktop and phone dimensions. `simulation.js` contains the physics and clocks; `world.js` draws the illustrations and handles browser input.
