from html import escape
from pathlib import Path
import json
import re
from urllib.parse import quote
import markdown

ROOT = Path(__file__).resolve().parent.parent
HUB = ROOT / "10-espacio-local"
MASTER = ROOT / "07-documento-maestro"
CENTRAL = ROOT / "00-fuentes-drive" / "central"

GUIDES = {
    "01-descubrimiento/02-estructura-de-modulos.md": "Catálogo de módulos",
    "04-diseno/DESIGN.md": "Sistema de diseño",
    "05-plan/02-preparacion-para-construir.md": "Guía para construir",
    "10-espacio-local/VPS.md": "Conexión a la VPS",
}

def link(path, text, css="", anchor=""):
    if path in GUIDES:
        path = str(Path(path).with_suffix(".html")).replace("\\", "/")
    target = quote("../" + path, safe="/")
    return f'<a class="{css}" href="{target}{anchor}">{escape(text)}</a>'

for relative, title in GUIDES.items():
    document = ROOT / relative
    body = markdown.markdown(document.read_text(encoding="utf-8-sig"), extensions=["tables", "fenced_code"])
    for known in GUIDES:
        original = Path(known).name
        body = body.replace(f'{original}"', f'{Path(known).with_suffix(".html").name}"')
    page = f"""<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{escape(title)} · Quisqueya Home</title>
<link rel="stylesheet" href="../04-diseno/tokens-referencia.css">
<link rel="stylesheet" href="../10-espacio-local/espacio.css"></head>
<body><main class="wrap reading"><p><a href="../10-espacio-local/index.html">Volver al espacio de trabajo</a></p>
{body}
<p><a href="{quote(document.name)}">Abrir Markdown original</a></p></main></body></html>"""
    document.with_suffix(".html").write_text(page, encoding="utf-8")

master = (MASTER / "CRM-QH-DOCUMENTO-FINAL-2026-11-06.md").read_text(encoding="utf-8-sig")
catalog = (ROOT / "01-descubrimiento/02-estructura-de-modulos.md").read_text(encoding="utf-8-sig")
summaries = dict(re.findall(r"^\| \[([A-Z]+)\]\([^)]*\) \| [^|]+ \| [^|]+ \| ([^|\n]+) \|", master, re.M))
modules = re.findall(r"^\| \d+ \| ([^|]+) \| ([A-Z]+) \|", catalog, re.M)
if len(modules) != 22 or len({code for _, code in modules}) != 22 or set(summaries) != {code for _, code in modules}:
    raise ValueError("El catálogo y el documento maestro no coinciden")
rows = []
for name, code in modules:
    detail = link("07-documento-maestro/CRM-QH-DOCUMENTO-FINAL-2026-11-06.html", "Análisis " + code, anchor="#anexo-" + code.lower())
    rows.append(f'<li class="module"><h3>{escape(name)}</h3><p>{escape(summaries[code].strip())}</p>{detail}</li>')

with (CENTRAL / "inventario.json").open(encoding="utf-8-sig") as fh:
    source_files = json.load(fh)["files"]
groups = {}
for item in sorted(source_files, key=lambda f: (f["folder"], f["title"], f["mode"])):
    groups.setdefault(item["folder"], []).append(f'<li>{link(item["path"], Path(item["path"]).name)}</li>')
sources = "\n".join(f'<details><summary>{escape(folder)}</summary><ul>{"".join(links)}</ul></details>' for folder, links in groups.items())

screens = [
    ("dashboard_administrador", "Inicio de administración"),
    ("bandeja_de_leads", "Bandeja de Leads"),
    ("pipeline_de_ventas", "Pipeline de Negocios"),
    ("propiedades_internas_crm", "Inventario de Propiedades"),
    ("agenda_y_citas_crm", "Agenda y citas"),
    ("panel_broker_m_vil_mis_leads", "Leads del broker en móvil"),
]
figures = []
for filename, caption in screens:
    src = f"../04-diseno/referencias-crm-anterior/{filename}.png"
    figures.append(f'<figure><a href="{src}"><img src="{src}" loading="lazy" alt="{escape(caption)}"></a><figcaption>{escape(caption)}</figcaption></figure>')

