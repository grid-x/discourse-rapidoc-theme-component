import { apiInitializer } from "discourse/lib/api";
import loadScript from "discourse/lib/load-script";
import discourseDebounce from "discourse-common/lib/debounce";

async function applyRapidoc(element, key = "composer") {
  const apidocs = element.querySelectorAll("pre[data-code-wrap=apidoc]");

  if (!apidocs.length) {
    return;
  }

  await loadScript(settings.theme_uploads_local.rapidoc_js);

  const theme =
    getComputedStyle(document.body)
      .getPropertyValue("--scheme-type")
      .trim() === "dark"
      ? "dark"
      : "default"

  apidocs.forEach((apidoc) => {
    if (apidoc.dataset.processed) {
      return;
    }

    const spinner = document.createElement("div");
    spinner.classList.add("spinner");

    if (apidoc.dataset.codeHeight && key !== "composer") {
      apidoc.style.height = `${apidoc.dataset.codeHeight}px`;
    }

    apidoc.append(spinner);
  });

  apidocs.forEach((apidoc, index) => {
    const code = apidoc.querySelector("code");

    if (!code) {
      return;
    }

    const rapidocId = `apidoc_${index}_${key}`;
    const promise =  new Promise(resolve => resolve(code.textContent))
    promise
      .then((spec) => {
        apidoc.innerHTML = `
        <rapi-doc 
          spec-url="${spec}"
          render-style="view"
          show-header="false"
          show-info="false" allow-authentication="false" 
          allow-server-selection="false" 
          allow-api-list-style-selection="false" 
          theme="${theme==='dark' ? 'dark' : 'light'}" 
          layout="column" 
        > 
        </rapi-doc>
        `;
      })
      .catch((e) => {
        apidoc.innerText = e?.message || e;
      })
      .finally(() => {
        apidoc.dataset.processed = true;
        apidoc.querySelector(".spinner")?.remove();
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
