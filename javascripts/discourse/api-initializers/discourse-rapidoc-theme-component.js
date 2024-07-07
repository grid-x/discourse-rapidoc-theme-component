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
    const codeBlock = apidoc.querySelector("code");

    if (!codeBlock) {
      return;
    }

    const promise =  new Promise(resolve => resolve(codeBlock.textContent))
    promise
      .then((spec) => {
        apidoc.outerHTML=`<div></div>`
        apidoc.innerHTML = `
        <rapi-doc 
          spec-url="${spec}"
          render-style="view"
          show-header="false"
          show-info="true" 
          show-curl-before-try="true"
          allow-authentication="false" 
          allow-server-selection="false" 
          allow-api-list-style-selection="false"
          allow-spec-file-download="true"
          theme="${theme==='dark' ? 'dark' : 'light'}" 
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
        apidoc.querySelector(".spinner")?.remove();
      });

    if (key === "composer") {
      discourseDebounce(updateMarkdownHeight, apidoc, index, 500);
    }
  });
}

function updateMarkdownHeight(apidoc, index) {
  let height = parseInt(apidoc.getBoundingClientRect().height, 10);
  let calculatedHeight = parseInt(apidoc.dataset.calculatedHeight, 10);

  if (height === 0) {
    return;
  }

  if (height !== calculatedHeight) {
    apidoc.dataset.calculatedHeight = height;
    // TODO: an API to grab the composer vs leaning on hunting through HTML
    // would be better
    let composer = document.getElementsByClassName("d-editor-input")[0];

    let split = composer.value.split("\n");

    let n = 0;
    for (let i = 0; i < split.length; i++) {
      if (split[i].match(/```apidoc((\s*)|.*auto)$/)) {
        if (n === index) {
          split[i] = "```apidoc height=" + height + ",auto";
        }
        n += 1;
      }
    }

    let joined = split.join("\n");

    if (joined !== composer.value) {
      let restorePosStart = composer.selectionStart;
      let restorePosEnd = composer.selectionEnd;

      composer.value = joined;

      if (restorePosStart) {
        composer.selectionStart = restorePosStart;
        composer.selectionEnd = restorePosEnd;
      }
    }
  }
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
