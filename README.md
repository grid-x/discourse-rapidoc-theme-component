# Discourse Rapidoc Theme Component

This is a [Discourse theme component](https://meta.discourse.org/t/beginners-guide-to-using-discourse-themes/91966) that uses [RapiDoc](https://rapidocweb.com/) to render OpenAPI specifications inline in Discourse topics.

Based off the nice official [Discourse mermaid component](https://github.com/discourse/discourse-mermaid-theme-component).

To use it ...

- [install it](https://meta.discourse.org/t/install-a-theme-or-theme-component/63682) into your Discourse instance
- in a topic, create a code block and use `apidoc` as language tag and the URL of an OpenAPI specification url as the block's content.

````
```apidoc
https://petstore.swagger.io/v2/swagger.json
````

If specification is not publicly accessible, you can attach the specification file to your post and copy the URL after the file has been uploaded.

Here's how it could look like
![rapidoc in discourse](image.png)

## Development

Clone, `yarn` and `yarn dev` and play around with the rapidoc API in [./test/component.html](./test/component.html).
Review the locally served page.

The page is an approximation of how the component will be rendered within discourse.
It renders the [petstore sample](./test/petstore-with-samples.json) file which can safely be replaced with any other valid OAS file.

Put the desired rapidoc invocation into `discourse-rapidoc-theme-component`.
Refer to the official Discourse theme component docs :point_up: for installation instructions.
