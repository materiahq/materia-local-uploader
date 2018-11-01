# Materia - Local Uploader

Upload Files to your materia application folder, through multipart/form-data.

Warning: This addon is not scallable.

## Features

- Add interactively "Upload Endpoints" to your application with available permissions and options: maxFileSize, MIME types accepted...
- List of uploaded files

## Installation from NPM

In your Materia application, run `npm install @materia/local-uploader --save` or `yarn add @materia/local-uploader`

Restart Materia Designer

## Installation from local files

Clone this repository:

```
git clone git@github.com:thyb/materia-local-uploader.git
cd materia-local-uploader
```

Then install dependencies and build:

```
yarn
yarn build
```

To test your addon locally before publishing it to NPM, use `npm link`:

```
cd dist && npm link
```

and in your materia application

```
npm link @materia/local-uploader
```

then add `"@materia/local-uploader"` in the links array of the materia.json configuration file - it will let Materia knows of the existance of the addon.
