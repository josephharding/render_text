#!/usr/bin/env python

from gimpfu import *


def scan_pixels(current_index, section_index, pixels, pixel_sectioned):
    print "hello"


def make_sections(pixels):
    # for each pixel if it's not already a member of a section this is the first pixel of the section
    # so create a new entry in the sections array, pass that section index into the scan_pixels in the upcoming method calls
    # feed that pixel into scan_pixels, a recursive function that checks the pixel's section membership
    # and if not already assigned checks the color value and adds it to the active section if within some
    # threshold X and then feeds all ajacent pixels into the scan_pixels function
    pixel_sectioned = [] # if the index is fill with a True that means it already belongs to a section
    sections = [] # array of arrays containing indices of pixels that belong to each section
    return "hello"


def do_work():
    img = gimp.Image(20, 20, RGB)
   
    # image for testing
    background = gimp.Layer(img, "Background", img.width, img.height, RGB_IMAGE, 100, NORMAL_MODE)
    background.fill(BACKGROUND_FILL)
  
    img.add_layer(background, 1)

    #pdb.gimp_context_push()

    actual_name = pdb.gimp_brush_new('joe')
    pdb.gimp_message("brush name: {a}".format(a=actual_name)) 
    
    actual_hardness = pdb.gimp_brush_set_hardness(actual_name, 1.0)
    pdb.gimp_message("actual hardness: {a}".format(a=actual_hardness)) 
    
    actual_shape = pdb.gimp_brush_set_shape(actual_name, 1) # enum for GIMP_BRUSH_GENERATED_SQUARE doesn't work?
    pdb.gimp_message("actual shape: {a}".format(a=actual_shape)) 
    
    actual_radius = pdb.gimp_brush_set_radius(actual_name, 0.5)
    pdb.gimp_message("actual radius: {a}".format(a=actual_radius)) 
    
    pdb.gimp_context_set_brush(actual_name)

    draw = pdb.gimp_image_active_drawable(img)
    
    points = [10, 10]
    pdb.gimp_paintbrush_default(draw, len(points), points)

    full_draw = pdb.gimp_image_active_drawable(img)

    pixels = [pdb.gimp_drawable_get_pixel(full_draw, x % 20, x / 20)[1] for x in range(20 * 20)]
    pdb.gimp_message("pixel: {a}".format(a=pixels)) 
    
    sections = make_sections(pixels) 
    
    # Create a new image window
    gimp.Display(img)
    # Show the new image window
    gimp.displays_flush()
    # Restore the old foreground color:
    pdb.gimp_context_pop()


register(
    "python_fu_vectorize_sky",
    "vectorize sky",
    "vectorize a raster",
    "Joe Harding",
    "Joe Harding",
    "2017",
    "Vectorize Sky",
    "",      # Create a new image, don't work on an existing one
    [],
    [],
    do_work, menu="<Image>/Filters")

main()
