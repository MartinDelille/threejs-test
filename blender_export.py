import bpy

# Load the .blend file
bpy.ops.wm.open_mainfile(filepath="boat.blend")

# Export to .glb
bpy.ops.export_scene.gltf(filepath="public/boat.glb", export_format="GLB")
