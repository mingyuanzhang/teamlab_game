# Little Wonders

An original, side-on browser playground about small lives and unexpected discoveries. Forty-eight little people walk along lines, climb ladders, fall under gravity, and bounce off spring paths. Their individual pace, appearance, curiosity, and willingness to step off an edge vary.

Six unnamed geometric shapes have six copies each, for up to 36 objects. Place one to discover its timed illustration. Move it to relocate the next reveal. Each shape repeats its animation automatically; selecting a tray shape places another copy until all six are in use. Each copy has its own clock and can be moved independently. Shapes can overlap each other and any running illustrations; placement or movement is blocked only where the shape would cover a little person.

The placed shapes are small, 14-pixel markers so the people and artwork carry the scene. Discoveries combine translucent ink clouds and rain, chrysanthemum fireworks, paper lantern balloons, layered flower petals, flowing silk, and miniature constellations. Each entrance springs past full size with squash, stretch, and a little rotation, then settles. Blooms and bursts have their own staggered pops. Each copy and repeat changes the composition; endings dissolve into drifting pigment without shrinking the artwork. Generous invisible drag targets keep the tiny shapes easy to move.

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
- Music begins after your first click, tap, or game key. Every discovery has its own melody and enters with its illustration on the soundtrack's beat. The Music menu offers Default, Brubeck, Metal, Sky Castle, Platformer, Tchaikovsky, Moonlight Ballad, Bounce, 高山流水, Bach, and Chopin; all six shapes follow that theme's harmony and groove. Brubeck is an original 5/4 quartet preview, with syncopated piano, upright bass, a warm alto lead, light drums, and a piano bridge. Metal is an original heavy-guitar preview at 152 BPM, with palm-muted riffs, driving kick and snare, and a half-time bridge. Sky Castle is an original orchestral waltz with flute, rolling harp, warm strings, and a soaring horn-supported section. Platformer adds an original bouncy chiptune arrangement with pulse leads, triangle bass, noise percussion, and short discovery jingles. Tchaikovsky adds an original dramatic ballet waltz with sweeping strings, woodwind answers, and a rising orchestral section. Jazz, Rock, and Classical are archived in the library and hidden from this menu; a saved archived selection opens as Default. The speaker button or **M** mutes everything. Theme and mute preferences are remembered. Audio pauses with the world and while the tab is hidden; browsers without Web Audio still play silently.
- Original themes have contrasting A/B sections; all discoveries vary their answers across repeats. A discovery plays its full melody whenever one of the three foreground slots is free. Crowded entrances rotate full phrases between competing copies and give the others clear, short accents. Melodies already playing finish uninterrupted, and every visual still enters on time. Softer dynamics, expressive instrument tone, and a small shared room keep the sound gentle.
- Keys 1–6 select shapes. Enter on a focused shape places it. V selects Move, L selects Path, H selects Ladder, B selects Bounce, Space pauses, M toggles sound, and Escape cancels a drag or selection. Ctrl/Cmd+Z undoes an edit. Selecting a tray shape stays in placement mode, including when tapping on top of another shape.

This is a small 2D simulation, not a full pathfinding system: people choose their own direction and decide whether to climb ladders they encounter. Released illustrations continue from their release position; moving a shape relocates future releases.

## Validation

```sh
node --test tests/*.test.cjs
```

Tests cover gravity, slope collisions, spring launches, ladder ascent, removing occupied supports, 36-object inventory, repeat timers, movement and undo, varied edge behavior, and ten simulated minutes at desktop and phone dimensions. `simulation.js` contains the physics and clocks; `illustrations.js` paints the six discoveries and controls their entrance springs and dissolves; `world.js` draws the world and connects browser input, music, and illustrations. Rendering tests cover overshoot, recoil, settling, variations, full-size dissolves, finite coordinates, bounded opacity, and balanced Canvas state.

The application harness loads the actual HTML and audio distribution and checks Canvas drawing at desktop and phone dimensions, all eleven visible themes, real reveal events and repeats, synchronized visual entrances and ribbon gusts, pending entrances after theme changes, saved preferences (including archived themes), mute, pause, visibility, reset, undo, and restricted storage. It does not replace listening and visual testing in a real browser.

## Shared music library

`vendor/wonder-audio/` is a generated local distribution of the standalone `wonder-audio` package shared with Little Wonders 3D. It includes a version/SHA-256 manifest and [score attribution](vendor/wonder-audio/NOTICE.md), including the adapted Chopin notation's CC BY-SA 3.0 license. The game needs no sibling checkout or build to run.

This 2D game is the music playground. To change the music, edit the sibling `../wonder-audio/audio.js`, run `npm test` in that package, then `npm run vendor` to update this game. `npm run vendor:check` checks its distribution and CSS/JavaScript cache hashes. Let the user listen and approve before upgrading the 3D, Waveshare, or pad_mod TeamLab versions. Keep the generated audio, notice, manifest, and updated HTML together in each game's commit. The library owns the synthesis and scheduling tests; this repository owns the 2D integration tests.

The shape, drawing, pause, and sound controls use icons. The music selector shows theme names. Controls and status announcements retain screen-reader labels.


Moonlight Ballad is an original 78 BPM romantic instrumental inspired by the requested mood of “The Moon Represents My Heart” (月亮代表我的心). A gentle flute melody, rolling guitar, soft piano, and restrained bass lead into a warmer string-supported section and a quiet piano return. The melody and six discovery phrases are original, not a transcription of the song. Paganini was removed after listening feedback; saved selections fall back to Default. Included in the approved 0.3.0 release.

Bounce is an original 102 BPM instrumental preview inspired by the requested playful hip-hop direction of Eminem’s “The Real Slim Shady.” Short clavinet-like keyboard cells, syncopated bass and kick, snare backbeats, and lightly swung hats lead into a sparse breakdown and a fuller return. Six short discoveries share the groove. Moonlight Ballad is retained following feedback; Bounce is included in the approved release.

Bounce’s revised harmony uses a repeating Cm–E♭–Fm–G loop with plain triads and a compact, repetitive keyboard hook. Discovery phrases emphasize repeated notes rather than flowing arpeggios. The 102 BPM tempo, swing, drum events, accompaniment entry times, and base discovery onset patterns are preserved from the first preview.

高山流水 is a new original guzheng preview at 84 BPM: spacious low-register phrases lead into flowing pentatonic runs, denser sweeps, and a quiet return. A fractional-delay plucked-string model adds ringing decay and gentle pressure bends. All accompaniment and discovery variants stay in the D-pentatonic collection, without chromatic approach notes or a drum backing. It draws on the mountain/water contrast associated with the Zhejiang version, rather than transcribing a particular score. The rejected generic Guzheng theme remains removed. Revised Bounce is retained unchanged; this theme is included in the approved release.
