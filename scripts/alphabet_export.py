#!/usr/bin/env python

import string

from gimpfu import *


def write_uvs(path, origins, uvs):
    file_handle = open("{p}/alpha.json".format(p=path), "w")
    file_handle.write('{"origins": [')

    for idx, origin in enumerate(origins):
        file_handle.write("{x},{y}".format(x=origin[0], y=origin[1]))
        if idx != len(origins) - 1:
            file_handle.write(",")

    file_handle.write('],"uvs": [')
    for idx, uv in enumerate(uvs):
        file_handle.write("{val}".format(val=uv))
        if idx != len(uvs) - 1:
            file_handle.write(",")
    
    file_handle.write(']}')
    file_handle.close()


def create(font, color, size, texture_size, uv_map_path):

    img = gimp.Image(texture_size, texture_size, RGB)

    # Save the current foreground color:
    pdb.gimp_context_push()

    # Set the text color
    gimp.set_foreground(color)

    # so we move along by the width of each letter, keeping track of the maximum height for the next line
    letters = list(string.ascii_lowercase)

    uvs = []
    origins = []
    greatest_height = 0 
    x = 0
    y = 0
    for letter in letters:
        # Create a new text layer (-1 for the layer means create a new layer)
        layer = pdb.gimp_text_fontname(img, None, x, y, letter, 0, True, size, PIXELS, font)
        width, height, ascent, descent = pdb.gimp_text_get_extents_fontname(letter, size, PIXELS, font)
        
        origins.append((x, y + ascent))
        
        pdb.gimp_message("for character: {c} width: {w}".format(c=letter, w=width))
        
        left = float(x) / texture_size
        right = float(x + width) / texture_size
        top = 1.0 - (float(y) / texture_size) # flip origin from bottom left to top left
        bottom = 1.0 - (float(y - descent + ascent) / texture_size)

        uvs.append(left)
        uvs.append(right)
        uvs.append(top)
        uvs.append(bottom)

        x += (width + 2)
        if height > greatest_height:
            greatest_height = height

        if x + width >= texture_size:
            #pdb.gimp_message("greatest height: {g}".format(g=greatest_height))
            y += greatest_height
            x = 0
            greatest_height = 0

    write_uvs(uv_map_path, origins, uvs)

    # Create a new image window
    gimp.Display(img)
    # Show the new image window
    gimp.displays_flush()
    # Restore the old foreground color:
    pdb.gimp_context_pop()


register(
    "python_fu_alphabet_image",
    "alphabet image",
    "Create a new image containing the alphabet",
    "Joe Harding",
    "Joe Harding",
    "2017",
    "Alphabet Image",
    "",      # Create a new image, don't work on an existing one
    [
        (PF_FONT, "font", "Font face", "IBM Plex Mono Medium"),
        (PF_COLOR, "color", "Text color", (1.0, 1.0, 1.0)),
        (PF_INT, "size", "Text size", 32),
        (PF_INT, "texture_size", "Texture size", 256),
        (PF_DIRNAME, "uv_map_path", "UV map output directory", "/Users/jharding/webgl/public")
    ],
    [],
    create, menu="<Image>/File/Create")

main()
