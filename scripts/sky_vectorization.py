#!/usr/bin/env python

from gimpfu import *


def ij_to_idx(grid_height, i, j):
    return (j * grid_height) + i


def idx_to_ij(grid_width, grid_height, idx):
    return idx % grid_width, idx / grid_height


def get_pixel_right(grid_width, grid_height, idx):
    i, j = idx_to_ij(grid_width, grid_height, idx)
    if i + 1 == grid_width:
        return None
    else:
        return ij_to_idx(grid_height, i + 1, j)


def get_pixel_left(grid_width, grid_height, idx):
    i, j = idx_to_ij(grid_width, grid_height, idx)
    if i == 0:
        return None
    else:
        return ij_to_idx(grid_height, i - 1, j)

    
def get_pixel_above(grid_width, grid_height, idx):
    i, j = idx_to_ij(grid_width, grid_height, idx)
    if j == 0:
        return None
    else:
        return ij_to_idx(grid_height, i, j - 1)

    
def get_pixel_below(grid_width, grid_height, idx):
    i, j = idx_to_ij(grid_width, grid_height, idx)
    if j + 1 == grid_height:
        return None
    else:
        return ij_to_idx(grid_height, i, j + 1)


def average_color(average, color):
    diff = (average[0] - color[0], average[1] - color[1], average[2] - color[2])
    return (average[0] + diff[0], average[1] + diff[1], average[2] + diff[2])


def is_color_close(average, color):
    _e = 3
    return abs(average[0] - color[0]) < _e and abs(average[1] - color[1]) < _e and abs(average[2] - color[2]) < _e


# returns an array of pixel indices that belong to the current section
def scan_pixels(current_index, pixels, pixel_sectioned, color_average, width, height):
    #pdb.gimp_message("before current index: {i}, width: {w}, height: {h}".format(i=current_index, w=width, h=height)) 
    result = []
    if current_index is not None and current_index not in pixel_sectioned:
        if is_color_close(color_average, pixels[current_index]):
            #color_average = average_color(color_average, pixels[current_index]) 
            
            result.append(current_index) 
            pixel_sectioned[current_index] = True 
            
            result += scan_pixels(get_pixel_right(width, height, current_index), pixels, pixel_sectioned, color_average, width, height)
            result += scan_pixels(get_pixel_left(width, height, current_index), pixels, pixel_sectioned, color_average, width, height)
            result += scan_pixels(get_pixel_above(width, height, current_index), pixels, pixel_sectioned, color_average, width, height)
            result += scan_pixels(get_pixel_below(width, height, current_index), pixels, pixel_sectioned, color_average, width, height)
        else:
            pdb.gimp_message("index: {i} failed color test".format(i=current_index))

    return result


def make_sections(pixels, width, height):
    # for each pixel if it's not already a member of a section this is the first pixel of the section
    # so create a new entry in the sections array, pass that section index into the scan_pixels in the upcoming method calls
    # feed that pixel into scan_pixels, a recursive function that checks the pixel's section membership
    # and if not already assigned checks the color value and adds it to the active section if within some
    # threshold X and then feeds all ajacent pixels into the scan_pixels function
     
    pixel_sectioned = {} # if the index is fill with a True that means it already belongs to a section
    sections = [] # array of arrays containing indices of pixels that belong to each section
    for idx, pixel in enumerate(pixels):
        new_section = scan_pixels(idx, pixels, pixel_sectioned, pixel, width, height) 
        if len(new_section) > 0:
            sections.append(new_section)

    return sections


def vectorize(pixels, img):
    sections = make_sections(pixels, img.width, img.height) 
    pdb.gimp_message("sections: {a}".format(a=sections)) 
    
    actual_name = pdb.gimp_brush_new('joe')
    pdb.gimp_message("brush name: {a}".format(a=actual_name)) 
     
    actual_shape = pdb.gimp_brush_set_shape(actual_name, 1) # enum for GIMP_BRUSH_GENERATED_SQUARE doesn't work?
    pdb.gimp_message("actual shape: {a}".format(a=actual_shape)) 
    
    pdb.gimp_context_set_brush_size(1)  
    pdb.gimp_context_set_brush(actual_name)
    
    section_colors = [(255, 0, 0), (0, 255, 0), (0, 0, 255)]
    for idx, section in enumerate(sections):
        pdb.gimp_context_set_foreground(section_colors[idx % len(section_colors)])
        
        section_fill = gimp.Layer(img, "section {n}".format(n=idx), img.width, img.height, RGB_IMAGE, 100, NORMAL_MODE)
        section_fill.fill(BACKGROUND_FILL) 
        img.add_layer(section_fill, idx + 1)
        
        new_points = [] 
        for idx in section:
            new_points += idx_to_ij(img.width, img.height, idx)
      
        pdb.gimp_message("new points: {a}".format(a=new_points))
        if len(new_points) > 0:
            pdb.gimp_pencil(section_fill, len(new_points), new_points) 


def get_pixels(img, draw):
    return [pdb.gimp_drawable_get_pixel(draw, x % img.width, x / img.height)[1] for x in range(img.width * img.height)]


def create_pixels(img):
    pdb.gimp_context_set_foreground((255, 255, 255))
    
    background = gimp.Layer(img, "seed", img.width, img.height, RGBA_IMAGE, 100, NORMAL_MODE)
    background.fill(TRANSPARENT_FILL) 
    
    img.add_layer(background, 1)

    pdb.gimp_context_push()

    actual_name = pdb.gimp_brush_new('joe')
    pdb.gimp_message("brush name: {a}".format(a=actual_name)) 
     
    actual_shape = pdb.gimp_brush_set_shape(actual_name, 1) # enum for GIMP_BRUSH_GENERATED_SQUARE doesn't work?
    pdb.gimp_message("actual shape: {a}".format(a=actual_shape)) 
    
    pdb.gimp_context_set_brush_size(1)  
    pdb.gimp_context_set_brush(actual_name)

    draw = pdb.gimp_image_active_drawable(img)
    
    pdb.gimp_context_set_background((255, 255, 255, 255))

    points = [0, 0, 1, 0, 2, 0, 0, 1, 1, 1, 2, 1, 0, 2, 1, 2, 2, 2]
    pdb.gimp_pencil(draw, len(points), points)

    return get_pixels(img, draw)


def make_image():
    pdb.gimp_message("making image...")
    img = gimp.Image(20, 20, RGB)

    pixels = create_pixels(img)
    pdb.gimp_message("pixels: {a}".format(a=pixels)) 
    
    vectorize(pixels, img) 
    
    # Create a new image window
    gimp.Display(img)
    # Show the new image window
    gimp.displays_flush()
    # Restore the old foreground color:
    pdb.gimp_context_pop()


def process_image(img, drw):
    pdb.gimp_message("processing image...")
    
    pixels = get_pixels(img, drw)
    pdb.gimp_message("pixels: {a}".format(a=pixels)) 
    
    vectorize(pixels, img)


register(
    "python_fu_vectorize_sky",
    "Vectorize Sky",
    "Vectorize Sky",
    "Joe Harding",
    "Joe Harding",
    "2017",
    "<Image>/Image/Vectorize Sky",
    "",
    [],
    [],
    process_image, domain=("gimp20-python", gimp.locale_directory))


#register(
#    "python_fu_vectorize_sky",
#    "vectorize sky",
#    "vectorize a raster",
#    "Joe Harding",
#    "Joe Harding",
#    "2017",
#    "Vectorize Sky",
#    "",
#    [],
#    [],
#    make_image, menu="<Image>/Filters")

main()
