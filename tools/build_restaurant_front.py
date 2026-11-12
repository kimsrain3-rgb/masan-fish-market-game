"""Build photo-inspired outdoor seafood props for the existing restaurant GLB.

Run with Blender 4.x:
blender -b --factory-startup --python game_web/tools/build_restaurant_front.py
The exported model is placed at the origin of bada-restaurant.glb in Three.js.
"""

import math
import random
from pathlib import Path

import bpy
from mathutils import Vector


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "dist" / "assets" / "restaurant-front.glb"
randomizer = random.Random(20261112)

bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)


def material(name, color, roughness=0.52, metallic=0):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (*color, 1)
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    return mat


red = material("Worn red plastic", (0.47, 0.055, 0.052), .4)
red_edge = material("Red edge", (0.69, 0.11, 0.10), .34)
blue = material("Bright blue basin", (0.015, 0.28, 0.69), .34)
deep_blue = material("Cobalt sign", (0.015, 0.16, 0.49), .4)
foam = material("Used white foam", (0.73, 0.75, 0.70), .85)
foam_edge = material("Foam worn edge", (0.60, 0.63, 0.60), .85)
steel = material("Dull steel", (0.44, 0.49, 0.48), .29, .48)
water = material("Dark moving water", (0.025, 0.075, 0.073), .18, .12)
wet = material("Wet pavement", (0.16, 0.23, 0.23), .18, .10)
shell_black = material("Mussels charcoal", (0.048, 0.063, 0.066), .32)
shell_green = material("Mussels olive", (0.095, 0.13, 0.10), .44)
shell_brown = material("Shellfish brown", (0.23, 0.17, 0.115), .55)
shell_tan = material("Clams beige", (0.45, 0.35, 0.23), .54)
squirt = material("Sea squirts orange", (0.55, 0.22, 0.065), .45)
squirt_tip = material("Sea squirts dark tip", (0.28, 0.13, 0.06), .5)
pipe_white = material("Water pipe", (0.76, 0.79, 0.73), .45)
hose_blue = material("Blue rubber hose", (0.018, 0.19, 0.48), .62)


def finish(obj, name, mat):
    obj.name = name
    obj.data.materials.append(mat)
    return obj


def cube(name, location, dimensions, mat):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    obj = finish(bpy.context.object, name, mat)
    obj.dimensions = dimensions
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    return obj


def sphere(name, location, dimensions, mat, segments=8, rings=4):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings, radius=1, location=location)
    obj = finish(bpy.context.object, name, mat)
    obj.dimensions = dimensions
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    return obj


def cylinder(name, location, radius, depth, mat, vertices=18):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=location)
    return finish(bpy.context.object, name, mat)


def ring(name, location, major, minor, mat, segments=24):
    bpy.ops.mesh.primitive_torus_add(major_segments=segments, minor_segments=5,
                                     location=location, major_radius=major, minor_radius=minor)
    return finish(bpy.context.object, name, mat)


def tube(name, points, radius, mat):
    curve = bpy.data.curves.new(name, "CURVE")
    curve.dimensions = "3D"
    curve.resolution_u = 12
    curve.bevel_depth = radius
    curve.bevel_resolution = 2
    spline = curve.splines.new("BEZIER")
    spline.bezier_points.add(len(points) - 1)
    for point, coordinate in zip(spline.bezier_points, points):
        point.co = coordinate
        point.handle_left_type = "AUTO"
        point.handle_right_type = "AUTO"
    obj = bpy.data.objects.new(name, curve)
    bpy.context.scene.collection.objects.link(obj)
    obj.data.materials.append(mat)
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.convert(target="MESH")
    return bpy.context.object


def seafood(name, center, count, mat, size, spread):
    for index in range(count):
        x = center[0] + randomizer.uniform(-spread[0], spread[0])
        y = center[1] + randomizer.uniform(-spread[1], spread[1])
        z = center[2] + randomizer.uniform(-.01, .07)
        obj = sphere(f"{name} {index:02}", (x, y, z),
                     (size[0] * randomizer.uniform(.75, 1.3),
                      size[1] * randomizer.uniform(.75, 1.3),
                      size[2] * randomizer.uniform(.7, 1.35)), mat)
        obj.rotation_euler[2] = randomizer.random() * math.tau


# A low red trough sits in front of the existing three blue tanks. Its four
# compartments echo the reference photo without covering the original signs.
start_x, end_x = -5.15, 2.15
mid_x = (start_x + end_x) / 2
length = end_x - start_x
cube("Front trough base", (mid_x, -2.95, 1.16), (length, 1.27, .14), red)
cube("Trough dark water", (mid_x, -2.95, 1.43), (length - .18, 1.06, .025), water)
for y in (-3.59, -2.32):
    cube("Front trough long wall", (mid_x, y, 1.38), (length, .085, .43), red)
