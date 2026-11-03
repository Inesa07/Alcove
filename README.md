# Planner

A cozy room that is your planner and diary.

## The problem

Ideas, plans and notes end up scattered in phone notes. After a few days it is hard to find anything: you have to open and reread every note to remember where you wrote what.

## The idea

The menu is on the left. **My room** is a small isometric room, and every object in it opens a part of the app:

| In the room | Opens | What you do there |
| --- | --- | --- |
| Bed with an open diary | **Diary** | A book with a page spread for every day: write, draw with a pen, add stickers and photos, choose the paper, say how the day felt |
| Bookshelf | **Books** | Collect the books you have read, with their covers. The shelf in the room fills up with every book |
| Corkboard | **Notes** | Anything you want to remember, on coloured paper notes, with search |
| Desk calendar | **Calendar** | Month and week view. Write what you need to do on a day, add a time and get a reminder |

**Decorate** lets everyone make the room their own: wall and floor colours, a rug, and different bookshelves, desks and beds in different colours. The window follows the real time of day, the lamps turn on in the evening, and the plant grows a leaf for every day in a row you write in your diary.

You can also write anything in the field under the room, and it goes to the right place:

- "dentist Friday 11:00" → Calendar, with a reminder
- "read The Little Prince" → Books
- "I feel calm and proud today" → Diary
- anything else → Notes

## Run it

No build step. Serve the folder with any static server, for example:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000. On iPhone, open the site in Safari and choose **Share → Add to Home Screen** to use it like an app.

## Project structure

```
index.html              menu and page frame
css/styles.css          layout, menu, shared buttons; phone layout puts the menu at the bottom
css/views.css           styles for each page
js/app.js               menu, greeting, switching pages
js/room.js              draws the room on an isometric grid, with all decorating options
js/stickers.js          diary stickers
js/store.js             notes, books, calendar and room settings (saved in the browser)
js/db.js                diary pages and pictures (saved in IndexedDB, because they are bigger)
js/classify.js          decides where a quick note belongs (word rules now, AI later)
js/reminders.js         reminders for calendar events
js/views/*.js           the pages: room, diary, books, notes, calendar
sw.js                   offline support and opening the calendar from a reminder
```

## What is not there yet

- Everything is saved only in this browser. Sign-in and sync between phone and computer come next (Supabase).
- Reminders work while the app is open. Reminders when it is closed need a server (push notifications).
- The quick field understands simple English phrases. Later an AI model will understand any sentence.


## Sync between devices (Supabase)

Everything is saved on the device first, so the app also works offline. To keep the phone and the computer the same:

1. Create a free project at supabase.com.
2. In **SQL Editor**, run `supabase/setup.sql` once. It creates one table, and each person can only read and write their own rows.
3. In **Authentication → Sign In / Providers → Email**, you can turn off "Confirm email" so new accounts work right away.
4. Copy **Project URL** and the **anon public key** (Project Settings → API) into `js/config.js`.

Then tap **Sync** at the top of the menu, create an account on one device and sign in with it on the others.
Each piece of data (`state`, every diary page `bp:N`, every book cover `cover:<id>`) is one row; when the same piece changed on two devices, the newer change wins.