html = """<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Espacio de trabajo · CRM Quisqueya Home</title>
<link rel="stylesheet" href="../04-diseno/tokens-referencia.css">
<link rel="stylesheet" href="espacio.css">
<script src="espacio.js" defer></script>
</head>
<body>
<a class="skip" href="#contenido">Ir al contenido</a>
<header>
<div class="wrap masthead"><div><p class="brand">Quisqueya Home</p><p class="edition">CRM · Espacio de trabajo local</p></div>
<nav aria-label="Secciones"><a href="#modulos">Módulos</a><a href="#diseno">Diseño</a><a href="#vps">VPS</a><a href="#fuentes">Fuentes</a></nav></div>
</header>
<main id="contenido" class="wrap">
<section class="intro" aria-labelledby="titulo"><div><h1 id="titulo">Preparación del CRM</h1>
<p>Catálogo vigente, arquitectura, capa visual y acceso al CRM de desarrollo en la VPS.</p>
<div class="actions">BUILD_GUIDE TECH_MAP</div></div>
<div class="aside"><h2>Primer recorrido propuesto</h2><p>Consulta del portal → Lead → responsable → seguimiento → visita.</p>MASTER_LINK</div></section>
<section id="modulos"><div class="section-title"><div><h2>Los 22 módulos</h2><p>Orden de la carpeta Central de Drive. Cada ficha enlaza con el análisis anterior.</p></div>CATALOG_LINK</div>
<label for="search">Buscar por módulo, código o función</label>
<input id="search" type="search" placeholder="Ej. Leads, INV, publicación" autocomplete="off" disabled>
<p id="results" aria-live="polite">22 módulos</p>
<ul class="modules">MODULES</ul>
<div class="aside"><h3>Fichas transversales y vistas vinculadas</h3><p>Avances de obra se vincula a Propiedades. Plataforma aporta el shell y la navegación. Luna UI reúne los componentes y la accesibilidad.</p></div></section>
<section id="diseno"><div class="section-title"><div><h2>Diseño y referencias</h2><p>Private Desk como referencia visual, con especificaciones de componentes y estados.</p></div>DESIGN_LINK</div>
<div class="swatches" aria-label="Muestra de colores de referencia">
<span><i style="background:var(--navy)"></i>Marino</span><span><i style="background:var(--gold)"></i>Oro</span><span><i style="background:var(--canvas)"></i>Lienzo</span><span><i style="background:var(--surface)"></i>Superficie</span></div>
<details><summary>Ver seis capturas históricas del prototipo</summary><div class="figures">FIGURES</div></details></section>
<section id="vps"><h2>VPS de Quisqueya</h2><p>Desde la carpeta raíz del proyecto, ejecuta este comando en PowerShell y mantén la terminal abierta.</p>
<pre><code>.&#92;10-espacio-local&#92;conectar-vps.ps1 -Accion Tunel</code></pre>
<div class="actions"><a class="button primary" href="http://127.0.0.1:13201/">Abrir CRM de desarrollo</a><a class="button" href="VPS.html">Conexión y staging</a></div></section>
<section id="fuentes"><div class="section-title"><div><h2>Fuentes locales</h2><p>Copia de Drive Central. Las exportaciones de Google Docs están en DOCX y TXT.</p></div>INVENTORY_LINK</div>
<div class="actions">ANALYSIS_LINK COMM_LINK</div><div class="source-list">SOURCES</div></section>
</main>
<footer class="wrap">Quisqueya Home · Documentación para construir el CRM</footer>
</body></html>"""

replacements = {
    "BUILD_GUIDE": link("05-plan/02-preparacion-para-construir.md", "Guía para construir", "button primary"),
    "TECH_MAP": link("08-diagramas-interactivos/index.html", "Mapa de arquitectura", "button"),
    "MASTER_LINK": link("07-documento-maestro/CRM-QH-DOCUMENTO-FINAL-2026-11-06.html", "Consultar documento maestro"),
    "CATALOG_LINK": link("01-descubrimiento/02-estructura-de-modulos.md", "Catálogo de referencia", "button"),
    "DESIGN_LINK": link("04-diseno/DESIGN.md", "Guía de diseño", "button"),
    "INVENTORY_LINK": link("00-fuentes-drive/central/inventario.json", "Inventario y hashes", "button"),
    "ANALYSIS_LINK": link("06-analisis-documental/README.md", "Análisis de las fuentes anteriores", "button"),
    "COMM_LINK": link("07-documento-maestro/comunicaciones.csv", "Matriz de comunicaciones", "button"),
    "MODULES": "\n".join(rows),
    "FIGURES": "\n".join(figures),
    "SOURCES": sources,
}
for token, content in replacements.items():
    html = html.replace(token, content)
(HUB / "index.html").write_text(html, encoding="utf-8")
