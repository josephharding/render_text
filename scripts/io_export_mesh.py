
bl_info = {
    "name": "WebGL Mesh Export",
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


class WebGLMesh(bpy.types.Operator, ExportHelper):

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

        if not 'working_scene' in bpy.data.scenes:
            print("ERROR: you must have scene 'working_scene' set in your project")
            return {'CANCELLED'}

        # remove old export
        self.clear_old_export()

        # clone working scene into export scene
        self.clone_working_scene()

        bones = []
        indices = []
        verts = []
        normals = []
        uvs = []
      
        bpy.ops.object.select_all(action='DESELECT')
       
        print("scene I'm in:", bpy.context.screen.scene) 
        for obj in bpy.context.scene.objects.data.objects: 
            print("info: exporting object:", obj.name)
            if obj.type == 'ARMATURE':
                for bone in obj.data.bones: 
                    bones.append({
                        'name': bone.name,
                        'head': list(bone.head_local),
                        'tail': list(bone.tail_local)
                        }) 

            else:
                obj.select = True
                bpy.context.scene.objects.active = obj
                
                print("****MODE A:", bpy.context.mode) 
                bpy.ops.object.mode_set(mode='EDIT', toggle=False) 
                print("****MODE B:", bpy.context.mode) 
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


    def clone_working_scene(self):
        # switch back to working scene¬
        bpy.context.screen.scene = bpy.data.scenes['working_scene']
        bpy.context.scene.update()
        
        copy_list = []
        for obj in bpy.context.scene.objects:
            if obj.type == 'MESH':
                data_copy = obj.data.copy()
                obj_copy = obj.copy()
                obj_copy.data = data_copy
                copy_list.append(obj_copy)

        print("copying objects from current scene...")
        print(copy_list)

        bpy.ops.scene.new()
        bpy.context.scene.name = 'export_scene'

        for copy in copy_list:
            bpy.data.scenes['export_scene'].objects.link(copy)

        bpy.context.screen.scene = bpy.data.scenes['working_scene']
        bpy.context.scene.update()

        # join all the objects in the export scene
        bpy.ops.object.select_all(action='DESELECT')
        bpy.context.scene.objects.active = None

        bpy.context.screen.scene = bpy.data.scenes['export_scene']
        bpy.context.scene.update()

        for obj in bpy.data.scenes['export_scene'].objects:
            print("selecting object to join...")
            print(obj)
            obj.data.name = "new"
            obj.select = True
            bpy.context.scene.objects.active = obj

        bpy.ops.object.join()

        # setting the name of an object
        bpy.context.object.name = 'export_object'

        # setting the name of the data of an object
        bpy.context.object.data.name = 'export_data'


    def clear_old_export(self):
        # start off by deselecting everything
        bpy.ops.object.mode_set(mode='OBJECT')
        bpy.ops.object.select_all(action='DESELECT')
        bpy.context.scene.objects.active = None

        # clean up any already existing export scenes
        if 'export_scene' in bpy.data.scenes:
            for obj in bpy.data.scenes['export_scene'].objects:
                obj.select = True

            bpy.ops.object.delete()

            print("removing already existing 'export_scene'...")
            bpy.context.screen.scene = bpy.data.scenes['export_scene']
            bpy.ops.scene.delete()

        if 'export_object' in bpy.data.objects:
            print("cleaning up already existing 'export_object' object")
            bpy.data.objects['export_object'].data = None
            bpy.data.objects.remove(bpy.data.objects['export_object'])

        if 'export_data' in bpy.data.meshes:
            print("cleaning up already existing 'export_data' mesh")
            if bpy.data.meshes['export_data'].users != 0:
                print("ERROR: previous export data still exists")
            else:
                bpy.data.meshes.remove(bpy.data.meshes['export_data'])



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
    self.layout.operator(WebGLMesh.bl_idname, text="Joe Mesh")


def register():
    bpy.utils.register_class(WebGLMesh)
    bpy.types.INFO_MT_file_export.append(menu_func_export)


def unregister():
    bpy.utils.unregister_class(WebGLMesh)
    bpy.types.INFO_MT_file_export.remove(menu_func_export)


# This allows you to run the script directly from blenders text editor
# to test the addon without having to install it.
if __name__ == '__main__':
    register()
