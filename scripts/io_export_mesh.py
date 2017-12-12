
bl_info = {
    "name": "Joe Mesh Export",
    "description": "mesh exporter",
    "author": "Joe Harding",
    "version": (1, 0),
    "blender": (2, 69, 0),
    "location": "File > Export",
    "warning": "",
    "wiki_url": "",
    "tracker_url": "",
    "category": "Import-Export"}

import bpy
import bmesh
import io
import os
import pprint
import mathutils

from bpy_extras.io_utils import ExportHelper


class JoeMesh(bpy.types.Operator, ExportHelper):

    filename_ext = ".json"

    bl_idname = "io.export_mesh"
    # unique identifier for buttons and menu items to reference.

    bl_label = "Mesh Export"
    # display name in the interface.

    bl_options = {'REGISTER', 'UNDO'}
    # enable undo for the operator.

    # execute() is called by blender when running the operator.
    def execute(self, context):
        print("### Mesh Export Script Start ###")

        bones = []
        indices = []
        verts = []
        normals = []
        uvs = []
        
        for obj in bpy.data.objects: 
            if obj.type == 'ARMATURE':
                for bone in obj.data.bones: 
                    bones.append({
                        'name': bone.name,
                        'head': list(bone.head_local),
                        'tail': list(bone.tail_local)
                        }) 

            else:
                bpy.ops.object.mode_set(mode='EDIT', toggle=False) 
                bm = bmesh.from_edit_mesh(obj.data)
                bmesh.ops.triangulate(bm, faces=bm.faces[:], quad_method=0, ngon_method=0)
                uv_layer = bm.loops.layers.uv.active
                if not uv_layer: 
                    self.report({'ERROR'}, 'please create a uv layer!')
                
                i = 0 # TODO - so is there any advantage to using these indices?
                for f in bm.faces:
                    for loop in f.loops:
                        indices.append(i)
                        verts.append(loop.vert.co)
                        normals.append(loop.vert.normal)
                        uvs.append(loop[uv_layer].uv)
                        i = i + 1



        self.write_file(bones, indices, verts, normals, uvs) 
        

        print("### Mesh Export Script End ###")
        # this lets blender know the operator finished successfully. 
        return {'FINISHED'}


    # print out the mesh data to petgame xml
    def write_file(self, bones, indices, verts, normals, uvs):
        filepath = self.filepath
        filepath = bpy.path.ensure_ext(filepath, self.filename_ext)

        print("Exporting to file \"%s\"..." % filepath)

        file = open(filepath, "w")
        fw = file.write

        fw('{"indices":')
        fw('[')
        for i, val in enumerate(indices):
            fw('{i}'.format(i=val))
            if i < len(indices) - 1:
                fw(',')

        fw(']')
        fw(', "bones":')
        fw('{')
        for i, v in enumerate(bones):
            fw('"{n}": {{ "head":{h},"tail":{t} }}'.format(n=v['name'], h=v['head'], t=v['tail']))
            if i < len(bones) - 1:
                fw(',')

        fw('}')
        fw(', "verts":')
        fw('[')
        for i, val in enumerate(verts):
            fw('{x},{y},{z}'.format(x=val.x, y=val.y, z=val.z))
            if i < len(verts) - 1:
                fw(',')

        fw(']')
        fw(', "normals":')
        fw('[')
        for i, val in enumerate(normals):
            fw('{x},{y},{z}'.format(x=val.x, y=val.y, z=val.z))
            if i < len(normals) - 1:
                fw(',')

        fw(']')
        fw(', "uvs":')
        fw('[')
        for i, val in enumerate(uvs):
            fw('{u},{v}'.format(u=round(val.x, 2), v=round(val.y, 2)))
            if i < len(uvs) - 1:
                fw(',')

        fw(']')
        fw('}')
        file.close()


    def invoke(self, context, event):
        wm = context.window_manager

        if True:
            # File selector
            wm.fileselect_add(self) # will run self.execute()
            return {'RUNNING_MODAL'}
        elif True:
            # search the enum
            wm.invoke_search_popup(self)
            return {'RUNNING_MODAL'}
        elif False:
            # Redo popup
            return wm.invoke_props_popup(self, event)
        elif False:
            return self.execute(context)


def menu_func_export(self, context):
    self.layout.operator(JoeMesh.bl_idname, text="Joe Mesh")


def register():
    bpy.utils.register_class(JoeMesh)
    bpy.types.INFO_MT_file_export.append(menu_func_export)


def unregister():
    bpy.utils.unregister_class(JoeMesh)
    bpy.types.INFO_MT_file_export.remove(menu_func_export)


# This allows you to run the script directly from blenders text editor
# to test the addon without having to install it.
if __name__ == '__main__':
    register()
