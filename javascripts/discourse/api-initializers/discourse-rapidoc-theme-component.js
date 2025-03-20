import { apiInitializer } from "discourse/lib/api";
import loadScript from "discourse/lib/load-script";

async function applyRapidoc(element) {
  const apidocs = element.querySelectorAll("pre[data-code-wrap=apidoc]");

  if (!apidocs.length) {
    return;
  }

  await loadScript(settings.theme_uploads_local.rapidoc_js);

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

  apidocs.forEach((apidoc) => {
    const codeBlock = apidoc.querySelector("code");

    if (!codeBlock) {
      return;
    }

    const promise = new Promise((resolve) => resolve(codeBlock.textContent));
    promise
      .then((spec) => {
        apidoc.outerHTML = `
        <rapi-doc 
          spec-url="${spec}"
          render-style="focussed"
          layout="column"
          allow-advanced-search="true"
          allow-search="false"
          show-header="false"
          show-info="true" 
          show-curl-before-try="false"
          allow-server-selection="false" 
          allow-api-list-style-selection="false"
          allow-spec-file-download="true"
          allow-spec-file-load="false"
          allow-authentication="true"
          persist-auth="true"
          show-method-in-nav-bar="as-colored-text"
          schema-description-expanded="true"
          theme="${theme === "dark" ? "dark" : "light"}" 
          nav-bg-color="${theme === "dark" ? "#323334" : "#ebeced"}"
        > 
        </rapi-doc>
        <br/>
        `;
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
      applyRapidoc(elem, id);
    },
    { id: "discourse-rapidoc-theme-component" }
  );
});
