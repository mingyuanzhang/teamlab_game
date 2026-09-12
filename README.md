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
- Keys 1–6 select shapes. Enter on a focused shape places it. V selects Move, L selects Path, H selects Ladder, B selects Bounce, and Escape cancels a drag or selection. Ctrl/Cmd+Z undoes an edit. Selecting a tray shape stays in placement mode, including when tapping on top of another shape.

This is a small 2D simulation, not a full pathfinding system: people choose their own direction and decide whether to climb ladders they encounter. Released illustrations continue from their release position; moving a shape relocates future releases.

## Validation

```sh
node tests/world.test.cjs
```

Tests cover gravity, slope collisions, spring launches, ladder ascent, removing occupied supports, 36-object inventory, repeat timers, movement and undo, varied edge behavior, and ten simulated minutes at desktop and phone dimensions. `simulation.js` contains the physics and clocks; `world.js` draws the illustrations and handles browser input.

The visible interface uses icons only. Controls and status announcements retain screen-reader labels.
