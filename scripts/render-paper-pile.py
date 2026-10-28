import argparse
import math
import random
import sys
from pathlib import Path

import bpy
from mathutils import Vector


parser = argparse.ArgumentParser()
parser.add_argument("--output", default="assets/renders")
parser.add_argument("--width", type=int, default=2400)
parser.add_argument("--samples", type=int, default=192)
parser.add_argument("--theme", choices=("light", "dark", "both"), default="both")
parser.add_argument("--save-scene", action="store_true")
args = parser.parse_args(sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else [])
output = Path(args.output).resolve()
output.mkdir(parents=True, exist_ok=True)
rng = random.Random(6281)

bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)
scene = bpy.context.scene
scene.render.engine = "CYCLES"
scene.cycles.samples = args.samples
scene.cycles.use_denoising = True
scene.cycles.adaptive_threshold = 0.012
scene.cycles.max_bounces = 8
scene.cycles.diffuse_bounces = 5
scene.render.resolution_x = args.width
scene.render.resolution_y = round(args.width * 860 / 2400)
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = "PNG"
scene.render.image_settings.color_mode = "RGBA"
scene.render.film_transparent = True
scene.view_settings.view_transform = "AgX"
scene.view_settings.look = "AgX - Medium High Contrast"
scene.view_settings.exposure = -0.15
scene.render.image_settings.color_depth = "8"

try:
    preferences = bpy.context.preferences.addons["cycles"].preferences
    preferences.compute_device_type = "METAL"
    preferences.get_devices()
    for device in preferences.devices:
        device.use = device.type == "METAL"
    if any(device.type == "METAL" for device in preferences.devices):
        scene.cycles.device = "GPU"
except (TypeError, RuntimeError):
    pass


def paper_material(name, color):
    material = bpy.data.materials.new(name)
    material.use_nodes = True
    nodes = material.node_tree.nodes
    links = material.node_tree.links
    shader = nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value = (*color, 1)
    shader.inputs["Roughness"].default_value = 0.86
    shader.inputs["Specular IOR Level"].default_value = 0.22
    shader.inputs["Subsurface Weight"].default_value = 0.035
    shader.inputs["Subsurface Radius"].default_value = (0.1, 0.07, 0.04)
    texture = nodes.new("ShaderNodeTexNoise")
    texture.inputs["Scale"].default_value = 520
    texture.inputs["Detail"].default_value = 2
    bump = nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.16
    bump.inputs["Distance"].default_value = 0.008
    links.new(texture.outputs["Fac"], bump.inputs["Height"])
    links.new(bump.outputs["Normal"], shader.inputs["Normal"])
    return material


papers = [
    paper_material("warm white cotton paper", (0.78, 0.755, 0.70)),
    paper_material("bright white letter paper", (0.89, 0.885, 0.86)),
    paper_material("natural stationery", (0.71, 0.69, 0.64)),
    paper_material("cool white paper", (0.79, 0.805, 0.80)),
    paper_material("ivory paper", (0.82, 0.78, 0.67)),
]
ink = papers[1].copy()
ink.name = "faint fragments of printed correspondence"
texture = ink.node_tree.nodes.new("ShaderNodeTexImage")
texture.image = bpy.data.images.load(str(Path(__file__).resolve().parents[1] / "assets/source/paper-ink.png"))
texture.extension = "REPEAT"
ink.node_tree.links.new(texture.outputs["Color"], ink.node_tree.nodes.get("Principled BSDF").inputs["Base Color"])
papers.append(ink)

vertices = []
faces = []
face_materials = []
vertex_uvs = []


def mound(x, y, height):
    radius = (x / 5.45) ** 2 + (y / 2.05) ** 2
    return height * max(0, 1 - radius) ** 1.5


