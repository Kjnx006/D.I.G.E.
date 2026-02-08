import * as ts from 'typescript';
import { promises as fs } from 'node:fs';
import path from 'node:path';

type CliOptions = {
  write: boolean;
  force: boolean;
  keep: Set<string>;
  keepPrefixes: string[];
};

type DynamicUsage = {
  file: string;
  line: number;
  text: string;
};

const SOURCE_EXTS = new Set(['.js', '.jsx', '.ts', '.tsx']);
const IGNORED_DIRS = new Set(['node_modules', 'dist', '.git', 'public']);

function parseArgs(argv: string[]): CliOptions {
  const opts: CliOptions = {
    write: false,
    force: false,
    keep: new Set(),
    keepPrefixes: [],
  };

  for (const arg of argv) {
    if (arg === '--write') opts.write = true;
    else if (arg === '--force') opts.force = true;
    else if (arg.startsWith('--keep=')) {
      const raw = arg.slice('--keep='.length).trim();
      if (raw) raw.split(',').map(s => s.trim()).filter(Boolean).forEach(k => opts.keep.add(k));
    } else if (arg.startsWith('--keep-prefix=')) {
      const raw = arg.slice('--keep-prefix='.length).trim();
      if (raw) opts.keepPrefixes.push(...raw.split(',').map(s => s.trim()).filter(Boolean));
    }
  }

  return opts;
}

function printUsage() {
  console.log('Usage: pnpm run i18n:prune [--write] [--force] [--keep=a,b] [--keep-prefix=p1,p2]');
  console.log('');
  console.log('Options:');
  console.log('  --write         Apply changes (default is dry-run)');
  console.log('  --force         Allow pruning when dynamic keys are detected');
  console.log('  --keep=keys     Comma-separated keys to keep');
  console.log('  --keep-prefix=  Comma-separated key prefixes to keep');
}

async function walkFiles(dir: string, files: string[] = []): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) continue;
      await walkFiles(path.join(dir, entry.name), files);
      continue;
    }
    const ext = path.extname(entry.name);
    if (SOURCE_EXTS.has(ext)) {
      files.push(path.join(dir, entry.name));
    }
  }
  return files;
}

function getScriptKind(filePath: string): ts.ScriptKind {
  const ext = path.extname(filePath);
  if (ext === '.tsx') return ts.ScriptKind.TSX;
  if (ext === '.ts') return ts.ScriptKind.TS;
  if (ext === '.jsx') return ts.ScriptKind.JSX;
  return ts.ScriptKind.JS;
}

function isLocalesAccess(expr: ts.Expression): boolean {
  if (ts.isPropertyAccessExpression(expr)) {
    return ts.isIdentifier(expr.expression) && expr.expression.text === 'locales';
  }
  if (ts.isElementAccessExpression(expr)) {
    return ts.isIdentifier(expr.expression) && expr.expression.text === 'locales';
  }
  return false;
}

function isLocaleObjectExpr(expr: ts.Expression): boolean {
  if (isLocalesAccess(expr)) return true;
  if (ts.isParenthesizedExpression(expr)) return isLocaleObjectExpr(expr.expression);
  if (ts.isBinaryExpression(expr)) {
    const op = expr.operatorToken.kind;
    if (op === ts.SyntaxKind.BarBarToken || op === ts.SyntaxKind.QuestionQuestionToken) {
      return isLocaleObjectExpr(expr.left) || isLocaleObjectExpr(expr.right);
    }
  }
  return false;
}

function isTCallExpression(expr: ts.Expression): boolean {
  if (ts.isIdentifier(expr)) return expr.text === 't';
  if (ts.isPropertyAccessExpression(expr)) return expr.name.text === 't';
  if (ts.isElementAccessExpression(expr)) {
    return ts.isStringLiteral(expr.argumentExpression) && expr.argumentExpression.text === 't';
  }
  return false;
}

function getLiteralKey(node: ts.Expression): string | null {
  if (ts.isStringLiteral(node)) return node.text;
  if (ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  return null;
}

function collectUsedKeysFromFile(filePath: string, sourceText: string, usedKeys: Set<string>, dynamicUsages: DynamicUsage[]) {
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    getScriptKind(filePath)
  );

  const localeVars = new Set<string>();

  const collectLocaleVars = (node: ts.Node) => {
    if (ts.isVariableDeclaration(node) && node.initializer && isLocaleObjectExpr(node.initializer)) {
      if (ts.isIdentifier(node.name)) {
        localeVars.add(node.name.text);
      } else if (ts.isObjectBindingPattern(node.name)) {
        for (const element of node.name.elements) {
          if (ts.isIdentifier(element.name)) usedKeys.add(element.name.text);
        }
      }
    }
    ts.forEachChild(node, collectLocaleVars);
  };

  collectLocaleVars(sourceFile);

  const collectKeys = (node: ts.Node) => {
    if (ts.isCallExpression(node) || (ts as any).isCallChain?.(node)) {
      const callExpr = node as ts.CallExpression;
      if (isTCallExpression(callExpr.expression) && callExpr.arguments.length > 0) {
        const arg = callExpr.arguments[0];
        const literal = getLiteralKey(arg);
        if (literal) {
          usedKeys.add(literal);
        } else {
          const { line } = sourceFile.getLineAndCharacterOfPosition(callExpr.pos);
          dynamicUsages.push({
            file: filePath,
            line: line + 1,
            text: callExpr.getText(sourceFile),
          });
        }
      }
    }

    if (ts.isPropertyAccessExpression(node)) {
      const base = node.expression;
      if (
        (ts.isIdentifier(base) && localeVars.has(base.text)) ||
        isLocaleObjectExpr(base)
      ) {
        usedKeys.add(node.name.text);
      }
    }

    if (ts.isElementAccessExpression(node)) {
      const base = node.expression;
      if (
        (ts.isIdentifier(base) && localeVars.has(base.text)) ||
        isLocaleObjectExpr(base)
      ) {
        const literal = node.argumentExpression ? getLiteralKey(node.argumentExpression) : null;
        if (literal) usedKeys.add(literal);
      }
    }

    ts.forEachChild(node, collectKeys);
  };

  collectKeys(sourceFile);
}

