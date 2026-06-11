/**
 * generate-uml.mjs
 * Generate automatically UML diagrams (.puml + .svg) for each .ts file
 * as well as a global diagram per layer (models, services, pages, interceptors...).
 *
 * Note : requires tsuml2 (https://www.npmjs.com/package/tsuml2)
 * Usage : node scripts/generate-uml.mjs
 */

import { execSync } from 'child_process';
import { readdirSync, mkdirSync, statSync } from 'fs';
import { join, relative, dirname, basename, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = join(__dirname, '..');
const SRC       = join(ROOT, 'src', 'app');
const OUT       = join(ROOT, 'docs', 'uml');

// File patterns to ignore (test files, config files, route definitions, type declarations) 
const IGNORE = ['.spec.ts', '.config.ts', '.routes.ts', '.d.ts'];

// Layers to generate in a global view (in addition to file by file)
const LAYERS = [
  { name: 'all',          glob: './src/app/**/!(*.spec|*.config|*.routes).ts' },
  { name: 'models',       glob: './src/app/core/models/**/*.ts'               },
  { name: 'services',     glob: './src/app/core/service/**/*.ts'              },
  { name: 'pages',        glob: './src/app/pages/**/*.ts'                     },
  { name: 'interceptors', glob: './src/app/interceptors/**/*.ts'              },
  { name: 'utils',        glob: './src/app/core/utils/**/*.ts'                },
  { name: 'shared',       glob: './src/app/shared/**/*.ts'                    },
];

// ─── Utils ────────────────────────────────────────────────────────────

/**
 * Ignore files that are not relevant for UML diagrams (tests, configs, routes, types)
 * ex: auth.service.spec.ts, app.routes.ts, index.d.ts, jest.config.ts
 * 
 * @param {string} filename - The name of the file to check
 * @returns {boolean} - True if the file should be ignored, false otherwise
 * 
 */
function shouldIgnore(filename) {
  return IGNORE.some(suffix => filename.endsWith(suffix));
}

/**
 * Run tsuml2 on a given glob pattern and output base
 * This function executes the tsuml2 command with the specified glob pattern and output base.
 * It generates both a .puml file (PlantUML DSL) and a .svg file (the UML diagram).
 * If no classes or interfaces are found in the specified glob, it catches the error and logs a warning.
 * 
 * @param {string} glob - The glob pattern to use for tsuml2
 * @param {string} outBase - The base name for the output files (without extension)
 * 
 */
function runTsuml2(glob, outBase) {
  const puml = `${outBase}.puml`;
  const svg  = `${outBase}.svg`;
  try {
    execSync(
      `npx tsuml2 --glob "${glob}" --outDsl "${puml}" -o "${svg}"`,
      { cwd: ROOT, stdio: 'pipe' }
    );
    console.log(`  ✅ ${relative(ROOT, puml)}`);
  } catch (e) {
    console.warn(`  ⚠️  Skipped (no class/interface found): ${relative(ROOT, puml)}`);
  }
}

/**
 * Get all .ts files in a directory and its subdirectories
 * 
 * @param {string} dir - The directory to search in
 * @returns {string[]} - An array of all .ts files in the directory and its subdirectories
 */
function getAllTsFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...getAllTsFiles(full));
    } else if (entry.endsWith('.ts') && !shouldIgnore(entry)) {
      results.push(full);
    }
  }
  return results;
}

// ─── 1. Diagram per layer ────────────────────────────────────────────────

console.log('\n📦 Per layer diagram generation ...');
mkdirSync(join(OUT, 'layers'), { recursive: true });

for (const layer of LAYERS) {
  process.stdout.write(`  → front-${layer.name} ... `);
  const outBase = join(OUT, 'layers', `front-${layer.name}`);
  runTsuml2(layer.glob, outBase);
}

// ─── 2. Diagram per file ────────────────────────────────────────────────

console.log('\n📄 Per file diagram generation ...');

const tsFiles = getAllTsFiles(SRC);

for (const file of tsFiles) {
  const rel        = relative(SRC, file);                        // e-g: core/service/auth.service.ts
  const dir        = dirname(rel);                               // e-g: core/service
  const name       = basename(file, extname(file));              // e-g: auth.service
  const outDir     = join(OUT, 'files', dir);
  const outBase    = join(outDir, name);
  const relGlob    = './' + relative(ROOT, file).replace(/\\/g, '/');

  mkdirSync(outDir, { recursive: true });
  runTsuml2(relGlob, outBase);
}

console.log(`\n✨ Completed! The files are in: docs/uml/`);
console.log(`   ├── layers/   → views by layer`);
console.log(`   └── files/    → one file per .ts\n`);
