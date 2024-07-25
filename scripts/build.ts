import { rmSync } from 'fs';
import { glob } from 'glob';

(async () => {
  const startTime = performance.now();
  console.log('\x1b[32mCleaning dist directory\x1b[0m');
  rmSync('dist', {
    force: true,
    recursive: true,
  });

  console.log('\x1b[34mBuilding dist...\x1b[0m');
  const entryPoints = await glob('./src/**/*.ts');
  const result = await Bun.build({
    entrypoints: entryPoints,
    target: 'node',
    outdir: 'dist',
    external: ['sequelize', 'sqlite3'],
  });

  const endTime = performance.now();
  const executionTime = (endTime - startTime) / 1000;
  if (!result.success) {
    console.log(`\x1b[31mBuild Failed with execution time ${executionTime.toFixed(2)} s\x1b[0m`);
    for (const message of result.logs) {
      console.error(message);
    }
  } else {
    console.log(`\x1b[32mBuild Success with execution time ${executionTime.toFixed(2)} s\x1b[0m`);
  }
})();
