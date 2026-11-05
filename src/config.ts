/**
 * Global format rules for generating C++ byte arrays.
 * These rules apply universally to both single-file conversions and manifest builds,
 * unless overridden at the individual asset level in the manifest.
 */
export interface HexliteralFormatOptions {
  outputBoundary: number;     // Number of hexadecimal bytes per line in the generated array.
  cppDeclare: boolean;        // Whether to wrap the array in a C++ declaration (e.g., const uint8_t name[] = { ... }).
  emitSizeMacro: boolean;     // Whether to automatically emit a macro defining the array size (e.g., #define name_len 123).
  indentSpaces: number;       // Number of spaces for indenting the hex array lines.
  headerComment: boolean;     // Whether to emit an auto-generated comment block at the top of the file.
}

/**
 * Safe default format options for "Out-of-the-box" usage.
 * Used when a single file is converted without a hexliteral.json in the workspace.
 */
export const DEFAULT_FORMAT_OPTIONS: HexliteralFormatOptions = {
    outputBoundary: 16,
    cppDeclare: true,
    emitSizeMacro: false,
    indentSpaces: 2,          // Default to 2 spaces
    headerComment: true       // Default to emit header comment
};

/**
 * Represents a single asset to be converted within a build task.
 */
export interface AssetItem {
  src: string;                // Relative path to the source file.
  var: string;                // C++ variable name for the generated array (scope operators like Content::VarName are allowed).
  macro?: string;             // Optional macro name to wrap the asset in a conditional compile block (#if defined(...)).
  emitSizeMacro?: boolean;    // Asset-level override for the global emitSizeMacro setting.
}

/**
 * Defines a build task that aggregates multiple assets into a single C++ header file.
 */
export interface BuildTask {
  out: string;                // Relative path to the output C++ header file.
    backup?: boolean;         // If true, creates a backup (~) of the existing output file before overwriting.
    guard?: string;           // Optional include guard macro string (#ifndef GUARD_H).
    includes?: string[];      // Array of include directives (e.g., ["\"header.h\"", "<vector>"]).
    using?: string[];         // Array of namespaces for using directives (e.g., ["std", "Content"]).
    items: AssetItem[];       // List of assets to process and bundle into this output file.
}

/**
 * Schema definition for the workspace hexliteral.json manifest.
 * Combines global format rules and project-specific build topologies.
 */
export interface ManifestSchema extends Partial<HexliteralFormatOptions> {
    builds?: BuildTask[];
}
