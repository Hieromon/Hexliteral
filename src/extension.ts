// src/extension.ts

import * as vscode from 'vscode';
import { convertSingleFile } from './convertHexliteral';
import { buildFromManifest } from './buildManifest';
import { pickAndConvertFile } from './filePicker';

/**
 * Activates the Hexliteral extension.
 * This method is called when the extension is activated based on activation events.
 */
export function activate(context: vscode.ExtensionContext) {

  // Command 1: Convert a single file (QuickPick or via context menu)
  let disposableConvert = vscode.commands.registerCommand('hexliteral.convertHexliteral', async (uri?: vscode.Uri) => {
    if (uri) {
      await convertSingleFile(uri, false);
    } else {
      await pickAndConvertFile(false);
    }
  });

  // Command 2: Convert a single file with Gzip
  let disposableConvertWithGzip = vscode.commands.registerCommand('hexliteral.convertHexliteralWithGzip', async (uri?: vscode.Uri) => {
    if (uri) {
      await convertSingleFile(uri, true);
    } else {
      await pickAndConvertFile(true);
    }
  });

  // Command 3: Build C++ headers from the hexliteral.json manifest
  let disposableBuild = vscode.commands.registerCommand('hexliteral.buildManifest', async (uri?: vscode.Uri) => {
    let targetRoot: vscode.Uri | undefined;
    
    if (uri) {
      // If invoked from the context menu, 'uri' is the path to hexliteral.json itself.
      // We need to extract its parent directory (the workspace root).
      targetRoot = vscode.Uri.joinPath(uri, '..');
    } else {
      // Resolve the target workspace when invoked from the Command Palette.
      const folders = vscode.workspace.workspaceFolders;
      if (!folders || folders.length === 0) {
        vscode.window.showErrorMessage('Hexliteral: Please open a workspace to build from manifest.');
        return;
      }

      if (folders.length === 1) {
        targetRoot = folders[0].uri;
      } else {
        // Prompt the user to select a target folder in a multi-root workspace.
        const selectedFolder = await vscode.window.showWorkspaceFolderPick({
          placeHolder: 'Select the workspace containing hexliteral.json to build'
        });
        if (selectedFolder) {
          targetRoot = selectedFolder.uri;
        } else {
          // Abort if the user cancels the selection.
          return;
        }
      }
    }

    if (targetRoot) {
      await buildFromManifest(targetRoot);
    }
  });

  // Register commands for disposal on deactivation
  context.subscriptions.push(disposableConvert, disposableConvertWithGzip, disposableBuild);
}

/**
 * Deactivates the Hexliteral extension.
 */
export function deactivate() {}