for x in (start_x, end_x):
    cube("Front trough end wall", (x, -2.95, 1.38), (.09, 1.29, .43), red)
for x in (-3.325, -1.50, .325):
    cube("Front trough divider", (x, -2.95, 1.38), (.105, 1.20, .43), red_edge)
cube("Blue market name strip", (mid_x, -3.647, 1.02), (length - .2, .025, .23), deep_blue)
for x in (-5.15, -3.325, -1.50, .325, 2.15):
    cube("White trough lip", (x, -2.95, 1.62), (.07, 1.35, .045), pipe_white)
for y in (-3.62, -2.30):
    cube("White trough rail", (mid_x, y, 1.63), (length + .15, .045, .045), pipe_white)

for center_x, mat, count, size in [
    (-4.23, shell_brown, 22, (.22, .14, .13)),
    (-2.41, shell_tan, 25, (.19, .14, .105)),
    (-.58, shell_black, 29, (.23, .12, .10)),
    (1.24, squirt, 22, (.20, .18, .22)),
]:
    seafood("Trough seafood", (center_x, -2.96, 1.51), count, mat, size, (.69, .40))
    if mat == squirt:
        seafood("Squirt dark tips", (center_x, -2.96, 1.62), 12, squirt_tip,
                (.065, .06, .04), (.62, .35))


# Two large blue working basins on the back ledge.
for index, x in enumerate((-4.65, -2.85), 1):
    bpy.ops.mesh.primitive_cone_add(vertices=24, radius1=.49, radius2=.62,
                                    depth=.36, location=(x, -1.51, 1.86))
    finish(bpy.context.object, f"Blue working basin {index}", blue)
    cylinder("Basin water", (x, -1.51, 2.035), .54, .014, water)
    ring("Basin rolled rim", (x, -1.51, 2.045), .585, .042, blue)


# Scuffed foam crates and a red tray add a lower, irregular foreground layer.
def foam_box(name, x, y, z, width, depth):
    cube(name + " base", (x, y, z + .035), (width, depth, .07), foam)
    for sign in (-1, 1):
        cube(name + " long side", (x, y + sign * (depth / 2 - .055), z + .24),
             (width, .09, .43), foam)
        cube(name + " short side", (x + sign * (width / 2 - .055), y, z + .24),
             (.09, depth, .43), foam)
    cube(name + " inside", (x, y, z + .078), (width - .18, depth - .18, .018), foam_edge)


foam_box("Center foam box", -.25, -5.03, .015, 1.42, .96)
foam_box("Stacked foam box", -.23, -4.96, -.40, 1.35, .93)
cube("Foam box blue mark", (-.25, -5.54, .14), (1.05, .013, .13), blue)

# A partly filled lower basin of dark mussels by the display table.
bpy.ops.mesh.primitive_cone_add(vertices=20, radius1=.49, radius2=.59,
                                depth=.31, location=(-5.05, -5.04, .20))
finish(bpy.context.object, "Lower mussel basin", red)
cylinder("Lower basin water", (-5.05, -5.04, .355), .50, .013, water)
ring("Lower basin rim", (-5.05, -5.04, .36), .56, .035, red_edge)
seafood("Lower basin mussels", (-5.05, -5.04, .39), 24, shell_black,
        (.22, .095, .08), (.35, .34))

tube("Coiled blue hose", [(2.05, -2.45, 1.81), (2.54, -3.18, 1.50),
                          (2.7, -4.15, .69), (2.91, -4.99, .11),
                          (3.45, -5.16, .08), (3.2, -5.52, .09)], .052, hose_blue)
for x, y, width, depth in [(-2.8, -5.05, 1.1, .42), (2.45, -5.16, .92, .35)]:
    sphere("Wet floor patch", (x, y, .045), (width, depth, .013), wet, 20, 6)
    sphere("Puddle highlight", (x - .13, y - .08, .055),
           (width * .46, depth * .22, .006), steel, 16, 4)


# Merge same-material meshes to keep the added frontage inexpensive on phones.
buckets = {}
for obj in list(bpy.context.scene.objects):
    if obj.type == "MESH" and obj.data.materials:
        buckets.setdefault(obj.data.materials[0].name, []).append(obj)
for objects in buckets.values():
    if len(objects) < 2:
        continue
    bpy.ops.object.select_all(action="DESELECT")
    for obj in objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]
    bpy.ops.object.join()

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
bpy.ops.export_scene.gltf(filepath=str(OUTPUT), export_format="GLB", export_apply=True)
print(f"Exported {OUTPUT} ({OUTPUT.stat().st_size} bytes)")
