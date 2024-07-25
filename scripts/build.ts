

(async () => {
    // rmSync('dist', {
    //     force: true,
    //     recursive: true,
    // });

    const result = await Bun.build({
        entrypoints: ['./src/index.ts'],
        target: 'node',
        outdir: 'dist',});
    
    console.log(result);
    
})();