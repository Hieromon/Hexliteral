# Hexliteral

Hexliteral is an ultimate build pipeline tool that transpiles any static assets into gzip-compressed C++ byte arrays (`const uint8_t[]`) seamlessly within the VS Code environment. It is specifically designed for resource-constrained device development like embedded Linux and MCUs (ESP32, Arduino, etc.).

## Overview

In device development with limited resources, embedding external static resources (web assets, images, fonts, certificate files, etc.) directly into C++ code is a common approach to bypass file system constraints. However, the process of maximizing memory efficiency by "gzipping" these assets and transpiling them into C++ compatible `const uint8_t` binary arrays has historically caused significant bottlenecks in the development cycle, whether done manually or via external scripts (e.g., `xxd`).

Hexliteral completely internalizes this cumbersome build flow within the VS Code environment. It provides end-to-end automation, reducing the time lag of switching between external tools and shell scripts to zero.

## Features

### Available Commands

*   `Hexliteral: Convert file to hexadecimal byte array` - Compresses a single file with gzip and converts it to a `const uint8_t[]` array.
*   `Hexliteral: Convert file to hexadecimal byte array w/gzip file` - Compresses a single file, converts it, and retains the raw `.gz` binary file.
*   `Hexliteral: Build C++ Header from hexliteral.json` - Executes a batch build based on the `hexliteral.json` manifest.

### Two Conversion Approaches

Hexliteral offers two powerful interfaces that can be flexibly used depending on your development scenario.

#### 1. Quick Single-File Conversion (QuickPick / Context Menu)
When you need to convert an individual file immediately, execute the command `Hexliteral: Convert file to hexadecimal byte array`. 
A built-in file picker will launch, allowing you to quickly locate resources in your workspace using incremental search. Once a file is selected, a C++ header file (`.gz.h`) formatted as a standard hexadecimal array is instantly generated in memory and saved in the same directory as the source file.
You can also convert a file by right-clicking it directly in the Explorer. If necessary, a dedicated command (`w/gzip file`) is available to physically save the raw gzip binary alongside the C++ header.

No prior configuration file is required. It works out-of-the-box with built-in safe default settings right after installation.

#### 2. Advanced Batch Build Management via Manifest
For managing multiple resources, the batch build system (`Hexliteral: Build C++ Header from hexliteral.json`) driven by a manifest file (`hexliteral.json`) shows its true value.
By **right-clicking `hexliteral.json` in the Explorer** or invoking it from the Command Palette (prompting a target selection in multi-root workspaces), it automatically generates C++ headers applying the following advanced code orchestration:

*   **C++ Structure Optimization**: Automatic insertion of include guards (`#ifndef`), required `#include` directives, and `using namespace` declarations.
*   **Source File Traceability**: Automatic insertion of comments indicating the original file name and uncompressed file size (`Size: ...`).
*   **Variable Naming & Namespaces**: Direct mapping of C++ scope-compliant variable names, such as `Content::VarName`.
*   **Conditional Compilation**: Seamless embedding of conditional compile blocks (`#if defined(...)`) for specific resources.
*   **Robust Development Support**: A safety mechanism that automatically creates backups (files with a `~` suffix) before overwriting existing generated headers.

## Flexible & Robust Format Tuning with JSON Schema

The data format and naming conventions of the generated binaries can be flexibly adapted to fit your project's coding standards and target environment constraints.

Hexliteral does not pollute your VS Code environment settings (`settings.json`). All formatting rules are centrally managed solely by `hexliteral.json` located at the workspace root. This guarantees "idempotency" — ensuring that the output C++ code format remains perfectly consistent, regardless of who builds it or in which environment.

Furthermore, Hexliteral is fully integrated with VS Code's JSON Schema. When editing `hexliteral.json`, powerful IntelliSense—including autocomplete, type checking, and hover documentation—is automatically enabled.

### Manifest Specification (`hexliteral.json`)

The manifest file is broadly divided into two sections: "Global Format Rules" applied to the entire workspace, and the `builds` array defining the batch build topology.

#### 1. Global Format Rules
Properties defined at the root level. These rules act as standard conventions for the workspace, applying not only to manifest-driven batch builds but also to single-file conversions via QuickPick.

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `outputBoundary` | Number | `16` | Number of hexadecimal bytes output per line in the generated array. |
| `cppDeclare` | Boolean | `true` | Whether to wrap the array in a C++ variable declaration statement (e.g., `const uint8_t name[] = { ... };`). If `false`, only the raw contents (`0x00, 0x01, ...`) are output. |
| `emitSizeMacro` | Boolean | `false` | Whether to auto-generate a macro indicating the compressed array size right before the array (e.g., `#define name_len 123`). |
| `indentSpaces` | Number | `2` | Number of leading spaces (indentation) to insert at the beginning of each line of the hex array. |
| `headerComment` | Boolean | `true` | Whether to output an auto-generated comment block indicating Hexliteral at the top of the file. |

#### 2. Build Definitions (`builds` Array)
Defines the output destinations and the grouped resources included in them when executing a batch build. To generate multiple header files simultaneously, define multiple objects within this array.

##### Build Task Properties
| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `out` | String | Yes | Relative path of the output C++ header file (e.g., `"src/AutoConnectContentROData.h"`). |
| `items` | Array | Yes | Array defining the files to be converted (details below). |
| `backup` | Boolean| No | If `true`, creates a backup with a `~` suffix before overwriting an existing destination file. |
| `guard` | String | No | Generates an include guard with the specified string (`#ifndef GUARD_H ...`). |
| `includes` | Array | No | Array of `#include` directives (e.g., `["\"AutoConnectContent.h\""]`). |
| `using` | Array | No | Array of `using namespace` directives (e.g., `["AutoConnectContent"]`). |

##### Asset Definitions (`items` Array)
Each object in the `items` array defines a single input file and how it should be handled in C++.

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `src` | String | Yes | Relative path of the source input file to convert. |
| `var` | String | Yes | Variable name (array name) defined in C++. Scope specifications like `Namespace::VarName` are supported. |
| `macro` | String | No | If specified, wraps this entire asset within a `#if defined(MACRO_NAME)` to `#endif` block for conditional compilation. |
| `emitSizeMacro`| Boolean| No | Overrides the global `emitSizeMacro` setting for this specific asset only. Useful when you need a size macro for only certain resources. |

**Example (`hexliteral.json`)**
```json
{
  "outputBoundary": 16,
  "cppDeclare": true,
  "emitSizeMacro": false,
  "indentSpaces": 2,
  "headerComment": true,
  "builds": [
    {
      "out": "src/AutoConnectContentROData.h",
      "backup": true,
      "guard": "_AUTOCONNECTCONTENTRODATA_H_",
      "includes": ["\"AutoConnectContent.h\""],
      "items": [
        {
          "src": "extras/css/AutoConnectContentCSSBase.css",
          "var": "Content::AutoConnectContentCSSBase"
        },
        {
          "src": "extras/js/AutoConnectContentScriptOTA.js",
          "var": "Content::AutoConnectContentScriptOTA",
          "macro": "AUTOCONNECT_ENABLE_UPDATE",
          "emitSizeMacro": true
        }
      ]
    }
  ]
}
```

## License

[MIT](LICENSE.md)
