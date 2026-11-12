"""Build Dimitrios Fragkoulis CV as .docx (A4, ATS-friendly, editable).
usage: python build_cv_docx.py <photo.jpg> <out.docx>
"""
import sys
from docx import Document
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_TAB_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor

PHOTO, OUT = sys.argv[1], sys.argv[2]
ACCENT = RGBColor(0x1C, 0x35, 0x5E)
MUTED = RGBColor(0x55, 0x58, 0x6A)
FONT = "Arial"

doc = Document()
sec = doc.sections[0]
sec.page_width, sec.page_height = Cm(21), Cm(29.7)
sec.left_margin = sec.right_margin = Cm(1.7)
sec.top_margin = sec.bottom_margin = Cm(1.5)
CONTENT_W = sec.page_width - sec.left_margin - sec.right_margin

normal = doc.styles["Normal"]
normal.font.name = FONT
normal.element.rPr.rFonts.set(qn("w:eastAsia"), FONT)
normal.font.size = Pt(9.5)
normal.paragraph_format.space_after = Pt(0)
normal.paragraph_format.line_spacing = 1.1

lb = doc.styles["List Bullet"]
lb.font.name = FONT
lb.font.size = Pt(9.5)
lb.paragraph_format.space_after = Pt(1.5)
lb.paragraph_format.left_indent = Cm(0.55)
lb.paragraph_format.first_line_indent = Cm(-0.4)

h1 = doc.styles["Heading 1"]
h1.font.name = FONT
rf = h1.element.rPr.rFonts
for a in ("w:asciiTheme", "w:hAnsiTheme", "w:eastAsiaTheme", "w:cstheme"):
    rf.attrib.pop(qn(a), None)
for a in ("w:ascii", "w:hAnsi", "w:eastAsia", "w:cs"):
    rf.set(qn(a), FONT)
h1.font.size = Pt(10.5)
h1.font.bold = True
h1.font.color.rgb = ACCENT
h1.font.all_caps = True
h1.paragraph_format.space_before = Pt(11)
h1.paragraph_format.space_after = Pt(5)
h1.paragraph_format.keep_with_next = True
# bottom border on section headings
pPr = h1.element.get_or_add_pPr()
bdr = OxmlElement("w:pBdr")
bottom = OxmlElement("w:bottom")
for k, v in {"w:val": "single", "w:sz": "6", "w:space": "2", "w:color": "D9D6E5"}.items():
    bottom.set(qn(k), v)
bdr.append(bottom)
pPr.append(bdr)

doc.core_properties.title = "Dimitrios Fragkoulis — CV"
doc.core_properties.author = "Dimitrios Fragkoulis"


def run(p, text, bold=False, color=None, size=None, italic=False):
    r = p.add_run(text)
    r.bold, r.italic = bold, italic
    if color is not None:
        r.font.color.rgb = color
    if size:
        r.font.size = Pt(size)
    return r


def no_borders(table):
    tblPr = table._tbl.tblPr
    borders = OxmlElement("w:tblBorders")
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        el = OxmlElement(f"w:{edge}")
        el.set(qn("w:val"), "nil")
        borders.append(el)
    tblPr.append(borders)


# ---------- header: photo + name ----------
t = doc.add_table(rows=1, cols=2)
t.alignment = WD_TABLE_ALIGNMENT.LEFT
t.autofit = False
no_borders(t)
w_photo = Cm(2.4)
t.columns[0].width = w_photo
t.columns[1].width = CONTENT_W - w_photo
c0, c1 = t.rows[0].cells
c0.width, c1.width = w_photo, CONTENT_W - w_photo
c0.paragraphs[0].add_run().add_picture(PHOTO, width=Cm(2.1))
p = c1.paragraphs[0]
run(p, "Dimitrios Fragkoulis", bold=True, size=22)
p = c1.add_paragraph()
run(p, "Engineering Team Lead · Frontend", bold=True, color=ACCENT, size=12)
p = c1.add_paragraph()
p.paragraph_format.space_before = Pt(3)
run(p, "Stockholm, Sweden  ·  fragkoulis.dev@gmail.com  ·  linkedin.com/in/dimitrios-fragkoulis-1a848314b  ·  fragkoulis.is-a.dev",
    color=MUTED, size=9)


def heading(text):
    doc.add_paragraph(text, style="Heading 1")


def bullet(text, bold_prefix=None):
    p = doc.add_paragraph(style="List Bullet")
    if bold_prefix:
        run(p, bold_prefix, bold=True)
    run(p, text)
    return p


def job(title, company, dates, place, bullets, stack=None):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.keep_with_next = True
    p.paragraph_format.tab_stops.add_tab_stop(CONTENT_W, WD_TAB_ALIGNMENT.RIGHT)
    run(p, title, bold=True, size=11)
    run(p, "  ·  ", color=MUTED)
    run(p, company, bold=True, color=ACCENT, size=11)
    run(p, "\t" + dates, color=MUTED, size=9.5)
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.keep_with_next = bool(bullets)
    run(p, place, color=MUTED, size=9.5)
    for b in bullets:
        bullet(b)
    if stack:
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(1)
        run(p, "Stack: ", bold=True, size=9.5)
        run(p, stack, color=MUTED, size=9.5)


