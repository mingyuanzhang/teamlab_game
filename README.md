# Little Wonders

A small, original browser playground inspired by the joy of interactive projection art. Place objects in the meadow to grow flowers, trees, ponds, homes, glowing lanterns, mushrooms, music boxes, pinwheels, and campfires. Forty-eight little people wander over and react.

Open `index.html` in a modern browser, or serve this folder:

```sh
python3 -m http.server 8000
```

Then visit http://localhost:8000. No build or install is required. Fonts use Google Fonts when online, with local fallbacks.

Click an object and then the meadow, or drag an object into the scene. Number keys 1–9 select objects; Enter on a focused object button places it automatically. Undo removes the last object; the circular arrow restores the starting scene. Pause freezes the animation.

The illustrations are drawn directly with Canvas and adapt to desktop and touch screens.

People have six personalities: explorers, dancers, daydreamers, gardeners, daredevils, and social butterflies. Their interests influence what they visit, and their pace, appearance, visit duration, and activities vary. Only some people investigate a newly placed object; others carry on with their own plans.

Run the regression checks with Node.js (no dependencies):

```sh
node tests/world.test.cjs
```

The tests reproduce the completed-visit crash and exercise ten simulated minutes at desktop and phone dimensions, including object removal, empty worlds, reset, pause/resume, and resize. Canvas drawing is stubbed; visual layout requires a browser check.
