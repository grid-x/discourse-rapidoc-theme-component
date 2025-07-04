import { apiInitializer } from "discourse/lib/api";
import loadScript from "discourse/lib/load-script";

async function applySwaggerUi(element) {
  const apidocs = element.querySelectorAll("pre[data-code-wrap=swagger]");

  if (!apidocs.length) {
    return;
  }

  await loadScript(settings.theme_uploads_local.swagger_ui_bundle_js);
  await loadScript(settings.theme_uploads_local.swagger_ui_standalone_preset_js);

  const theme =
    getComputedStyle(document.body).getPropertyValue("--scheme-type").trim() ===
    "dark"
      ? "dark"
      : "default";

  apidocs.forEach((apidoc) => {
    if (apidoc.dataset.processed) {
      return;
    }
  });
  let i = 0;
  apidocs.forEach((apidoc) => {
    const codeBlock = apidoc.querySelector("code");

    if (!codeBlock) {
      return;
    }
    i++;

    const promise = new Promise((resolve) => resolve(codeBlock.textContent));
    promise
      .then((spec) => {
        apidoc.outerHTML = `
        <div id="swagger-ui-${i}"></div>
        `;
        return spec;
      }).then((spec)=>{
          const ui = SwaggerUIBundle({
            url: `${spec}`,
            dom_id: `#swagger-ui-${i}`,
            deepLinking: true,
            presets: [
              SwaggerUIBundle.presets.apis,
              SwaggerUIStandalonePreset
            ]
          })

          window.ui = ui
      })
      .catch((e) => {
        apidoc.innerText = e?.message || e;
      })
      .finally(() => {
        apidoc.dataset.processed = true;
      });
  });
}

export default apiInitializer("1.13.0", (api) => {
  api.decorateCookedElement(
    async (elem, helper) => {
      const id = helper ? `post_${helper.getModel().id}` : "composer";
      applySwaggerUi(elem, id);
    },
    { id: "discourse-swagger-theme-component" }
  );
});
