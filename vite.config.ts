import { defineConfig } from 'vite';
import { exec } from 'child_process';

export default defineConfig({
  base: '/nautilus/',
  plugins: [
    {
      name: 'watch-boat-blend',
      configureServer(server) {
        server.watcher.add('boat.blend');
        server.watcher.on('change', (path) => {
          if (path.endsWith('boat.blend')) {
            exec('blender --background --python blender_export.py', (err, stdout, stderr) => {
              if (err) {
                console.error(`Error: ${stderr}`);
              } else {
                console.log(`Output: ${stdout}`);
                server.ws.send({
                  type: 'full-reload',
                  path: '*'
                });
              }
            });
          }
        });
      }
    }
  ]
});
