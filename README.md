# Planner

**A cozy room that is your planner and diary.** Every object in the room opens a part of your life: the diary on the bed, books on the shelf, notes on the corkboard, plans on the desk calendar.

**Live:** https://inesa07.github.io/Planner/

![My room](docs/room.jpg)

---

## Case study

### The problem

Plans, ideas, book lists and diary thoughts end up scattered across phone notes, a calendar app, a reading app and a paper notebook. After a few days it is hard to find anything, and none of these apps make you *want* to come back. Productivity apps feel like work, and diary apps feel empty.

### Who it is for

People who like journaling and cozy, personal things (the "study with me", lo-fi and bullet-journal crowd), who want one calm place for the day and are put off by dashboards full of lists.

### The idea

Turn the app into a **place** instead of a list. The home screen is a small isometric room. Instead of a menu, you tap the bed to open your diary, the shelf to see your books, the board for notes and the desk calendar for plans. The room changes with what you do, so it becomes a mirror of your days:

- the plant grows a leaf for every day in a row you write in the diary
- books you add appear on the shelf, the ones you are reading face out with their covers
- the window follows the real time of day and, if you want, the real weather where you are
- marbles fill the mood jar, one for every day of the month
- your cat or dog sleeps on the bed in the afternoon and sits on the window sill in the morning
- the room gets pumpkins in autumn, a little tree in December, heart balloons for Valentine's

### Product decisions

| Decision | Why |
| --- | --- |
| **The room is the navigation** | It makes the app feel like a place you visit, not a tool you use. It also teaches the app without a tutorial: every object has a label. |
| **Four rooms with their own shape** (a Nordic cabin with a pointed roof, a night observatory with a dome, a seaside studio with a deck, a pastel room with a raised platform) | The first rooms were the same box in different colours, and users said they all looked alike. Now every room has its own silhouette and furniture; the blanket, picture, window view and pet can still be changed. |
| **A reading tracker, not an e-reader** | Reading inside a planner competes with Kindle and has copyright problems. Tracking (progress, a reading timer, quotes, a yearly goal) fits the diary and the shelf. |
| **A paper diary, not a text editor** | Pages turn like a book, you can drag stickers, photos and text between pages, rotate them and draw. Deleted pages are crumpled into a recycle bin and can be brought back. |
| **Undo instead of "Are you sure?"** | Deleting is quick, and a toast with *Undo* fixes mistakes without slowing everyone down. |
| **Friends see your room, never your diary** | Social features make people come back, but a diary must feel private. A friend can visit your room and shelf and leave a note on your board, nothing else. |
| **Local first** | Everything is saved on the device first, so the app opens instantly and works offline. Sign-in syncs it between phone and computer. |
| **Removed the "quick capture" field** | It tried to guess where a sentence belongs. It was clever but confusing, and the room already makes each place obvious. |

### Features

- **Diary**: a book that grows without a limit; text, pen, stickers, photos, page styles; drag between pages; rotate; *Keep* a page in the memory chest; recycle bin; search across all pages; save the whole diary as a PDF
- **Books**: want to read / reading / read, page progress, reading timer, rating, review, quotes (one tap puts a quote in your diary), yearly goal
- **Notes** on coloured paper, with search
- **Calendar**: month and week, times and reminders
- **Mood**: pick how you feel in the menu or in the mood jar; the calendar is tinted by your moods
- **Weather and sounds**: real weather in the window (Open-Meteo), and quiet room sounds made in the browser (rain, fireplace, birds, sea, summer night)
- **Friends**: a friend code, visit a friend's room and shelf, leave a note on their board
- **Your year**: a yearly wrap-up of diary days, books, moods, plans and your room
- **Light and dark** look, works on phone and computer, installable as an app (PWA)
- **Onboarding** in three steps: your name, your room, your first thing

<p>
  <img src="docs/diary.jpg" width="49%" alt="Diary">
  <img src="docs/rooms.jpg" width="49%" alt="Choose your room">
  <img src="docs/friend.jpg" width="49%" alt="A friend's room">
  <img src="docs/year.jpg" width="49%" alt="Your year">
  <img src="docs/night-snow.jpg" width="49%" alt="Snow outside in the evening">
  <img src="docs/phone.jpg" width="24%" alt="On a phone">
</p>

### Measuring it

The app sends anonymous usage events (which pages are opened, that something was added — never what people write) to a table that only the owner's account can read, enforced by the database itself (row level security). The owner sees an `#admin` page with:

- **DAU / WAU / MAU** and **D1 / D7 retention**: do people come back?
- **Onboarding funnel**: how many finish each step
- **Engagement**: diary days, and how many books, plans and notes people add
- Which rooms people choose, which pages they use, how many diary days per person

These answer the main questions of the product: *does the room make people come back,* and *which part of the room do they actually use?*

### What I would do next

1. Push reminders when the app is closed (needs a small server)
2. Shared rooms: decorate a room together with a friend
3. More rooms and furniture, and seasonal items you can keep
4. AI help: "what did I write about Anna this year?" across the diary

---

## Technology

Plain HTML, CSS and JavaScript modules, no build step. The room is drawn as SVG on an isometric grid in code (no images). Data lives in `localStorage` and IndexedDB, and syncs through **Supabase** (auth, Postgres, row level security).

### Run it

```bash
python3 -m http.server 8000
```

Open http://localhost:8000. Settings for Supabase are in `js/config.js`; run the files in `supabase/` once in the Supabase SQL Editor:

- `setup.sql`: your data and sync
- `analytics.sql`: anonymous usage events, readable only by the owner
- `friends.sql`: friend codes, friendships and notes

### Project structure

```
index.html              menu and page frame
css/                    styles, page styles, the light look
js/app.js               menu, greeting, mood picker, switching pages
js/room.js              draws every room, its furniture, pets, weather and seasons
js/store.js             notes, books, calendar, moods and room settings
js/db.js                diary pages and pictures (IndexedDB)
js/sync.js              sign-in and sync with Supabase
js/friends.js           friend codes, friends' rooms, notes for friends
js/weather.js           real weather from Open-Meteo
js/sounds.js            room sounds made with Web Audio
js/analytics.js         anonymous usage events
js/onboarding.js        the three welcome steps
js/views/*.js           the pages: room, diary, books, notes, calendar, friends, your year, admin
sw.js                   offline support
supabase/*.sql          database tables and access rules
```
