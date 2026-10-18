// @vitest-environment node
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { expect, test } from 'vitest';
import { tokens } from './tokens';

const sourceDir = fileURLToPath(new URL('../', import.meta.url));
const tokenCss = readFileSync(
  join(sourceDir, 'design-system/tokens.css'),
  'utf8',
);
const defined = new Set(
  [...tokenCss.matchAll(/(--[\w-]+)\s*:/g)].map((match) => match[1]),
);

test('the TypeScript token API references exactly the canonical CSS tokens', () => {
  const references = Object.values(tokens).flatMap((group) =>
    Object.values(group),
  );
  const exported = new Set(references.map((value) => value.slice(4, -1)));
  expect(exported).toEqual(defined);
});

test('all styles resolve their variables from tokens or documented runtime measurements', () => {
  const runtimeVariables = new Set(['--app-header-height', '--icon-size']);
  const files = readdirSync(sourceDir, {
    recursive: true,
    encoding: 'utf8',
  }).filter((file) => file.endsWith('.css'));
  for (const file of files) {
    const css = readFileSync(join(sourceDir, file), 'utf8');
    for (const match of css.matchAll(/var\((--[\w-]+)/g)) {
      expect(
        defined.has(match[1]) || runtimeVariables.has(match[1] ?? ''),
        `${file}: ${match[1]}`,
      ).toBe(true);
    }
  }
});
