/**
 * Recorrido con clics de los módulos del corte N2 (Comisiones, Brokers, Reservas y el precio real de Propiedades).
 * Escribe en la base local de desarrollo: úsalo solo contra `viltrum_crm_dev`, nunca contra staging ni producción.
 * Uso: NODE_PATH=$(npm root -g) node scripts/e2e/modulos-n2.cjs
 */
const { chromium } = require("playwright");

const BASE = process.env.CRM_BASE ?? "http://localhost:9401";
const PROYECTO = Number(process.env.CRM_PROYECTO_PRUEBA ?? 25);
const NEGOCIO_BROKER = Number(process.env.CRM_NEGOCIO_PRUEBA ?? 3);
const NEGOCIO_AJENO = Number(process.env.CRM_NEGOCIO_AJENO ?? 1);

const NOMBRE_ROL = { admin: "Admin de Prueba", manager: "Gerente de Prueba", broker: "Broker Prueba 1" };

/** Cambia de rol sin peticiones en vuelo (un refresco pendiente podría devolver la sesión anterior) y comprueba quién quedó. */
async function entrar(contexto, rol, pagina) {
  if (pagina) await pagina.goto("about:blank");
  await contexto.clearCookies();
  const r = await contexto.request.post(`${BASE}/api/auth/demo`, { data: { role: rol }, headers: { origin: BASE } });
  if (!r.ok()) throw new Error(`No se pudo entrar como ${rol}: ${r.status()}`);
  if (pagina) {
    await pagina.goto(`${BASE}/inicio`, { waitUntil: "networkidle" });
    const texto = await pagina.locator("body").innerText();
    if (!texto.includes(NOMBRE_ROL[rol])) throw new Error(`Tras entrar como ${rol} la sesión no muestra «${NOMBRE_ROL[rol]}»`);
  }
}

async function sinError(pagina, paso) {
  const alerta = pagina.locator('main [role="alert"]');
  if (await alerta.count()) throw new Error(`${paso}: ${(await alerta.first().textContent())?.trim()}`);
}

