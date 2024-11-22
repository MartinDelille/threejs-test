import sys

import bpy

# Load the .blend file
bpy.ops.wm.open_mainfile(filepath=sys.argv[-2])

# Export to .glb
bpy.ops.export_scene.gltf(filepath=sys.argv[-1], export_format="GLB")
