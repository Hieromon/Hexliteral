import * as vscode from 'vscode';
import { convertSingleFile } from './convertHexliteral';

/**
 * Opens a QuickPick menu allowing the user to select a web asset file from the workspace.
 * Automatically finds files matching specific extensions, excluding node_modules.
 */
export async function pickAndConvertFile(keepGzip: boolean) {
  // Find convertible files in the workspace
  const fileUris = await vscode.workspace.findFiles(
    '**/*', 
    '**/{node_modules,.git,build,out,dist,.pio,.vscode}/**'
  );
  if (fileUris.length === 0) {
    vscode.window.showInformationMessage('No convertible files found in workspace.');
    return;
  }

  // Map URIs to QuickPickItem format
  const items = fileUris.map(uri => ({
    label: vscode.workspace.asRelativePath(uri),
    uri: uri
  }));

  // Show QuickPick to the user
  const selected = await vscode.window.showQuickPick(items, {
    placeHolder: 'Select a file to convert to Hexliteral'
  });

  // If a file was selected, pass it to the single-file conversion logic
  if (selected) {
    await convertSingleFile(selected.uri, keepGzip); // keepGzip parameter is false by default
  }
}
