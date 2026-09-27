# Caught in a Storm with Starlink, Slicing Facebook's Comment Trap, and Shipping v1.5.5 to Google Play

By Dorien Van den Abbeele ([@DorienVibecodes](https://x.com/DorienVibecodes))  
*Double Ship Log: September 25 & September 26, 2026*

---

## Why This Is a Double Issue: The Starlink Storm Detour

On Friday, our Starlink kit finally arrived via DHL on Isla Colón. We picked up the box, loaded it onto the boat, and headed out across the water to take it to our home in Dolphin Bay. 

Halfway across, a tropical storm hit. Rain came down in sheets, visibility dropped to near zero, and we completely lost our bearings on the water. We kept motoring through the downpour, only to realize we had driven in one giant circle: after fighting the chop and blinding rain, we ended up right back where we started on Isla Colón, soaked and boat docked back in town.

By the time the weather cleared and we sorted everything out, writing Friday's log was out of the question. 

Tonight's dispatch covers the work shipped across both Friday, September 25th and Saturday, September 26th.

---

## Part 1: Friday, September 25, 2026

### The Facebook Comment Link Trap
On Friday morning, before the boat trip, I replied to a post in a Bocas community group from someone looking for a reliable electrician and boat captain. I shared the link to our directory: `https://poquitotalk.hero-apps.com/contractors.html`.

Comment recommendations in community groups are high-intent traffic. But the preview Facebook generated inside the comment bubble looked terrible.

Facebook displayed a dark, square thumbnail with text chopped in half: "...alk", "...hatsApp Voice Notes", and "...day Panamá". The phone mockup was sliced right down the middle. Instead of looking like a verified local directory, the preview looked like a broken spam link.

### Timeline Feeds vs. Comment Bubbles
Most developers design Open Graph images for the standard specification: `og:image` at 1200 x 630 px (1.91:1 ratio). That works on timeline posts, where Facebook displays the full wide banner across the feed.

In comment replies, Messenger chats, and mobile snippets, Facebook does not show a wide banner. It crops the image into a 1:1 square (630 x 630 px) anchored to the horizontal center.

When Facebook crops a 1200 px image into a 630 px square, it only shows the region from X = 285 px to X = 915 px. The outer 285 pixels on both the left and right sides are erased. 

Our old card had text starting at X = 60 px on the left and a phone mockup sitting at X = 830 px on the right. The square crop cut through both.

### The Dual-Crop Safe Zone
We rebuilt the card generator using Playwright, clean vector SVGs, and Google Fonts (`Lexend` and `Plus Jakarta Sans`):

1. **Local Background**: We replaced the dark background with an aerial shot of Cayos Zapatillas, showing the sand beach and coral reef with a warm vignette (`#FAF8F5`).
2. **Center Safe Zone (X = 287 px to 913 px)**: We placed a floating white card containing all critical brand assets inside the 626 px center window: the Bocas badge, verified category counts, the Poquito mascot with a "0% Fees" speech bubble, and the full iPhone directory screen. This entire block remains visible inside comment thumbnails.
3. **Outer Wings (0 to 285 px and 915 to 1200 px)**: On desktop timeline feeds, Twitter cards, and WhatsApp shares, the wings expand to reveal the beach and extra trust badges (100% Offline Ready, Voice Notes, Community Vouched).

### Cache Busting and the `fb:app_id` Warning
Social media platforms cache Open Graph images on their CDNs for up to a week. If you simply replace `og_image.png`, existing shared links will keep serving the cached image.

We added a version parameter (`?v=3.0.0`) to all `og:image` tags across our 14 funnel pages and deployed the changes to our LiteSpeed server via `rsync`.

When checking the live URL in the Facebook Sharing Debugger, the tool showed a warning: "The following required properties are missing: fb:app_id".

The `fb:app_id` tag is an optional identifier used only if you register an app in the Facebook Developer Console to track domain analytics. It does not affect link preview rendering. Facebook reads `og:title`, `og:description`, and `og:image` without it.

---

## Part 2: Saturday, September 26, 2026

### PoquitoTalk v1.5.5 Live on Google Play Production
With Starlink set up and running today, we cleared our local build pipeline. 

Earlier in the week, Gradle builds over our cellular hotspot had timed out downloading `kotlin-compiler-embeddable-2.1.20.jar` from Maven Central. Today, the connection held cleanly. We compiled all 451 Gradle tasks in 11 minutes, signed the Android App Bundle (`poquitotalk-v1.5.5-release-v4.aab`, 64.46 MB), and pushed it directly to the Google Play Store production track at 100% rollout.

Version 1.5.5 includes three core UX fixes based on real-world island testing:
* **The Post-WhatsApp Return Modal**: When a user sends a Spanish voice note to a contractor via WhatsApp, returning to PoquitoTalk now triggers a guidance modal explaining how to share the contractor's incoming audio reply back to PoquitoTalk for instant English decoding.
* **High-Priority Return Banner**: A heads-up Android notification banner drops down over WhatsApp after 12 seconds, letting users return to their translation thread in one tap.
* **Thread Audio Playback**: Incoming Spanish voice notes decoded into English text now include a "Listen English" button, using the correct contractor voice profile.

### Replacing Cloud Quota Bottlenecks with Claude Pro
While building our 15-second submission video for the RevenueCat Shipathon, we ran into cloud infrastructure roadblocks. 

We initially ran Claude Code through Google Cloud Vertex AI to drive Opus. Vertex threw an immediate `429 RESOURCE_EXHAUSTED` error because enterprise quota for Opus was set to zero. An automated quota increase request was rejected by Google within minutes without human review.

Instead of fighting quota walls or paying metered per-token API charges, I upgraded to Claude Pro. We decoupled Claude Code from Vertex, switched to native Anthropic authentication, and put Claude Code (Opus) to work in the terminal alongside Antigravity.

Opus generated our 15-second video hook script (`scripts/build_submission_hook_15s.py`). Antigravity handled file tracking, ElevenLabs audio permission diagnostics, and Playwright UI captures. During the build, Opus caught that our background music bed had old English narration mixed into it, stripped the voiceover, and built an automated Whisper check to prevent voice bleed.

### Fixing the Friday Rollover Trap on Velocity Radar
On our builder leaderboard, Friday marked the end of Week 5 and the start of Week 6 across 1,388 creators. 

When the live site rolled over, Week 5 still displayed the Week 4 winner, and tab clicks flashed empty skeletons. The reason: last Friday I had fixed the rollover using a one-time migration script. The script updated the database numbers, but did not teach the automated cron how to handle future rollovers. Furthermore, the frontend had hardcoded checks for Weeks 1 through 3, while Weeks 4 and 5 had to wait for API responses over the network.

Today we replaced all hardcoded week logic with universal clock math from inception:

$$\text{Current Week} = \left\lfloor \frac{\text{Current Time} - \text{Inception Time}}{\text{7 Days}} \right\rfloor + 1$$

Both the browser and the backend scanner now compute the active week synchronously at millisecond zero, eliminating UI flashes. We also added supervisory logic to our 24/7 background scanner on GitHub Actions: if the primary cron ever misses a rollover cutoff, the scanner detects it and seals the archive automatically.

---

## Takeaways for Builders

1. **Your link preview is your homepage**: Most customers find local services in community comments and direct messages, not top-level posts. If your card gets cropped into broken text, you lose credibility before the click.
2. **If you fix a bug with a manual script, you haven't fixed it**: Never close a recurring issue until the automated routine itself handles the edge case.
3. **Flat subscriptions beat metered cloud friction for creative sprints**: When orchestrating multi-agent video and code builds, unpredictable API quotas slow you down. Direct access with Claude Pro and Antigravity kept the entire release pipeline moving.

---

## Status Check Tonight

* **Starlink**: Successfully brought home to Dolphin Bay, mounted, and powering our build pipeline.
* **PoquitoTalk**: Version 1.5.5 live in production on Google Play; social preview cards crop-proof on all platforms.
* **Velocity Radar**: Week 6 live, tab navigation running with zero flicker, and autonomous rollovers locked in.