def strip(index, count):
    progress = index / count
    scattered = index < 85
    if scattered:
        angle = rng.uniform(0, math.tau)
        radius = rng.uniform(0.7, 1)
        x = math.cos(angle) * 5.6 * radius
        y = math.sin(angle) * 2.4 * radius
        height = 0
    else:
        radius = math.sqrt(rng.random())
        angle = rng.uniform(0, math.tau)
        x = math.cos(angle) * 4.9 * radius
        y = math.sin(angle) * 1.7 * radius
        height = 0.12 + progress * 1.3
    orientation = rng.uniform(0, math.tau)
    length = rng.uniform(1.1, 3.3) * (0.7 if scattered else 1)
    width = rng.uniform(0.085, 0.15)
    curl = rng.random() < 0.07 and not scattered
    bend = rng.uniform(-0.6, 0.6)
    wave = rng.uniform(0.03, 0.16) * (0.3 if scattered else 1)
    phase = rng.uniform(0, math.tau)
    twist = rng.uniform(-1.15, 1.15)
    tip = rng.uniform(0.02, 0.22)
    crease = rng.uniform(0.2, 0.8)
    fold = rng.uniform(0.0, 0.22)
    paper = rng.choices(range(len(papers)), [23, 32, 7, 15, 3, 20])[0]
    uv_start = rng.uniform(0.08, 0.9)
    uv_y = rng.uniform(0, 0.5)
    folded = rng.random() < 0.5 and not curl
    segments = 52
    points = []
    for step in range(segments + 1):
        t = step / segments
        u = t - 0.5
        if curl:
            arc = (t - 0.5) * 5.3
            dx = math.sin(arc) * length / 5.3
            dy = bend * u * u + 0.13 * math.sin(t * math.pi)
            dz = (1 - math.cos(arc)) * length / 6.1
        else:
            dx = u * length
            dy = bend * (1 - abs(u * 2)) if folded else bend * math.sin(t * math.pi)
            dz = wave * abs(t - crease) if folded else wave * (math.sin(t * math.tau * 1.35 + phase) + 1)
            dz += tip * (abs(u) * 2) ** 6
            dz += fold * max(0, 1 - abs(t - crease) * 5)
        px = x + dx * math.cos(orientation) - dy * math.sin(orientation)
        py = y + dx * math.sin(orientation) + dy * math.cos(orientation)
        pz = 0.018 + mound(px, py, height) + dz
        points.append(Vector((px, py, pz)))
    first = len(vertices)
    for step, point in enumerate(points):
        t = step / segments
        tangent = (points[min(step + 1, segments)] - points[max(step - 1, 0)]).normalized()
        sideways = Vector((-tangent.y, tangent.x, 0)).normalized()
        roll = twist * math.sin(t * math.tau + phase)
        sideways = sideways * math.cos(roll) + Vector((0, 0, math.sin(roll)))
        for edge in (-1, 0, 1):
            rough_edge = rng.uniform(-0.0007, 0.0007) if edge else 0
            vertex = point + sideways * (width / 2 * edge + rough_edge)
            vertex.z += 0.005 * (1 - edge * edge) * math.sin(t * math.pi)
            vertices.append(tuple(vertex))
            vertex_uvs.append((uv_start + (edge + 1) * width * 0.07, uv_y + t * length * 0.24))
    for step in range(segments):
        for side in range(2):
            a = first + step * 3 + side
            faces.append((a, a + 3, a + 4, a + 1))
            face_materials.append(paper)


for index in range(900):
    strip(index, 900)

mesh = bpy.data.meshes.new("individual curved paper strips")
mesh.from_pydata(vertices, [], faces)
mesh.update()
pile = bpy.data.objects.new("shredded letters — 900 strips", mesh)
scene.collection.objects.link(pile)
for material in papers:
    mesh.materials.append(material)
for polygon, material in zip(mesh.polygons, face_materials):
    polygon.material_index = material
    polygon.use_smooth = True
uvs = mesh.uv_layers.new(name="shredded letter fragments")
for loop in mesh.loops:
    uvs.data[loop.index].uv = vertex_uvs[loop.vertex_index]
thickness = pile.modifiers.new("paper edge thickness", "SOLIDIFY")
thickness.thickness = 0.0025
thickness.offset = 0

bpy.ops.mesh.primitive_plane_add(size=200, location=(0, 0, 0))
floor = bpy.context.object
floor.name = "invisible studio floor with contact shadows"
floor.is_shadow_catcher = True
floor_material = paper_material("studio floor", (0.8, 0.8, 0.8))
floor.data.materials.append(floor_material)


def point_at(obj, target):
    obj.rotation_euler = (Vector(target) - obj.location).to_track_quat("-Z", "Y").to_euler()


bpy.ops.object.camera_add(location=(0, -16, 9.7))
camera = bpy.context.object
camera.name = "low studio product camera"
point_at(camera, (0, 0, 0.35))
camera.data.type = "ORTHO"
camera.data.ortho_scale = 14.5
camera.data.lens = 55
scene.camera = camera


def area_light(name, location, power, size, color):
    data = bpy.data.lights.new(name, "AREA")
    data.energy = power
    data.shape = "DISK"
    data.size = size
    data.color = color
    obj = bpy.data.objects.new(name, data)
    scene.collection.objects.link(obj)
    obj.location = location
    point_at(obj, (0, 0, 0.4))
    return data


key = area_light("large softbox upper left", (-3.5, -4, 8), 1800, 6, (1, 0.96, 0.9))
fill = area_light("broad cool fill", (5, -1, 5), 850, 5, (0.88, 0.93, 1))
rim = area_light("back edge softbox", (0, 5, 6), 1500, 4, (1, 0.98, 0.94))
scene.world.use_nodes = True
background = scene.world.node_tree.nodes.get("Background")
background.inputs["Color"].default_value = (0.82, 0.86, 1, 1)

themes = ("light", "dark") if args.theme == "both" else (args.theme,)
for theme in themes:
    dark = theme == "dark"
    background.inputs["Strength"].default_value = 0.12 if dark else 0.3
    floor_material.node_tree.nodes.get("Principled BSDF").inputs["Base Color"].default_value = (
        (0.0065, 0.0065, 0.0065, 1) if dark else (0.8, 0.8, 0.8, 1)
    )
    key.energy = 1200 if dark else 1400
    fill.energy = 350 if dark else 450
    rim.energy = 1200 if dark else 900
    scene.render.filepath = str(output / f"paper-pile-{theme}.png")
    if args.save_scene:
        bpy.ops.file.pack_all()
        bpy.ops.wm.save_as_mainfile(filepath=str(output / f"paper-pile-{theme}.blend"), compress=True)
    bpy.ops.render.render(write_still=True)
