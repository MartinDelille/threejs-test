import { defineConfig } from "vite";
import { execSync } from "child_process";

function runBlenderScript() {
  try {
    execSync("blender --version");
  } catch (error) {
    console.error("Blender is not installed or not found in PATH.", error);
    process.exit(1);
  }

  try {
    execSync("blender --background --python blender_export.py -- boat.blend public/boat.glb", { stdio: "inherit" });
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
}

export default defineConfig(() => {
  runBlenderScript();

  return {
    base: "/nautilus/",
    build: {
      outDir: "dist",
      assetsDir: "assets"
    },
    server: {
      port: 8192,
    },
    async buildStart() {
      runBlenderScript();
    },
    plugins: [
      {
        name: "watch-boat-blend",
        configureServer(server) {
          const filesToWatch = ["boat.blend", "blender_export.py"];
          for (const file of filesToWatch) {
            server.watcher.add(file);
          }

          server.watcher.on("change", (path) => {
            if (filesToWatch.includes(path)) {
              runBlenderScript();
              // Trigger a full page reload
              server.ws.send({
                type: "full-reload",
                path: "*"
              });
            }
          });
        }
      }
    ]
  };
});
