const search = document.querySelector("#search");
const results = document.querySelector("#results");
const modules = [...document.querySelectorAll(".module")];

function normalize(text) {
  return text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();
}

search.disabled = false;
search.addEventListener("input", () => {
  const terms = normalize(search.value).split(/\s+/).filter(Boolean);
  let visible = 0;
  for (const item of modules) {
    const content = normalize(item.textContent);
    item.hidden = !terms.every(term => content.includes(term));
    if (!item.hidden) visible += 1;
  }
  results.textContent = visible === 1 ? "1 módulo" : visible === 0 ? "Sin resultados" : `${visible} módulos`;
});
