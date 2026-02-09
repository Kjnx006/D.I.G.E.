/**
 * i18n 一键翻译命令行工具
 *
 * 用法:
 *   pnpm run i18n:translate                                              检查同步状态
 *   pnpm run i18n:translate add <key> --zh "中文" --en "Eng" --ja "日" --ko "한"   新增/更新翻译
 *   pnpm run i18n:translate delete <key> [<key2> ...]                    删除 key
 *
 * 支持一次添加多个 key:
 *   pnpm run i18n:translate add k1 --zh "v1" --en "v1" --ja "v1" --ko "v1" \
 *                            add k2 --zh "v2" --en "v2" --ja "v2" --ko "v2"
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';

// ─── 配置 ────────────────────────────────────────────────────────────────────

const LOCALES_DIR = path.join(process.cwd(), 'src', 'i18n');
const SOURCE_LOCALE = 'zh';
const TARGET_LOCALES = ['en', 'ja', 'ko', 'ru', 'fr', 'de'];
const ALL_LOCALES = [SOURCE_LOCALE, ...TARGET_LOCALES];

// ─── 文件读写 ─────────────────────────────────────────────────────────────────

async function readLocaleFile(locale: string): Promise<Record<string, string>> {
  const filePath = path.join(LOCALES_DIR, `locales.${locale}.json`);
  const text = await fs.readFile(filePath, 'utf8');
  return JSON.parse(text) as Record<string, string>;
}

function sortKeys(data: Record<string, string>): Record<string, string> {
  const sorted: Record<string, string> = {};
  for (const key of Object.keys(data).sort((a, b) => a.localeCompare(b))) {
    sorted[key] = data[key];
  }
  return sorted;
}

async function writeLocaleFile(locale: string, data: Record<string, string>): Promise<void> {
  const filePath = path.join(LOCALES_DIR, `locales.${locale}.json`);
  const output = JSON.stringify(sortKeys(data), null, 2) + '\n';
  await fs.writeFile(filePath, output, 'utf8');
}

// ─── check ───────────────────────────────────────────────────────────────────

async function check(): Promise<boolean> {
  const source = await readLocaleFile(SOURCE_LOCALE);
  const sourceKeys = Object.keys(source).sort();
  let allSynced = true;

  console.log(`Source: ${SOURCE_LOCALE} (${sourceKeys.length} keys)\n`);

  for (const locale of TARGET_LOCALES) {
    const target = await readLocaleFile(locale);
    const targetKeySet = new Set(Object.keys(target));
    const sourceKeySet = new Set(sourceKeys);

    const missing = sourceKeys.filter(k => !targetKeySet.has(k));
    const extra = Object.keys(target).sort().filter(k => !sourceKeySet.has(k));

    if (missing.length === 0 && extra.length === 0) {
      console.log(`  ✓ ${locale} — synced (${targetKeySet.size} keys)`);
      continue;
    }

    allSynced = false;
    console.log(`  ✗ ${locale}:`);

    if (missing.length > 0) {
      console.log(`    Missing (${missing.length}):`);
      for (const key of missing) {
        console.log(`      + "${key}": "${source[key]}"`);
      }
    }

    if (extra.length > 0) {
      console.log(`    Extra (${extra.length}):`);
      for (const key of extra) {
        console.log(`      - "${key}"`);
      }
    }

    console.log('');
  }

  if (allSynced) {
    console.log('\n  All locale files are in sync.');
  }

  return allSynced;
}

// ─── add ─────────────────────────────────────────────────────────────────────

interface AddEntry {
  key: string;
  translations: Record<string, string>;
}

function parseAddArgs(args: string[]): AddEntry[] {
  const entries: AddEntry[] = [];
  let current: AddEntry | null = null;

  let i = 0;
  while (i < args.length) {
    const arg = args[i];

    if (arg === 'add') {
      // 保存上一组
      if (current) entries.push(current);
      i++;
      if (i >= args.length) {
        console.error('Error: "add" 后面需要跟 key 名称');
        process.exit(1);
      }
      current = { key: args[i], translations: {} };
      i++;
      continue;
    }

    // 解析语言标记 --zh, --en, --ja, --ko
    const localeMatch = arg.match(/^--(\w+)$/);
    if (localeMatch && ALL_LOCALES.includes(localeMatch[1])) {
      const locale = localeMatch[1];
      i++;
      if (i >= args.length) {
        console.error(`Error: --${locale} 后面需要跟翻译内容`);
        process.exit(1);
      }
      if (!current) {
        console.error(`Error: --${locale} 必须在 "add <key>" 之后使用`);
        process.exit(1);
      }
      current.translations[locale] = args[i];
      i++;
      continue;
    }

    // 跳过 "--" 分隔符
    if (arg === '--') {
      i++;
      continue;
    }

    console.error(`Error: 未知参数 "${arg}"`);
    process.exit(1);
  }

  // 保存最后一组
  if (current) entries.push(current);

  return entries;
}

async function addTranslations(args: string[]): Promise<void> {
  const entries = parseAddArgs(args);

  if (entries.length === 0) {
    console.error('Error: 没有需要添加的翻译');
    console.error('Usage: pnpm run i18n:translate add <key> --zh "中文" --en "English" --ja "日本語" --ko "한국어"');
    process.exit(1);
  }

  // 检查每个 entry 是否包含所有语言
  for (const entry of entries) {
    const missing = ALL_LOCALES.filter(l => !(l in entry.translations));
    if (missing.length > 0) {
      console.error(`Error: key "${entry.key}" 缺少以下语言的翻译: ${missing.map(l => `--${l}`).join(' ')}`);
      process.exit(1);
    }
  }

  // 读取所有 locale 文件
  const localeData: Record<string, Record<string, string>> = {};
  for (const locale of ALL_LOCALES) {
    localeData[locale] = await readLocaleFile(locale);
  }

  // 写入翻译
  console.log('');
  for (const entry of entries) {
    const isNew = localeData[SOURCE_LOCALE][entry.key] === undefined;
    console.log(`  ${isNew ? 'ADD' : 'UPDATE'} "${entry.key}":`);
    for (const locale of ALL_LOCALES) {
      localeData[locale][entry.key] = entry.translations[locale];
      console.log(`    [${locale}] ${entry.translations[locale]}`);
    }
  }

  // 写回文件
  for (const locale of ALL_LOCALES) {
    await writeLocaleFile(locale, localeData[locale]);
  }

  console.log(`\n  Done. ${entries.length} key(s) × ${ALL_LOCALES.length} locales.\n`);

  // 自动校验
  console.log('--- Sync check ---\n');
  await check();
}

// ─── delete ──────────────────────────────────────────────────────────────────

async function deleteKeys(keys: string[]): Promise<void> {
  if (keys.length === 0) {
    console.error('Error: 请指定要删除的 key');
    console.error('Usage: pnpm run i18n:translate delete <key1> [<key2> ...]');
    process.exit(1);
  }

  const localeData: Record<string, Record<string, string>> = {};
  for (const locale of ALL_LOCALES) {
    localeData[locale] = await readLocaleFile(locale);
  }

  console.log('');
  for (const key of keys) {
    let found = false;
    for (const locale of ALL_LOCALES) {
      if (key in localeData[locale]) {
        delete localeData[locale][key];
        found = true;
      }
    }
    console.log(`  ${found ? 'DELETE' : 'SKIP (not found)'} "${key}"`);
  }

  for (const locale of ALL_LOCALES) {
    await writeLocaleFile(locale, localeData[locale]);
  }

  console.log(`\n  Done.\n`);

  console.log('--- Sync check ---\n');
  await check();
}

// ─── 入口 ────────────────────────────────────────────────────────────────────

function printUsage(): void {
  console.log(`
i18n Translate Tool
===================

Commands:

  pnpm run i18n:translate
    检查各语言文件的同步状态

  pnpm run i18n:translate add <key> --zh "中文" --en "English" --ja "日本語" --ko "한국어"
    新增或更新一个翻译 key（必须提供全部 4 种语言）

  pnpm run i18n:translate add <k1> --zh "..." --en "..." --ja "..." --ko "..." \\
                           add <k2> --zh "..." --en "..." --ja "..." --ko "..."
    一次新增多个翻译 key

  pnpm run i18n:translate delete <key> [<key2> ...]
    从所有语言文件中删除指定 key

Examples:

  pnpm run i18n:translate add helloWorld --zh "你好世界" --en "Hello World" --ja "ハローワールド" --ko "헬로 월드"

  pnpm run i18n:translate add yes --zh "是" --en "Yes" --ja "はい" --ko "예" \\
                           add no  --zh "否" --en "No"  --ja "いいえ" --ko "아니오"

  pnpm run i18n:translate delete obsoleteKey anotherOldKey
`);
}

async function main(): Promise<void> {
  // 过滤掉 pnpm 传递的 "--" 分隔符
  const raw = process.argv.slice(2);
  const args = raw[0] === '--' ? raw.slice(1) : raw;

  if (args.includes('--help') || args.includes('-h')) {
    printUsage();
    return;
  }

  if (args.length === 0) {
    await check();
    return;
  }

  const command = args[0];

  if (command === 'add') {
    await addTranslations(args);
    return;
  }

  if (command === 'delete') {
    const keys = args.slice(1).filter(a => a !== '--');
    await deleteKeys(keys);
    return;
  }

  console.error(`Error: 未知命令 "${command}"`);
  printUsage();
  process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
