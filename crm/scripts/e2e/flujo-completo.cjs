// Uso: CRM levantado en localhost:9401 con CRM_EVAL_LOGIN=1 y Playwright instalado. node scripts/e2e/flujo-completo.cjs
// Recorrido completo por la interfaz del CRM nuevo, haciendo clic como un usuario.
const { chromium } = require("playwright");
const path = require("node:path");

const BASE = "http://localhost:9401";
const RUN = Date.now().toString().slice(-6);
const NOMBRE = `Cliente E2E ${RUN}`;
const paso = (texto) => console.log(`-> ${texto}`);

async function comoRol(pagina, rol) {
  const r = await pagina.request.post(`${BASE}/api/auth/demo`, { data: { role: rol }, headers: { origin: BASE } });
  if (!r.ok()) throw new Error(`no se pudo entrar como ${rol}: ${r.status()}`);
}

async function sinError(pagina, momento) {
  const alerta = pagina.locator('main [role="alert"]');
  if (await alerta.count()) {
    const texto = (await alerta.first().innerText()).trim();
    if (texto) throw new Error(`${momento}: ${texto}`);
  }
}

(async () => {
  const navegador = await chromium.launch();
  const contexto = await navegador.newContext({ viewport: { width: 1280, height: 900 } });
  const pagina = await contexto.newPage();
  const errores = [];
  pagina.on("pageerror", (e) => errores.push(String(e).slice(0, 160)));
  try {
    // 1. Administración registra un lead a mano
    await comoRol(pagina, "admin");
    await pagina.goto(`${BASE}/leads`, { waitUntil: "networkidle" });
    await pagina.getByRole("button", { name: "Registrar lead" }).click();
    await pagina.getByLabel(/^Nombre/).fill(NOMBRE);
    await pagina.getByLabel(/^Teléfono/).fill(`809555${RUN.slice(-4)}`);
    await pagina.getByLabel(/^Proyecto o zona/).fill("Sun Garden");
    await pagina.getByRole("button", { name: "Guardar lead" }).click();
    await pagina.waitForURL(/\/leads\/\d+$/, { timeout: 20000 });
    const leadId = Number(pagina.url().split("/").pop());
    paso(`lead ${leadId} creado y abierto en su ficha`);

    // 2. Asigna el lead al primer broker
    await pagina.getByLabel("Responsable").selectOption({ index: 1 });
    await pagina.getByRole("button", { name: /^(Asignar|Reasignar)$/ }).click();
    await pagina.waitForLoadState("networkidle");
    await pagina.waitForTimeout(800);
    await sinError(pagina, "asignar");
    await pagina.reload({ waitUntil: "networkidle" });
    paso(`asignado: ${(await pagina.locator("dd").nth(2).innerText()).trim()}`);

    // 3. El broker registra la llamada y convierte el lead
    await comoRol(pagina, "broker");
    await pagina.goto(`${BASE}/leads/${leadId}`, { waitUntil: "networkidle" });
    await pagina.getByRole("button", { name: "Registrar llamada o tarea" }).click();
    await pagina.getByLabel(/^Título/).fill("Primera llamada, quiere visitar");
    await pagina.getByRole("button", { name: "Guardar" }).click();
    await pagina.waitForLoadState("networkidle"); await pagina.waitForTimeout(700);
    await sinError(pagina, "registrar llamada");
    paso("llamada registrada");
    await pagina.getByRole("button", { name: "Convertir en negocio" }).click();
    await pagina.waitForURL(/\/negocios\/\d+$/, { timeout: 20000 });
    const negocioId = Number(pagina.url().split("/").pop());
    paso(`convertido en el negocio ${negocioId}`);

    // 4. Avanza por el pipeline
    const avanzar = async (etapa) => {
      await pagina.getByRole("button", { name: new RegExp(`^${etapa}`) }).click();
      await pagina.waitForLoadState("networkidle"); await pagina.waitForTimeout(700);
      await sinError(pagina, `avanzar a ${etapa}`);
      paso(`etapa: ${etapa}`);
    };
    const registrar = async (tipo, titulo, conFecha) => {
      await pagina.getByRole("button", { name: "Registrar llamada o cita" }).click();
      await pagina.getByLabel(/^Qué registras/).selectOption(tipo);
      if (conFecha) await pagina.getByLabel(/^Fecha y hora/).fill(conFecha);
      await pagina.getByLabel(/^Título/).fill(titulo);
      await pagina.getByRole("button", { name: "Guardar" }).click();
      await pagina.waitForLoadState("networkidle"); await pagina.waitForTimeout(700);
      await sinError(pagina, `registrar ${tipo}`);
    };
    await registrar("call", "Llamada de seguimiento");
    await avanzar("Contactado");
    const manana = new Date(Date.now() + 86400000).toISOString().slice(0, 10) + "T10:00";
    await registrar("meeting", "Visita a Sun Garden", manana);
    await avanzar("Presentación");
    await pagina.getByRole("button", { name: "Añadir propiedad" }).click();
    await pagina.getByLabel(/^Proyecto/).selectOption({ label: "Sun Garden" });
    await pagina.getByLabel(/^Unidad/).selectOption({ index: 1 });
    const unidad = await pagina.getByLabel(/^Unidad/).locator("option:checked").innerText();
    await pagina.getByRole("button", { name: "Añadir", exact: true }).click();
    await pagina.waitForLoadState("networkidle"); await pagina.waitForTimeout(700);
    await sinError(pagina, "añadir propiedad");
    paso(`propiedad principal: Sun Garden ${unidad}`);
    await avanzar("Preselección");
    await pagina.getByRole("button", { name: "Editar monto y fechas" }).click();
    await pagina.getByLabel(/^Monto/).fill("378000");
    await pagina.getByLabel(/^Probabilidad/).fill("80");
    await pagina.getByLabel(/^Fecha estimada/).fill(new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10));
    await pagina.getByRole("button", { name: "Guardar" }).click();
    await pagina.waitForLoadState("networkidle"); await pagina.waitForTimeout(700);
    await sinError(pagina, "monto");
    paso("monto, probabilidad y fecha guardados");

    // 5. La administración fija la comisión (el broker no puede)
    await comoRol(pagina, "admin");
    await pagina.goto(`${BASE}/negocios/${negocioId}`, { waitUntil: "networkidle" });
    await pagina.getByRole("button", { name: "Editar monto y fechas" }).click();
    await pagina.getByLabel(/^Comisión/).fill("5");
    await pagina.getByRole("button", { name: "Guardar" }).click();
    await pagina.waitForLoadState("networkidle"); await pagina.waitForTimeout(700);
    await sinError(pagina, "comisión");
    paso("comisión 5 % fijada por la administración");

    // 6. El broker negocia y cierra
    await comoRol(pagina, "broker");
    await pagina.goto(`${BASE}/negocios/${negocioId}`, { waitUntil: "networkidle" });
    await avanzar("Negociación");
    await avanzar("Cierre");
    const estado = await pagina.locator("main header").first().innerText();
    paso(`negocio cerrado: ${/Cierre/.test(estado) ? "sí" : "no"}`);

    // 7. La meta del broker refleja el cierre
    await pagina.goto(`${BASE}/metas`, { waitUntil: "networkidle" });
    const fila = await pagina.locator("tbody tr").filter({ hasText: "Broker Prueba 1" }).first().innerText().catch(() => "sin fila");
    paso(`meta del broker: ${fila.replace(/\s+/g, " ")}`);
    await pagina.screenshot({ path: path.join(process.cwd(), "e2e-metas.png") });
  } catch (error) {
    console.log("FALLO:", error.message.split("\n")[0]);
    await pagina.screenshot({ path: path.join(process.cwd(), "e2e-fallo.png") }).catch(() => {});
    process.exitCode = 1;
  } finally {
    if (errores.length) console.log("errores de página:", errores);
    await navegador.close();
  }
})();
