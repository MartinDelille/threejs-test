import sys

import bpy

# Load the .blend file
bpy.ops.wm.open_mainfile(filepath=sys.argv[-2])

# Get the object by name
obj = bpy.data.objects["Coque"]

# Add a mirror modifier
mirror_modifier = obj.modifiers.new(name="Mirror", type="MIRROR")

# Apply the modifier
bpy.context.view_layer.objects.active = obj
bpy.ops.object.modifier_apply(modifier=mirror_modifier.name)

# Export to .glb
bpy.ops.export_scene.gltf(filepath=sys.argv[-1], export_format="GLB")