async function collectUsedKeys(srcDir: string) {
  const files = await walkFiles(srcDir);
  const usedKeys = new Set<string>();
  const dynamicUsages: DynamicUsage[] = [];

  await Promise.all(
    files.map(async (file) => {
      const text = await fs.readFile(file, 'utf8');
      collectUsedKeysFromFile(file, text, usedKeys, dynamicUsages);
    })
  );

  return { usedKeys, dynamicUsages };
}

async function pruneLocaleFile(filePath: string, usedKeys: Set<string>, opts: CliOptions) {
  const text = await fs.readFile(filePath, 'utf8');
  let data: Record<string, unknown>;
  try {
    data = JSON.parse(text) as Record<string, unknown>;
  } catch (error) {
    throw new Error(`Failed to parse JSON in ${filePath}: ${String(error)}`);
  }

  const keys = Object.keys(data);
  const unusedKeys: string[] = [];
  const pruned: Record<string, unknown> = {};

  for (const key of keys) {
    const keep =
      usedKeys.has(key) ||
      opts.keep.has(key) ||
      opts.keepPrefixes.some(prefix => key.startsWith(prefix));

    if (keep) {
      pruned[key] = data[key];
    } else {
      unusedKeys.push(key);
    }
  }

  return { pruned, unusedKeys };
}

function formatLocaleData(data: Record<string, unknown>) {
  const keys = Object.keys(data).sort((a, b) => a.localeCompare(b));
  const ordered: Record<string, unknown> = {};
  for (const key of keys) {
    ordered[key] = data[key];
  }
  return ordered;
}

async function writePrunedFile(filePath: string, data: Record<string, unknown>) {
  const output = JSON.stringify(formatLocaleData(data), null, 2) + '\n';
  await fs.writeFile(filePath, output, 'utf8');
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    printUsage();
    return;
  }

  if (args.length === 0) {
    printUsage();
    console.log('');
  }

  const opts = parseArgs(args);
  const root = process.cwd();
  const srcDir = path.join(root, 'src');
  const localesDir = path.join(srcDir, 'i18n');

  const localeFiles = (await fs.readdir(localesDir))
    .filter(name => /^locales\..+\.json$/.test(name))
    .map(name => path.join(localesDir, name))
    .filter(name => name !== path.join(localesDir, 'locales.json'));

  if (localeFiles.length === 0) {
    throw new Error('No locale files found. Expected src/i18n/locales.*.json');
  }

  const { usedKeys, dynamicUsages } = await collectUsedKeys(srcDir);

  if (dynamicUsages.length > 0 && opts.write && !opts.force) {
    console.error('Dynamic translation key usage found. Run with --force to prune anyway:');
    for (const usage of dynamicUsages) {
      console.error(`- ${usage.file}:${usage.line} ${usage.text}`);
    }
    process.exit(1);
  } else if (dynamicUsages.length > 0) {
    console.warn('Dynamic translation key usage found (review before pruning):');
    for (const usage of dynamicUsages) {
      console.warn(`- ${usage.file}:${usage.line} ${usage.text}`);
    }
  }

  let totalRemoved = 0;

  for (const file of localeFiles) {
    const { pruned, unusedKeys } = await pruneLocaleFile(file, usedKeys, opts);
    if (unusedKeys.length === 0) {
      if (opts.write) {
        await writePrunedFile(file, pruned);
      }
      console.log(`[keep] ${path.relative(root, file)} (0 unused keys)`);
      continue;
    }

    totalRemoved += unusedKeys.length;

    if (opts.write) {
      await writePrunedFile(file, pruned);
      console.log(`[pruned] ${path.relative(root, file)} (-${unusedKeys.length} keys)`);
    } else {
      console.log(`[report] ${path.relative(root, file)} (${unusedKeys.length} unused keys)`);
      console.log(`  Unused: ${unusedKeys.join(', ')}`);
    }
  }

  if (!opts.write) {
    console.log('');
    console.log('Dry run complete. Use --write to apply changes.');
  } else {
    console.log('');
    console.log(`Prune complete. Removed ${totalRemoved} keys.`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
