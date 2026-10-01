"""Render LAYERS_GROWTH_LOOP_AWARD_SUBMISSION.md into web-funnel/growth-loop.html.

The write-up sits between the WRITEUP:START and WRITEUP:END markers, so re-run
this after editing the Markdown and redeploy growth-loop.html.
"""
import re
from pathlib import Path

import markdown

ROOT = Path(__file__).resolve().parent.parent
MD = ROOT / "LAYERS_GROWTH_LOOP_AWARD_SUBMISSION.md"
PAGE = ROOT / "web-funnel" / "growth-loop.html"
START, END = "<!-- WRITEUP:START -->", "<!-- WRITEUP:END -->"

PARTS = [
    ("audience", "Audience and growth hypothesis"),
    ("loop", "The loop"),
    ("sdk", "SDK installation and observability"),
    ("learning", "Learning and iteration"),
]

text = MD.read_text()
# Drop the title and the link back to this page; the page has its own hero.
text = re.sub(r"^# .*\n", "", text, count=1)
text = re.sub(r"^Full page with screenshots:.*\n", "", text, flags=re.M)
text = re.sub(r"^---\s*$", "", text, flags=re.M)
# Local file links mean nothing on the web; point them at the repo.
text = re.sub(
    r"\[([^\]]+)\]\(file://[^)]*/(src/[^)]+)\)",
    r"[\1](https://github.com/tanDivina/PoquitoTalk/blob/main/\2)",
    text,
)
# Python-Markdown nests lists at 4 spaces; the write-up uses 2.
text = re.sub(r"^((?:  )+)(?=[*\-]|\d+\.)", lambda m: "    " * (len(m.group(1)) // 2), text, flags=re.M)

# A list needs a blank line before it, or it runs into the paragraph above.
lines = text.split("\n")
out = []
for line in lines:
    is_item = re.match(r"^\s*(?:[*\-]|\d+\.)\s", line)
    prev = out[-1] if out else ""
    if is_item and prev.strip() and not re.match(r"^\s*(?:[*\-]|\d+\.)\s", prev) and not prev.startswith(" "):
        out.append("")
    out.append(line)
text = "\n".join(out)

html = markdown.markdown(text, extensions=["sane_lists"])
for anchor, title in PARTS:
    html = html.replace(f"<h3>{title}</h3>", f'<h3 id="{anchor}">{title}</h3>', 1)

toc = "".join(f'<a href="#{a}">{i}. {t}</a>' for i, (a, t) in enumerate(PARTS, 1))
section = f"""{START}
    <section id="writeup">
      <div class="section-header">
        <span class="section-tag">Submission write-up</span>
        <h2 class="section-title">The Write-up, in Full</h2>
        <p class="section-desc">Our Growth Loop Award entry, in the four parts Layers asked for. The sections further down show the screenshots behind each claim.</p>
      </div>
      <nav class="wu-toc" aria-label="Write-up parts">{toc}</nav>
      <article class="wu">
{html}
      </article>
    </section>
    {END}"""

page = PAGE.read_text()
if START in page:
    page = re.sub(re.escape(START) + r".*?" + re.escape(END), lambda _: section, page, flags=re.S)
else:
    anchor = "    <section>\n      <div class=\"section-header\">\n        <span class=\"section-tag\">Audience</span>"
    assert anchor in page, "insert point not found"
    page = page.replace(anchor, section + "\n\n" + anchor, 1)
PAGE.write_text(page)
print("write-up rendered:", len(html), "chars")
