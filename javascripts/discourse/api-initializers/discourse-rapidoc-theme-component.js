import { apiInitializer } from "discourse/lib/api";
import loadScript from "discourse/lib/load-script";
import discourseDebounce from "discourse-common/lib/debounce";

async function applyRapidoc(element, key = "composer") {
  const rapidocs = element.querySelectorAll("pre[data-code-wrap=rapidoc]");

  if (!rapidocs.length) {
    return;
  }

  await loadScript(settings.theme_uploads_local.rapidoc_js);

  // window.rapidoc.initialize({
  //   startOnLoad: false,
  //   theme:
  //     getComputedStyle(document.body)
  //       .getPropertyValue("--scheme-type")
  //       .trim() === "dark"
  //       ? "dark"
  //       : "default",
  // });

  rapidocs.forEach((rapidoc) => {
    if (rapidoc.dataset.processed) {
      return;
    }

    const spinner = document.createElement("div");
    spinner.classList.add("spinner");

    if (rapidoc.dataset.codeHeight && key !== "composer") {
      rapidoc.style.height = `${rapidoc.dataset.codeHeight}px`;
    }

    rapidoc.append(spinner);
  });

  rapidocs.forEach((rapidoc, index) => {
    const code = rapidoc.querySelector("code");

    if (!code) {
      return;
    }

    const rapidocId = `rapidoc_${index}_${key}`;
    const promise =  new Promise(resolve => resolve("https://petstore.swagger.io/v2/swagger.json"))
    promise
      .then((spec) => {
        rapidoc.innerHTML = `
        <rapi-doc 
          spec-url="${spec}"
          render-style="view"
          show-header="false"
          show-info="false" allow-authentication="false" 
          allow-server-selection="false" 
          allow-api-list-style-selection="false" 
          theme="dark" 
          layout="column" 
        > 
        </rapi-doc>
        `;
      })
      .catch((e) => {
        rapidoc.innerText = e?.message || e;
      })
      .finally(() => {
        rapidoc.dataset.processed = true;
        rapidoc.querySelector(".spinner")?.remove();
      });

    if (key === "composer") {
      discourseDebounce(updateMarkdownHeight, rapidoc, index, 500);
    }
  });
}

function updateMarkdownHeight(rapidoc, index) {
  let height = parseInt(rapidoc.getBoundingClientRect().height, 10);
  let calculatedHeight = parseInt(rapidoc.dataset.calculatedHeight, 10);

  if (height === 0) {
    return;
  }

  if (height !== calculatedHeight) {
    rapidoc.dataset.calculatedHeight = height;
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
