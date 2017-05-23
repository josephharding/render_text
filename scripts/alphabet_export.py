#!/usr/bin/env python

# Hello World in GIMP Python

import string

from gimpfu import *

def hello_world(font, color) :
    # First do a quick sanity check on the font
    if font == 'Comic Sans MS' :
        initstr = "Comic Sans? Are you sure?"

    # Make a new image. Size 10x10 for now -- we'll resize later.
    img = gimp.Image(256, 256, RGB)
   
    # background image
    background = gimp.Layer(img, "Background", img.width, img.height, RGB_IMAGE, 100, NORMAL_MODE)
    background.fill(BACKGROUND_FILL)
    img.add_layer(background, 1)

    # Save the current foreground color:
    pdb.gimp_context_push()

    # Set the text color
    gimp.set_foreground(color)

    letters = list(string.ascii_lowercase)
    x = 0
    y = 0
    for letter in letters:
        # Create a new text layer (-1 for the layer means create a new layer)
        layer = pdb.gimp_text_fontname(img, None, x, y, letter, 4, True, 28, PIXELS, font)
        x += 32
        if x >= 256:
            y += 32
            x = 0


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
    "Alphabet Image (Py)...",
    "",      # Create a new image, don't work on an existing one
    [
        (PF_FONT, "font", "Font face", "Monospace"),
        (PF_COLOR, "color", "Text color", (1.0, 0.0, 0.0))
    ],
    [],
    hello_world, menu="<Image>/File/Create")

main()
