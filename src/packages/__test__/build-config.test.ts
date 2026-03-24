import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import tsupConfig from '../../../tsup.config';

describe('build config', () => {
  it('does not emit a dedicated runtime entry for types', () => {
    const entry = tsupConfig.entry as Record<string, string>;

    expect(entry).not.toHaveProperty('types');
  });

  it('keeps ./types as strict type-only subpath export', () => {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(
      fs.readFileSync(packageJsonPath, 'utf8')
    ) as {
      exports: Record<string, Record<string, string | null>>;
    };

    expect(packageJson.exports['./types']).toEqual({
      types: './dist/types.d.ts',
      default: null,
    });
  });
});
