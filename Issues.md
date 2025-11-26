1. Your current structure:
app/
   page.tsx          → desktop/web UI
   pwa/
      page.tsx       → PWA UI
      components/
      layout.tsx

This creates two versions of the site:

Web version → /

PWA version → /pwa

➡️ This is not wrong.
➡️ Many apps do this (Instagram lite, Twitter Lite, banking apps…).

But it DOES require routing logic — which you tried to push into middleware.
❗ 2. What breaks because PWA lives in /pwa

Here are all the technical consequences:

⚠️ Issue #1 — Service Worker Scope

A SW registered at:

/sw.js


controls:

/
/pwa


BUT a SW registered at:

/pwa/sw.js


controls only:

/pwa/*


Depending on how you're registering your SW, you may be limiting its caching power.

⚠️ Issue #2 — Manifest applies site-wide

manifest.json is global.

Browsers expect the PWA to behave uniformly everywhere.

But you have two UIs:

/ → web

/pwa → app-like

Browsers don’t know this.

⚠️ Issue #3 — Installation path

When users “Install app”, browsers save:

start_url


If your manifest contains:

"start_url": "/pwa"


Then:

PWA opens directly into /pwa

But user visiting your domain normally sees /

This is fine only if you intentionally separate them.

⚠️ Issue #4 — You relied on middleware UA detection

Because the UX is split, the app needs logic to decide:

Should user see / or /pwa?

But you built this logic in middleware → bad for performance.

❗ 3. Common problems in your code organization

Your middleware is trying to handle too many things:

Detect standalone mode

Detect Capacitor webview

Detect PWA query param (?pwa=true)

Set PWA cookies

Rewrite URLs to /pwa

Handle login redirect

Handle admin security

Avoid static files

Clear mode

This is too much for middleware.

💡 The Best Architecture (based on your desire for separate UI)

You said:

"The PWA UI/UX is inside app/pwa"

So the correct architecture for you is this:

🟩 Final Ideal Architecture

This is what modern apps do when they want 2 different UIs:

1️⃣ Keep two UIs
/ → Web  
/pwa → PWA


✔️ This is totally valid.

2️⃣ Use Client-Side Detection — NOT middleware

Inside /app/layout.tsx (global root):

useEffect(() => {
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches
    || navigator.standalone;

  if (isStandalone && !window.location.pathname.startsWith("/pwa")) {
    window.location.replace("/pwa");
  }
}, []);

Benefits:

No middleware rewrites

No cookies

No UA parsing

Works offline

Works in Capacitor

Works after app is installed

3️⃣ Capacitor always opens /pwa

Capacitor config:

"server": {
  "url": "https://yourdomain.com/pwa",
  "cleartext": true
}


Done.

4️⃣ Manifest

Make your manifest start on /pwa:

"start_url": "/pwa",
"display": "standalone",

5️⃣ Service Worker

Place it in /public/sw.js so it controls whole site — or restrict to /pwa if you want.

🟩 Admin middleware stays alone

Your final middleware should be ONLY:

protect /admin/*

redirect /login

That’s it.

Middlewares must stay tiny.

🟦 6. Problems you should fix now (to avoid future bugs)
🚨 Issue: Too much UA sniffing

UA is unreliable and can break after browser updates.

🚨 Issue: Cookies inside middleware

This makes pages dynamic and kills caching.

🚨 Issue: URL rewriting in middleware

Can conflict with service worker navigation fallback.

🚨 Issue: Manifest applies globally

Make sure manifest uses:

start_url: "/pwa"
scope: "/"

🚨 Issue: Your /pwa routes must not use dynamic segments without handling offline pages

SW fallback is needed.

🟢 Summary — Best answer for you
✔️ You CAN keep your PWA UI inside /app/pwa

This is valid and widely used.

❌ But your middleware approach is overkill and will cause problems

Move detection to the client (React) instead.

✔️ Keep middleware ONLY for admin auth

Your admin logic is good.

✔️ Use manifest + SW to control PWA entry

Not middleware.

✔️ Capacitor should explicitly load /pwa

No detection needed.