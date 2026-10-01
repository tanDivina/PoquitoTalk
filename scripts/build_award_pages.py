"""Build the Funnel Vision (funnel.html) and Peace Prize (peace.html) award pages.

They reuse the shell of growth-loop.html (head, styles, nav, footer, Poquito guide)
so all award pages look the same. Re-run after editing the copy below, then deploy.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WEB = ROOT / "web-funnel"
YT = "fTFZ1pqm_HQ"

base = (WEB / "growth-loop.html").read_text()
HEAD = base[: base.index("  <!-- Page Main Shell -->")]
FOOT = base[base.index("    <!-- Footer -->"):]

EXTRA_CSS = """    .phones{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;align-items:start}
    .phones figure{margin:0;text-align:center}
    .phones img{width:100%;max-width:240px;display:block;margin:0 auto;border-radius:26px;box-shadow:0 18px 40px rgba(26,18,8,.14)}
    .phones figcaption{margin-top:12px;color:#5C4E3A;font-size:14.5px;line-height:1.5}
    .phones b{display:block;color:#1A1208;font-size:15.5px;margin-bottom:2px}
    .two{display:grid;grid-template-columns:1fr 1fr;gap:18px}
    .path{background:#fff;border:2px solid rgba(150,72,36,.12);border-radius:24px;padding:24px;display:grid;grid-template-columns:150px 1fr;gap:20px;align-items:center;box-shadow:0 12px 30px rgba(0,0,0,.05)}
    .path img{width:150px;border-radius:20px;box-shadow:0 12px 26px rgba(26,18,8,.14)}
    .path h3{font-family:'Lexend',sans-serif;margin:6px 0 8px;font-size:21px;color:#1A1208}
    .path p{margin:0;color:#5C4E3A;line-height:1.55;font-size:15.5px}
    .path .who{font-size:12.5px;letter-spacing:1.5px;text-transform:uppercase;font-weight:800;color:#047857}
    .flow{display:flex;flex-wrap:wrap;gap:10px;align-items:center}
    .flow span{background:#fff;border:2px solid rgba(150,72,36,.12);border-radius:14px;padding:10px 14px;font-weight:700;color:#1A1208;font-size:15px}
    .flow i{font-style:normal;color:#964824;font-weight:900}
    .vid{width:100%;border-radius:20px;display:block;box-shadow:0 12px 30px rgba(0,0,0,.08)}
    @media (max-width:820px){.phones{grid-template-columns:1fr 1fr}.two{grid-template-columns:1fr}.path{grid-template-columns:110px 1fr}.path img{width:110px}}
  </style>"""


def yt(ts):
    m, s = ts.split(":")
    return f'<a href="https://youtu.be/{YT}?t={int(m) * 60 + int(s)}" target="_blank" rel="noopener">{ts}</a>'


def build(filename, title, desc, og_image, main, lines):
    head = HEAD
    head = re.sub(r"<title>.*?</title>", f"<title>{title}</title>", head, count=1)
    for attr in ('name="description"', 'property="og:description"', 'name="twitter:description"'):
        head = re.sub(rf'(<meta {attr} content=")[^"]*', rf"\g<1>{desc}", head)
    for attr in ('property="og:title"', 'name="twitter:title"'):
        head = re.sub(rf'(<meta {attr} content=")[^"]*', rf"\g<1>{title}", head)
    head = head.replace("https://poquitotalk.hero-apps.com/layers/layers_clips.jpg", og_image)
    head = head.replace("  </style>", EXTRA_CSS, 1)
    foot = re.sub(r"var sectionLines = \{.*?\};", "var sectionLines = {\n" + ",\n".join(
        f"        '{k}': '{v}'" for k, v in lines.items()) + "\n      };", FOOT, flags=re.S)
    (WEB / filename).write_text(head + "  <!-- Page Main Shell -->\n  <main class=\"page-shell\">\n" + main + foot)
    print("built", filename)


FUNNEL = f"""
    <section class="hero-box">
      <div class="award-pill">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h18l-7 8.5V19l-4 2v-8.5z"/></svg>
        RevenueCat Shipaton 2026 &bull; Funnel Vision Award Entry
      </div>
      <h1 class="hero-title">From the Web to the App</h1>
      <p class="hero-subtitle">PoquitoTalk has two kinds of customers. Residents subscribe in the app on Google Play. Tourists, here for a few days, buy credits on the web through a RevenueCat funnel with Stripe, and land in the app with their credits ready.</p>
      <div class="founder-meta">
        <span>Built by <strong>Dorien Van den Abbeele</strong></span><span>&bull;</span>
        <a href="https://play.google.com/store/apps/details?id=com.heroapps.poquitotalk" target="_blank" rel="noopener">Live on Google Play</a><span>&bull;</span>
        <span>Bocas del Toro, Panama 🇵🇦</span>
      </div>
    </section>

    <div class="stats-ribbon">
      <div class="stat-card"><div class="stat-num">$3.74</div><div class="stat-label">Web launch price</div></div>
      <div class="stat-card"><div class="stat-num">$4.99</div><div class="stat-label">Same pack in the app</div></div>
      <div class="stat-card"><div class="stat-num">3</div><div class="stat-label">Slides to checkout</div></div>
      <div class="stat-card"><div class="stat-num">1 tap</div><div class="stat-label">To redeem in the app</div></div>
      <div class="stat-card"><div class="stat-num">#3</div><div class="stat-label">Stripe Projects leaderboard</div></div>
    </div>

    <section>
      <div class="section-header">
        <span class="section-tag">In the demo</span>
        <h2 class="section-title">The Funnel in 21 Seconds</h2>
        <p class="section-desc">The Funnel Vision part of our Shipaton demo.</p>
      </div>
      <div class="yt"><iframe src="https://www.youtube-nocookie.com/embed/{YT}?start=50&end=71&rel=0" title="PoquitoTalk demo: from the web to the app" loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>
    </section>

    <section>
      <div class="section-header">
        <span class="section-tag">Two customers</span>
        <h2 class="section-title">Two Paths, One App</h2>
        <p class="section-desc">Someone visiting Bocas for five days will never commit to a yearly subscription. Someone who lives here uses PoquitoTalk every week. So each gets the path that fits.</p>
      </div>
      <div class="two">
        <article class="path"><img src="funnel/paywall_play.jpg" alt="PoquitoTalk paywall in the Android app with three plans" loading="lazy" /><div><span class="who">Residents &middot; in the app</span><h3>Subscriptions on Google Play</h3><p>RevenueCat SDK with Google Play Billing. One offering, three packages: Annual Explorer Pass ($39.99/year, 7-day free trial), Monthly Resident Pass ($9.99) and the 7-Day Travel Pass ($4.99, non-renewing). Video: {yt('0:53')}.</p></div></article>
        <article class="path"><img src="funnel/web_credits.jpg" alt="The 50 Credits Pack on the PoquitoTalk website at $3.74" loading="lazy" /><div><span class="who">Tourists &middot; on the web</span><h3>Credits, no subscription</h3><p>A one-time 50 Poquito Credits pack that never expires. With no store fee on the web, it's $3.74 as a launch price until October 15, against $4.99 in the app. Video: {yt('0:54')}.</p></div></article>
      </div>
    </section>

    <section>
      <div class="section-header">
        <span class="section-tag">The funnel</span>
        <h2 class="section-title">Three Quick Slides, Then Checkout</h2>
        <p class="section-desc">A RevenueCat Web Funnel with Stripe billing, live since September 28. Video: {yt('0:59')}.</p>
      </div>
      <div class="phones">
        <figure><img src="funnel/slide1.jpg" alt="Funnel slide: Speak Bocas Spanish" loading="lazy" /><figcaption><b>1. Speak Bocas Spanish</b>What PoquitoTalk does, with Poquito talking.</figcaption></figure>
        <figure><img src="funnel/slide2.jpg" alt="Funnel slide: Boats, water and repairs" loading="lazy" /><figcaption><b>2. Boats, water &amp; repairs</b>The ready-made phrases a visitor actually needs.</figcaption></figure>
        <figure><img src="funnel/checkout.jpg" alt="Stripe checkout with Google Pay for the 50 Poquito Credits Pack" loading="lazy" /><figcaption><b>3. Checkout</b>Stripe, with Google Pay: one tap on a phone.</figcaption></figure>
        <figure><img src="funnel/thank_you.jpg" alt="Thank-you page: your 50 credits are on their way" loading="lazy" /><figcaption><b>4. Thank you</b>Install the app, then tap "Open in PoquitoTalk": the credits arrive. Video: {yt('1:05')}.</figcaption></figure>
      </div>
    </section>

    <section>
      <div class="section-header">
        <span class="section-tag">Why it matters</span>
        <h2 class="section-title">Why the Funnel Matters</h2>
      </div>
      <div class="quote-card">A payment on its own isn't enough. If nothing links the web purchase to the app, the buyer pays and then has nothing to open. In a RevenueCat funnel the purchase becomes something the app can redeem, so a tourist who pays on the web lands in the app with their credits ready. That's why every web purchase goes through the funnel.</div>
    </section>

    <section>
      <div class="section-header">
        <span class="section-tag">Under the hood</span>
        <h2 class="section-title">How the Purchase Reaches the App</h2>
      </div>
      <div class="flow"><span>Funnel slides</span><i>&rarr;</i><span>Stripe checkout</span><i>&rarr;</i><span>RevenueCat records the purchase</span><i>&rarr;</i><span>Thank-you link</span><i>&rarr;</i><span>App redeems it</span><i>&rarr;</i><span>+50 credits</span></div>
      <ol class="steps" style="margin-top:18px">
        <li><strong>Web Purchase Redemption.</strong> The app handles the thank-you link with RevenueCat's <code>parseAsWebPurchaseRedemption</code> and <code>redeemWebPurchase</code>.</li>
        <li><strong>Credits added once.</strong> The app finds the credits purchase among the customer's one-time transactions by its Stripe product, and adds 50 credits once per transaction, so a link opened twice doesn't pay out twice.</li>
        <li><strong>Credits never unlock Pro.</strong> A guard checks that Pro comes only from a subscription or a pass, never from a credits purchase.</li>
        <li><strong>Fair use.</strong> A live 2-way voice session stays free until the first voice message is sent, so credits are only spent on real conversations.</li>
        <li><strong>Revenue meets growth.</strong> RevenueCat is connected to the Layers SDK, so revenue can be tied back to the posts that brought people in.</li>
      </ol>
      <p class="section-desc" style="margin-top:14px">Live in v1.5.10, approved on Google Play on September 29, with working in-app purchases and web redemption.</p>
    </section>

    <section>
      <div class="section-header">
        <span class="section-tag">Proof</span>
        <h2 class="section-title">It's Live, and It Works</h2>
      </div>
      <figure class="fig"><img src="funnel/revenuecat_dashboard.jpg" alt="RevenueCat dashboard: revenue, new and active customers, and a 50 Poquito Credits Pack transaction through Stripe for $3.74" loading="lazy" /><figcaption>RevenueCat dashboard: a 50 Poquito Credits Pack sold through Stripe, one-time, $3.74: a real purchase through the funnel, redeemed in the app. Video: {yt('0:54')} and {yt('1:08')}.</figcaption></figure>
      <figure class="fig" style="margin-top:18px"><img src="funnel/funnel_overview.jpg" alt="The PoquitoTalk Web Funnel in RevenueCat: live since September 28, Stripe Billing, with the paywall slides, Stripe checkout and the thank-you screen with the Open in PoquitoTalk button" loading="lazy" /><figcaption>The live funnel in RevenueCat: paywall slides, Stripe checkout and the thank-you screen with the "Open in PoquitoTalk" button, live since September 28 with Stripe Billing. (The checkout thumbnail shows RevenueCat's generic preview; the real checkout charges $3.74 once for the 50-credit pack.)</figcaption></figure>
      <figure class="fig" style="margin-top:18px"><img src="funnel/step_metrics.jpg" alt="RevenueCat funnel step-by-step metrics: paywall 10 views, 8 continued to checkout; checkout 9 views, 1 purchase; thank-you screen 1 view" loading="lazy" /><figcaption>The funnel's step-by-step metrics in RevenueCat: 10 paywall views, 8 continued to Stripe checkout (80%), and 1 purchase on September 29, redeemed in the app the same day. Small numbers in the low season, and they include our own test visits, but every step of the path works.</figcaption></figure>
      <figure class="fig" style="margin-top:18px"><img src="funnel/stripe_leaderboard.jpg" alt="Stripe Projects leaderboard for RevenueCat Shipaton 2026 with poquito-talk in third place" loading="lazy" /><figcaption>Built with Stripe Projects: poquito-talk is #3 on the Stripe Projects leaderboard for RevenueCat Shipaton 2026. Video: {yt('0:50')}.</figcaption></figure>
    </section>

    <section>
      <div class="section-header">
        <span class="section-tag">Next</span>
        <h2 class="section-title">What's Next</h2>
      </div>
      <ol class="steps">
        <li><strong>Bring the funnel to the high season.</strong> From December, put the funnel link where tourists already are: island tips videos and the online directory.</li>
        <li><strong>QR codes where tourists already are.</strong> Cards at hotel receptions and stickers on water taxis that open the funnel, each with its own campaign tag, so RevenueCat shows which hotel or boat brings buyers.</li>
        <li><strong>Measure every channel</strong> with Layers tracking links and funnel campaign tags, so we can see which one brings buyers.</li>
        <li><strong>iPhone next.</strong> The <a href="index.html#playstore">iPhone waitlist</a> is open; the funnel will serve both stores.</li>
      </ol>
    </section>

"""

PEACE = f"""
    <section class="hero-box">
      <div class="award-pill">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/></svg>
        RevenueCat Shipaton 2026 &bull; Peace Prize Entry
      </div>
      <h1 class="hero-title">Technology for Social Good, Built With the Island</h1>
      <p class="hero-subtitle">In Bocas del Toro, Panama, newcomers depend on local boat captains, tradespeople and clinics, and those locals depend on them for income. A language gap stands in between. PoquitoTalk closes it, and puts all the effort on the app user, not on the worker.</p>
      <div class="founder-meta">
        <span>Built by <strong>Dorien Van den Abbeele</strong>, 14 years in Bocas</span><span>&bull;</span>
        <a href="directory.html">The free directory</a><span>&bull;</span>
        <span>Bocas del Toro, Panama 🇵🇦</span>
      </div>
    </section>

    <div class="stats-ribbon">
      <div class="stat-card"><div class="stat-num">$0</div><div class="stat-label">Cost for workers</div></div>
      <div class="stat-card"><div class="stat-num">0</div><div class="stat-label">Apps they must install</div></div>
      <div class="stat-card"><div class="stat-num">76</div><div class="stat-label">Phrases that work offline</div></div>
      <div class="stat-card"><div class="stat-num">5 of 6</div><div class="stat-label">Captains replied</div></div>
      <div class="stat-card"><div class="stat-num">287</div><div class="stat-label">Directory listings</div></div>
    </div>

    <section>
      <div class="section-header">
        <span class="section-tag">In the demo</span>
        <h2 class="section-title">The Peace Prize Part, in 34 Seconds</h2>
        <p class="section-desc">From the community forum to the captain's WhatsApp.</p>
      </div>
      <div class="yt"><iframe src="https://www.youtube-nocookie.com/embed/{YT}?start=16&end=50&rel=0" title="PoquitoTalk demo: technology for social good" loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>
    </section>

    <section>
      <div class="section-header">
        <span class="section-tag">The community</span>
        <h2 class="section-title">The Problem We're Solving</h2>
        <p class="section-desc">Bocas del Toro is an island region on Panama's Caribbean coast. You get between the islands by boat, and daily life runs on WhatsApp voice notes. English-speaking expats, off-grid homeowners and tourists depend on local captains, tradespeople, clinics and small businesses.</p>
      </div>
      <div class="kv">
        <div><b>What goes wrong</b><p>Newcomers who can't speak Spanish send formal translated texts that go unanswered, hire middlemen, or give up, so the local worker loses the job. When the water pump, the boat engine or someone's health fails, that gap is also a safety problem.</p></div>
        <div><b>Who is left out</b><p>Many local providers have no website and no online presence. Expats ask the same questions in the forums every day ("Who's a good boat captain?", "Who can fix my pump?"), and the providers depend entirely on someone else recommending them.</p></div>
      </div>
    </section>

    <section>
      <div class="section-header">
        <span class="section-tag">Design for impact</span>
        <h2 class="section-title">All the Effort Stays With the App User</h2>
      </div>
      <div class="loop-grid">
        <article class="loop-card"><span class="num">1</span><h3>The worker needs nothing</h3><p>No app, no account, no payment. The captain gets a WhatsApp voice note, and can answer by voice from a link that opens in any phone browser. Video: {yt('0:43')}.</p></article>
        <article class="loop-card"><span class="num">2</span><h3>Island Spanish, politely</h3><p>Not textbook Spanish: "¡Buenas!" first, and the words people actually say here ("plomero", "dolor de barriga", "plata"). We re-recorded phrases whenever the app sounded wrong. Video: {yt('0:30')}.</p></article>
        <article class="loop-card"><span class="num">3</span><h3>Works without signal</h3><p>76 ready-made phrases for emergencies, boats, water and power are voiced and built into the app, so they play on a boat or in the jungle with no connection. Video: {yt('0:36')}.</p></article>
      </div>
      <div class="kv">
        <div><b>A free directory</b><p>287 listings so far: 77 boat captains and water taxis, hotels, restaurants, hardware stores, contractors, clinics and more. Listing is free, with no commission, and contact goes straight to the provider's WhatsApp. The <a href="directory.html">online directory</a> also makes them findable on Google.</p></div>
        <div><b>Replies in their own voice</b><p>When a female boat operator or clinic receptionist replies, you hear her in a female voice in English, not in the app user's voice (ships in v1.5.11).</p></div>
      </div>
    </section>

    <section>
      <div class="section-header">
        <span class="section-tag">Built with the island</span>
        <h2 class="section-title">We Asked Before We Built</h2>
        <p class="section-desc">Every screen below is a real post or chat. Names and numbers of other people are blurred.</p>
      </div>
      <div class="post-grid">
        <article class="post-card">
          <a href="bip/post_aug01_forum.jpg" target="_blank" rel="noopener"><img src="bip/post_aug01_forum.jpg" alt="Facebook post in the Bocas del Toro community forum asking what people struggle to say in Spanish" loading="lazy" /></a>
          <div class="post-body"><span class="evo-step">Aug 1 &middot; Bocas community forum &middot; video {yt('0:18')}</span><h3>"What's the hardest thing to explain in Spanish?"</h3><p>19 reactions, 7 comments. One answer: "Most of my calls are not repairs, but medical."</p><span class="post-change">Shipped: medical and pharmacy phrases</span></div>
        </article>
        <article class="post-card">
          <a href="bip/post_aug30_facebook.jpg" target="_blank" rel="noopener"><img src="bip/post_aug30_facebook.jpg" alt="Facebook post announcing PoquitoTalk to the Bocas community" loading="lazy" /></a>
          <div class="post-body"><span class="evo-step">Aug 30 &middot; Facebook</span><h3>Taking it back to the island</h3><p>Local posts about the app drew 11 to 20 reactions each, with comments like "Going to be amazing here and a huge help!"</p><span class="post-change">The community asked for it, and shaped it</span></div>
        </article>
        <article class="post-card">
          <a href="bip/directory_business_comment.jpg" target="_blank" rel="noopener"><img src="bip/directory_business_comment.jpg" alt="A local business commenting to join the directory" loading="lazy" style="height:auto;aspect-ratio:auto;object-fit:contain;background:#fff;padding:22px 12px" /></a>
          <div class="post-body"><span class="evo-step">From one of those posts</span><h3>A local business added itself</h3><p>A local provider saw a post and asked to join the free directory.</p><span class="post-change">Free listing, no commission</span></div>
        </article>
      </div>
    </section>

    <section>
      <div class="section-header">
        <span class="section-tag">Into the directory</span>
        <h2 class="section-title">Two Easy Ways In, and a Third in Person</h2>
        <p class="section-desc">Video: {yt('0:24')}.</p>
      </div>
      <video class="vid" src="bip/portals_stack.mp4" poster="bip/portals_stack_poster.jpg" controls muted playsinline loop preload="metadata" aria-label="The five free sign-up portals: restaurants, boat captains, lodging, tours and trades"></video>
      <div class="loop-grid" style="margin-top:18px">
        <article class="loop-card"><span class="num">1</span><h3>A free sign-up portal</h3><p>Five portals, for <a href="captains.html">boat captains</a>, <a href="restaurants.html">restaurants</a>, <a href="hotels.html">lodging</a>, <a href="activities.html">tours</a> and <a href="contractors.html">trades</a>. A few minutes, no fees, no commission.</p></article>
        <article class="loop-card"><span class="num">2</span><h3>A WhatsApp message</h3><p>One step less: no form, they just reply, often by voice note. We messaged six of the islands' Hope Spot certified boat captains this way, and five replied with their dock, routes, prices and rain policy.</p></article>
        <article class="loop-card"><span class="num">3</span><h3>In person</h3><p>For people who can't sign up online, I go and talk to them myself: a short interview, a photo of their storefront, and their business card if they have one.</p></article>
      </div>
      <figure class="fig" style="margin-top:18px"><img src="bip/captains_whatsapp.jpg" alt="WhatsApp conversations with local boat captains, names blurred" loading="lazy" /><figcaption>Real replies from boat captains on WhatsApp, several by voice note.</figcaption></figure>
    </section>

    <section>
      <div class="section-header">
        <span class="section-tag">Next</span>
        <h2 class="section-title">What's Next, After Shipaton</h2>
      </div>
      <ol class="steps">
        <li><strong>Reach the 60+ remaining Hope Spot certified boat captains,</strong> with detailed profiles: routes, islands, and tours such as bioluminescence trips.</li>
        <li><strong>The region's first searchable captain directory:</strong> visitors see which captain goes where, and captains get more bookings, which is good for local tourism.</li>
        <li><strong>Go into town</strong> and add the providers who aren't online, one conversation at a time.</li>
      </ol>
    </section>

"""

build(
    "funnel.html",
    "From the Web to the App • PoquitoTalk Funnel Vision",
    "How PoquitoTalk sells credits on the web through a RevenueCat funnel with Stripe, and how those purchases land in the Android app.",
    "https://poquitotalk.hero-apps.com/funnel/revenuecat_dashboard.jpg",
    FUNNEL,
    {
        "Funnel in 21": "Twenty-one seconds. Shorter than my morning coffee.",
        "Two Paths": "Residents subscribe, tourists buy credits. Everyone talks.",
        "Three Quick": "Three slides, one tap. Even I could do it, and I have wings.",
        "Why the Funnel": "Paying is easy. Getting it into the app is the trick.",
        "Reaches the App": "Credits once, never twice. I checked the receipts.",
        "Live, and It": "A real purchase, all the way into the app.",
        "What's Next": "iPhone people, I see you. Join the waitlist!",
    },
)
build(
    "peace.html",
    "Technology for Social Good • PoquitoTalk Peace Prize",
    "How PoquitoTalk helps expats and local workers in Bocas del Toro, Panama understand each other, built with the island community.",
    "https://poquitotalk.hero-apps.com/bip/captains_whatsapp.jpg",
    PEACE,
    {
        "Peace Prize Part": "This is why I always say ¡Buenas! first.",
        "Problem We": "Left on read is no way to get your pump fixed.",
        "All the Effort": "The captain installs nothing. That was the whole point.",
        "Asked Before": "The island told us what to build. We listened.",
        "Two Easy Ways": "Five out of six captains replied. Not bad for a parrot.",
        "After Shipaton": "Sixty more captains. Time to get on a boat.",
    },
)
