import { spawnSync } from 'node:child_process';
import { readPrivateCredentials } from './lib/alkorea-client.mjs';
const credentials = await readPrivateCredentials();
for (const [name, value] of [['ALKOREA_USERNAME', credentials.username], ['ALKOREA_PASSWORD', credentials.password]]) {
  const result = spawnSync('npx.cmd', ['vercel', 'env', 'add', name, 'production', '--sensitive', '--yes', '--scope', 'samievghayrats-projects'], {
    input: value, encoding: 'utf8', shell: true,
  });
  // Suppress CLI output because interactive prompts can include secret values.
  if (result.status !== 0) throw new Error(`${name} could not be configured; hosting response suppressed`);
  console.log(`${name}: server-only secret configured`);
}
process.exit(0);
