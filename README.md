# Planner

A cozy room that is your planner and diary.

## The problem

Ideas, tasks and notes end up scattered in phone notes. After a few days it is hard to find anything: you have to open and reread every note to remember where you wrote what.

## The idea

Your planner is a small isometric room. Every object is a part of it:

| Object | What it holds |
| --- | --- |
| Desk | Tasks for today and the coming days |
| Corkboard | Ideas and notes, sorted by topic |
| Bookshelf | Books you want to read, are reading and have read |
| Bed with an open diary | Diary entries and feelings |
| Window | The real time of day (weather later) |
| Plant | Your streak: a new leaf for every day in a row with a finished task |

You write everything in **one input**, and the app decides where it belongs:

- "call grandma tomorrow 18:00" → a task on the desk, tomorrow at 18:00
- "idea: dark mode" → a note on the corkboard
- "read The Little Prince" → a book on the shelf
- "today was calm and I felt proud" → a diary entry

The room grows with you: books appear on the shelf, notes on the corkboard, leaves on the plant.

## Run it

No build step. Serve the folder with any static server, for example:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000. On iPhone, open the site in Safari and choose **Share → Add to Home Screen** to use it like an app.

## Project structure

```
index.html            page layout
css/styles.css        styles, phone first, room + panel side by side on computers
js/app.js             rendering and events
js/room.js            the room illustration and its clickable spots
js/classify.js        decides where a note belongs (word rules for now, AI later)
js/store.js           data, saved in the browser (localStorage)
sw.js                 offline support
manifest.webmanifest  install as an app
```

## Next steps

- Sign in and sync between phone and computer (Supabase)
- AI that understands any sentence instead of word rules
- Reminders as push notifications
- Real weather in the window
- Choose wall colors, furniture and a pet