(async () => {
  const navegador = await chromium.launch();
  const contexto = await navegador.newContext({ viewport: { width: 1280, height: 900 } });
  const pagina = await contexto.newPage();
  const pasos = [];
  const paso = (texto) => { pasos.push(texto); console.log("OK", texto); };
  try {
    // 1. La administración carga el precio real de una unidad disponible.
    await entrar(contexto, "admin", pagina);
    await pagina.goto(`${BASE}/propiedades/${PROYECTO}?estado=available`, { waitUntil: "networkidle" });
    const cargar = pagina.getByRole("button", { name: /^Cargar el precio real de / }).first();
    const codigo = (await cargar.getAttribute("aria-label")).replace("Cargar el precio real de ", "");
    await cargar.click();
    await pagina.getByLabel(new RegExp(`Precio real de ${codigo}`)).fill("150000");
    await pagina.getByRole("button", { name: "Guardar" }).click();
    await pagina.getByText("Real US$150,000").first().waitFor();
    await sinError(pagina, "precio real");
    paso(`precio real cargado en ${codigo}`);

    // 2. La administración asigna el proyecto a Broker Prueba 2.
    await pagina.goto(`${BASE}/brokers`, { waitUntil: "networkidle" });
    const tarjeta = pagina.locator("li", { has: pagina.getByRole("heading", { name: "Broker Prueba 2" }) });
    await tarjeta.getByRole("button", { name: "Cambiar proyectos" }).click();
    const casilla = tarjeta.getByRole("checkbox", { name: /^Sun Garden/ });
    await casilla.check();
    const guardado = pagina.waitForResponse((r) => r.url().includes("/api/brokers/") && r.request().method() === "PUT");
    await tarjeta.getByRole("button", { name: "Guardar proyectos" }).click();
    if (!(await guardado).ok()) throw new Error("asignar proyectos: la API respondió con error");
    // El formulario se cierra al guardar; luego la tarjeta muestra el proyecto ya refrescado.
    await tarjeta.getByRole("button", { name: "Cambiar proyectos" }).waitFor();
    await tarjeta.locator("p", { hasText: "Sun Garden" }).waitFor();
    await sinError(pagina, "asignar proyectos");
    paso("Sun Garden asignado a Broker Prueba 2");

    // 3. La administración aprueba una comisión pendiente.
    await pagina.goto(`${BASE}/comisiones?periodo=todos&estado=pending`, { waitUntil: "networkidle" });
    const pendientesAntes = await pagina.getByRole("button", { name: "Aprobar" }).count();
    await pagina.getByRole("button", { name: "Aprobar" }).first().click();
    await pagina.waitForFunction((antes) => document.querySelectorAll("main button").length && [...document.querySelectorAll("main button")].filter((b) => b.textContent === "Aprobar").length === antes - 1, pendientesAntes);
    await sinError(pagina, "aprobar comisión");
    paso("comisión aprobada");

    // 4. El broker añade la unidad a su negocio y la aparta.
    await entrar(contexto, "broker", pagina);
    await pagina.goto(`${BASE}/negocios/${NEGOCIO_BROKER}`, { waitUntil: "networkidle" });
    await pagina.getByRole("button", { name: "Añadir propiedad" }).click();
    await pagina.getByLabel(/^Proyecto/).selectOption({ label: "Sun Garden" });
    await pagina.getByLabel(/^Unidad/).selectOption({ label: codigo });
    await pagina.getByLabel("Es la propiedad principal del negocio").uncheck();
    await pagina.getByRole("button", { name: "Añadir", exact: true }).click();
    await pagina.getByText(`unidad ${codigo}`).waitFor();
    await sinError(pagina, "añadir propiedad");
    const fila = pagina.locator("li", { hasText: `unidad ${codigo}` });
    await fila.getByRole("button", { name: "Apartar unidad" }).click();
    await fila.getByLabel(/Por qué se aparta/).fill("Va a firmar la reserva el lunes");
    await fila.getByRole("button", { name: "Apartar 48 h" }).click();
    await fila.getByText(/Apartada hasta/).waitFor();
    paso(`unidad ${codigo} apartada por el broker`);

    // 5. El broker no puede apartar sobre el negocio de otro broker (la API responde como si no existiera).
    const ajeno = await contexto.request.post(`${BASE}/api/holds`, {
      data: { dealId: NEGOCIO_AJENO, reason: "prueba", units: [{ unitId: 1, componentRole: "principal" }] }, headers: { origin: BASE },
    });
    if (ajeno.status() !== 404) throw new Error(`Apartar en negocio ajeno devolvió ${ajeno.status()}, se esperaba 404`);
    paso("apartar en negocio ajeno rechazado (404)");
    const noAsociada = await contexto.request.post(`${BASE}/api/holds`, {
      data: { dealId: NEGOCIO_BROKER, reason: "prueba", units: [{ unitId: 1, componentRole: "principal" }] }, headers: { origin: BASE },
    });
    if (noAsociada.status() !== 409) throw new Error(`Apartar una unidad que no es del negocio devolvió ${noAsociada.status()}, se esperaba 409`);
    paso("apartar una unidad ajena al negocio rechazado (409)");

    // 6. El broker extiende y luego libera el apartado desde Reservas.
    await pagina.goto(`${BASE}/reservas`, { waitUntil: "networkidle" });
    const apartado = pagina.locator("li", { hasText: `Unidad ${codigo}` }).first();
    await apartado.getByRole("button", { name: "Extender 24 h" }).click();
    await apartado.getByLabel(/Por qué se extiende/).fill("El cliente pidió un día más");
    await apartado.getByRole("button", { name: "Extender", exact: true }).click();
    await apartado.getByText("extendido 1 vez").waitFor();
    paso("apartado extendido 24 h");
    await apartado.getByRole("button", { name: "Liberar" }).click();
    await apartado.getByLabel(/Por qué se libera/).fill("El cliente eligió otra unidad");
    await apartado.getByRole("button", { name: "Liberar unidad" }).click();
    await pagina.locator("li", { hasText: `Unidad ${codigo}` }).waitFor({ state: "detached" });
    await pagina.goto(`${BASE}/reservas?ver=historial`, { waitUntil: "networkidle" });
    await pagina.locator("li", { hasText: `Unidad ${codigo}` }).getByText("Liberada").first().waitFor();
    paso("apartado liberado y en el historial");

    // 7. El gerente ya ve el proyecto que lleva un broker de su equipo.
    await entrar(contexto, "manager", pagina);
    await pagina.goto(`${BASE}/propiedades`, { waitUntil: "networkidle" });
    await pagina.getByText("Sun Garden").first().waitFor({ timeout: 10_000 });
    paso("el gerente ve Sun Garden en Propiedades");

    console.log(`\nRECORRIDO COMPLETO: ${pasos.length} pasos`);
  } catch (error) {
    await pagina.screenshot({ path: "e2e-n2-fallo.png", fullPage: true }).catch(() => {});
    console.error("FALLO:", error.message);
    process.exitCode = 1;
  } finally {
    await navegador.close();
  }
})();
