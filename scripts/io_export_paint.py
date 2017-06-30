
bl_info = {
    "name": "Joe Paint Export",
    "description": "paint exporter",
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


class JoePaint(bpy.types.Operator, ExportHelper):

    filename_ext = ".json"

    bl_idname = "io.export_paint"
    # unique identifier for buttons and menu items to reference.

    bl_label = "Paint Export"
    # display name in the interface.

    bl_options = {'REGISTER', 'UNDO'}
    # enable undo for the operator.

    # execute() is called by blender when running the operator.
    def execute(self, context):
        print("### Paint Export Script Start ###")

        if len(bpy.context.selected_objects) > 0:
            active_data = bpy.context.selected_objects[0].data

            indices = []
            verts = []
            normals = []
            colors = []


            bpy.ops.object.mode_set(mode='EDIT', toggle=False)
            bm = bmesh.from_edit_mesh(active_data)

            # this seems to only work in vertex paint mode, also seems to work in object mode
            # though you may need to enable the Option -> Vertex Color Paint
            #active_data.vertex_colors.active.data[5].color
            
            bmesh.ops.triangulate(bm, faces=bm.faces[:], quad_method=0, ngon_method=0)
 
            i = 0 # TODO - so is there any advantage to using these indices?
            for f in bm.faces:
                for loop in f.loops:
                    indices.append(i)
                    verts.append(loop.vert.co)
                    normals.append(loop.vert.normal)
                    #colors.append((0, 0, 0))
                    i = i + 1
            
            bpy.ops.object.mode_set(mode='OBJECT', toggle=False)
            for data in active_data.vertex_colors.active.data:
                colors.append(data.color)
 
            self.write_file(indices, verts, normals, colors) 
        
        else:
            self.report({'ERROR'}, 'please select an oject to export')

        print("### Mesh Export Script End ###")
        # this lets blender know the operator finished successfully. 
        return {'FINISHED'}


    # print out the mesh data to petgame xml
    def write_file(self, indices, verts, normals, colors):
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
        fw(', "colors":')
        fw('[')
        for i, val in enumerate(colors):
            fw('{r},{g},{b}'.format(r=round(val[0], 2), g=round(val[1], 2), b=round(val[2], 2)))
            if i < len(colors) - 1:
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
    self.layout.operator(JoePaint.bl_idname, text="Joe Paint")


def register():
    bpy.utils.register_class(JoePaint)
    bpy.types.INFO_MT_file_export.append(menu_func_export)


def unregister():
    bpy.utils.unregister_class(JoePain)
    bpy.types.INFO_MT_file_export.remove(menu_func_export)


# This allows you to run the script directly from blenders text editor
# to test the addon without having to install it.
if __name__ == '__main__':
    register()
