
import { defineConfig } from 'vite';
import { exec } from 'child_process';
import path from 'path';

function runBlenderScript() {
  exec('blender --background --python blender_export.py -- boat.blend dist/assets/boat.glb', (err, stdout, stderr) => {
    console.log('\nRonning Blender script', stdout);
    if (err) {
      console.error(`Error: ${stderr}`);
    } else {
      console.log(`Output: ${stdout}`);
    }
  });
}

export default defineConfig(({ command }) => {
  const isBuild = command === 'build';

  console.log(`Running in ${isBuild ? 'build' : 'dev'} mode`);
  if (isBuild) {
    // Run the script once during the build
    runBlenderScript();
  }

  return {
    base: '/nautilus/',
    build: {
      outDir: 'dist',
      assetsDir: 'assets'
    },
    plugins: [
      {
        name: 'watch-boat-blend',
        configureServer(server) {
          if (!isBuild) {
            server.watcher.add('boat.blend');
            server.watcher.add('blender_export.py');
            server.watcher.on('change', (path) => {
              runBlenderScript();
              // Trigger a full page reload
              server.ws.send({
                type: 'full-reload',
                path: '*'
              });
            });
          }
        }
      }
    ]
  };
});

