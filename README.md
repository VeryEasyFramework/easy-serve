# EasyServe

`EasyServe` is used under the hood by `EasyApp` and handles the web server
setup, configuration and core functionality.

It is designed as a standalone module that can be used as a web server for any
Deno project.

## Features

- Simple API
- Built-in extensions
- Easy to extend
- Fully compatible with [Deno Deploy](https://deno.com/deploy)
- Compatible with `deno serve`

## Usage

### Basic Usage

```ts
// main.ts
import EasyServe from "@vef/easy-serve";

const server = await EasyServe.create({
  extensions: [], // Add extensions here
});

server.run();
```

run the server using `deno run`:

```shell
deno run -A main.ts
```

### With Deno Serve

`EasyServer` is also compatible with `deno serve`. This is useful when you want
to use features like parallel processing.

```ts
// main.ts
import EasyServe from "@vef/easy-serve";

const server = await EasyServe.create({
  extensions: [], // Add extensions here
});

export default server;
```

Now you can run the server using `deno serve`:

```shell
deno serve --parallel main.ts
```
