/**
 * LSP (Language Server Protocol) Example
 *
 * Demonstrates how to use LSP features for code intelligence:
 * - Starting/stopping language servers
 * - Getting hover information
 * - Go to definition
 * - Find references
 * - Search symbols
 * - Get diagnostics
 */

import { A3sClient } from '../ts/client.js';

async function main() {
  const client = new A3sClient();

  try {
    // Initialize the agent
    await client.initialize('/path/to/project');

    // =========================================================================
    // Start Language Server
    // =========================================================================
    console.log('Starting Rust language server...');
    const startResult = await client.startLspServer(
      'rust',
      'file:///path/to/project'
    );
    console.log('Start result:', startResult);

    // List running servers
    const servers = await client.listLspServers();
    console.log('Running servers:', servers.servers);

    // =========================================================================
    // Hover Information
    // =========================================================================
    console.log('\n--- Hover Information ---');
    const hover = await client.lspHover(
      '/path/to/project/src/main.rs',
      10, // 0-indexed line
      5   // 0-indexed column
    );
    if (hover.found) {
      console.log('Hover content:', hover.content);
    } else {
      console.log('No hover information available');
    }

    // =========================================================================
    // Go to Definition
    // =========================================================================
    console.log('\n--- Go to Definition ---');
    const definitions = await client.lspDefinition(
      '/path/to/project/src/main.rs',
      15,
      10
    );
    for (const loc of definitions.locations) {
      const line = loc.range ? loc.range.start.line + 1 : '?';
      console.log(`Definition: ${loc.uri}:${line}`);
    }

    // =========================================================================
    // Find References
    // =========================================================================
    console.log('\n--- Find References ---');
    const references = await client.lspReferences(
      '/path/to/project/src/main.rs',
      20,
      8,
      true // include declaration
    );
    console.log(`Found ${references.locations.length} references:`);
    for (const loc of references.locations.slice(0, 5)) {
      const line = loc.range ? loc.range.start.line + 1 : '?';
      console.log(`  ${loc.uri}:${line}`);
    }

    // =========================================================================
    // Search Symbols
    // =========================================================================
    console.log('\n--- Search Symbols ---');
    const symbols = await client.lspSymbols('main', 10);
    console.log(`Found ${symbols.symbols.length} symbols matching 'main':`);
    for (const sym of symbols.symbols) {
      console.log(`  ${sym.name} (${sym.kind})`);
    }

    // =========================================================================
    // Get Diagnostics
    // =========================================================================
    console.log('\n--- Diagnostics ---');
    const diagnostics = await client.lspDiagnostics(
      '/path/to/project/src/main.rs'
    );
    if (diagnostics.diagnostics.length > 0) {
      console.log(`Found ${diagnostics.diagnostics.length} diagnostics:`);
      for (const diag of diagnostics.diagnostics) {
        const line = diag.range ? diag.range.start.line + 1 : '?';
        console.log(`  [${diag.severity}] Line ${line}: ${diag.message}`);
      }
    } else {
      console.log('No diagnostics');
    }

    // =========================================================================
    // Stop Language Server
    // =========================================================================
    console.log('\n--- Stopping Server ---');
    const stopResult = await client.stopLspServer('rust');
    console.log('Server stopped:', stopResult.success);

  } finally {
    client.close();
  }
}

main().catch(console.error);