# ---------- content ----------
heading("Profile")
doc.add_paragraph(
    "Engineering Team Lead with 9+ years in the tech industry, moving from full-stack development to leading a "
    "distributed frontend team. I apply a servant leadership mindset together with Agile and Lean practices to grow "
    "high-performing, self-governing teams, while staying hands-on in frontend architecture, code quality and delivery. "
    "I believe in transparency, feedback, coaching and mentoring — and in letting people step up and grow."
)

heading("Key achievements")
bullet(" brands migrated to the Fabric platform", "30+")
bullet(" new micro-frontend components built with StencilJS", "25+")
bullet(" engineers led in a distributed team across time zones", "8")
bullet(" brands on one shared Angular frontend platform (Betsson, Betsafe, NordicBet, Mobilbahis, Bets10)", "5")

heading("Experience")
job("Engineering FE Team Lead", "Betsson Group", "Aug 2022 – Present", "Sweden · Distributed team", [
    "Lead a distributed team of 8 frontend developers, fostering a high-performing remote environment.",
    "Migrated 30+ brands to the Fabric platform.",
    "Spearheaded a micro-frontend architecture with StencilJS, delivering 25+ new micro-frontend components and improving maintainability.",
    "Oversee frontend solutions in Angular, TypeScript and JavaScript, reducing bug reports.",
    "Established and track team OKRs, achieving a high percentage of objectives.",
    "Own technical interviews, onboarding and training of remote engineers.",
    "Run regular 1:1s and contribute to performance reviews, supporting professional growth.",
    "Champion code quality through code reviews, testing and CI/CD, decreasing technical debt.",
    "Partner with POs/PMs across time zones for smoother sprints; research and introduce new technologies.",
])
job("Team Lead", "Daniel Wellington", "Feb 2022 – Aug 2022", "Stockholm, Sweden", [
    "Supported, mentored and coached teams and scrum masters to become high-performing.",
    "Facilitated activities to improve ways of working; secured long-term quality and delivery.",
    "Held regular 1:1s with direct reports and helped build trust inside teams.",
    "Enabled knowledge sharing across teams and locations; provided technical feedback to the business.",
])
job("Full-stack Developer", "Daniel Wellington", "Sep 2021 – Aug 2022", "Stockholm, Sweden", [
    "Designed, developed and maintained the Daniel Wellington e-commerce platform with React and Angular.",
    "Built event-driven, serverless services on AWS with CI/CD via AWS CodePipeline.",
    "Developed infrastructure as code with CloudFormation and the Serverless Framework; built a control dashboard with React and AWS Amplify.",
])
job("Frontend Developer", "Betsson Group", "Sep 2017 – Sep 2021", "Stockholm, Sweden", [
    "Built the frontend platform powering Betsson, Betsafe, NordicBet, Mobilbahis and Bets10.",
    "Developed an adaptive architecture: mobile and desktop Angular apps with shared libraries, served by Node and .NET MVC backends.",
    "Developed back-end services in C#, ASP.NET / .NET Core and Web API, tested with xUnit and xBehave.",
    "Ensured web standards, SEO, usability and browser compatibility; rotated as Scrum Master.",
], stack="Angular, TypeScript, SCSS, Jasmine, Node, .NET, TeamCity, Octopus Deploy, Git, Splunk, Sentry, JIRA")
job("Computer Center Staff", "Hellenic Navy", "Oct 2012 – Sep 2013", "Greece", [])

heading("Skills")
for label, items in [
    ("Leadership", "People management, building leadership teams, servant leadership, coaching & mentoring, Agile / Scrum, Lean, OKRs, technical hiring, remote teams"),
    ("Frontend", "Angular, TypeScript, JavaScript, React, StencilJS, micro-frontends, HTML5, SCSS, accessibility, SEO"),
    ("Backend & Cloud", "Node.js, C# / .NET Core, ASP.NET MVC, Web API / REST, AWS, Serverless, CloudFormation, AWS Amplify"),
    ("Quality & Delivery", "Jasmine, Karma, Protractor, xUnit, CI/CD, TeamCity, Octopus Deploy, Sentry, Splunk, Git"),
]:
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(2.5)
    run(p, label + ": ", bold=True)
    run(p, items)

heading("Education")
p = doc.add_paragraph()
run(p, "BSc in Computer & Informatics Engineering", bold=True)
p = doc.add_paragraph()
run(p, "Department of Computer & Informatics Engineering · Computer Software Engineering · 2011 – 2017", color=MUTED, size=9.5)

heading("Certification")
p = doc.add_paragraph()
run(p, "Team Captain Program Certificate", bold=True)
p = doc.add_paragraph()
run(p, "Leadership development program", color=MUTED, size=9.5)

heading("Languages")
p = doc.add_paragraph()
for i, (lang, level) in enumerate([("Greek", "Native"), ("English", "Fluent"), ("Swedish", "Basic")]):
    if i:
        run(p, "   ·   ", color=MUTED)
    run(p, lang, bold=True)
    run(p, " — " + level)

doc.save(OUT)
print("saved", OUT)
