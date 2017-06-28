#!/usr/bin/env python

from gimpfu import *
import sys


sys.setrecursionlimit(2000000)

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
def scan_pixels(result, current_index, pixels, pixel_sectioned, color_average, width, height):
    #pdb.gimp_message("before current index: {i}, width: {w}, height: {h}".format(i=current_index, w=width, h=height)) 
    if current_index is not None and current_index not in pixel_sectioned:
        if is_color_close(color_average, pixels[current_index]):
            #color_average = average_color(color_average, pixels[current_index]) 
            
            result.append(current_index) 
            if len(result) % 1000 == 0:
                pdb.gimp_message("result gained 1000 more: {l}".format(l=len(result)))
            
            pixel_sectioned[current_index] = True 
            
            scan_pixels(result, get_pixel_right(width, height, current_index), pixels, pixel_sectioned, color_average, width, height)
            scan_pixels(result, get_pixel_left(width, height, current_index), pixels, pixel_sectioned, color_average, width, height)
            scan_pixels(result, get_pixel_above(width, height, current_index), pixels, pixel_sectioned, color_average, width, height)
            scan_pixels(result, get_pixel_below(width, height, current_index), pixels, pixel_sectioned, color_average, width, height)
        #else:
        #    pdb.gimp_message("index: {i} failed color test".format(i=current_index))


def make_sections(pixels, width, height):
    # for each pixel if it's not already a member of a section this is the first pixel of the section
    # so create a new entry in the sections array, pass that section index into the scan_pixels in the upcoming method calls
    # feed that pixel into scan_pixels, a recursive function that checks the pixel's section membership
    # and if not already assigned checks the color value and adds it to the active section if within some
    # threshold X and then feeds all ajacent pixels into the scan_pixels function
     
    pixel_sectioned = {} # if the index is fill with a True that means it already belongs to a section
    sections = [] # array of arrays containing indices of pixels that belong to each section
    for idx, pixel in enumerate(pixels):
        new_section = []
        scan_pixels(new_section, idx, pixels, pixel_sectioned, pixel, width, height) 
        if len(new_section) > 0:
            sections.append(new_section)

    return sections


def draw_pixel_groups_to_layers(pixel_groups, img, label):
    actual_name = pdb.gimp_brush_new('joe')
    #pdb.gimp_message("brush name: {a}".format(a=actual_name)) 
     
    actual_shape = pdb.gimp_brush_set_shape(actual_name, 1) # enum for GIMP_BRUSH_GENERATED_SQUARE doesn't work?
    #pdb.gimp_message("actual shape: {a}".format(a=actual_shape)) 
    
    pdb.gimp_context_set_brush_size(1)  
    pdb.gimp_context_set_brush(actual_name)
    
    colors = [(255, 0, 0), (0, 255, 0), (0, 0, 255)]
    for idx, pixels in enumerate(pixel_groups):
        pdb.gimp_context_set_foreground(colors[idx % len(colors)])
        
        section_fill = gimp.Layer(img, "{l} {n}".format(l=label, n=idx), img.width, img.height, RGB_IMAGE, 100, NORMAL_MODE)
        section_fill.fill(BACKGROUND_FILL) 
        img.add_layer(section_fill, idx + 1)
        
        for idx in pixels:
            pdb.gimp_pencil(section_fill, 2, idx_to_ij(img.width, img.height,idx)) 


def get_section_index(idx, sections):
    for sidx, section in enumerate(sections):
        if idx in section:
            return sidx 
 
    return -1


def is_border_pixel(idx, sections, width, height):
    section_index = get_section_index(idx, sections) 
    neighbors = [
        get_pixel_right(width, height, idx),
        get_pixel_left(width, height, idx),
        get_pixel_above(width, height, idx),
        get_pixel_below(width, height, idx)
        ]
    for neighbor in neighbors:
        if section_index != get_section_index(neighbor, sections):
            return True

    return False


def get_borders(idx, sections, width, height):
    result = [] 
    right = get_pixel_right(width, height, idx) 
    if get_section_index(idx, sections) != get_section_index(right, sections):
        i, j = idx_to_ij(width, height, idx)
        result.append(((i + 1, j), (i + 1, j + 1)))
    
    left = get_pixel_left(width, height, idx)
    if get_section_index(idx, sections) != get_section_index(left, sections):
        i, j = idx_to_ij(width, height, idx)
        result.append(((i, j), (i, j + 1)))
    
    above = get_pixel_above(width, height, idx)
    if get_section_index(idx, sections) != get_section_index(above, sections):
        i, j = idx_to_ij(width, height, idx)
        result.append(((i, j), (i + 1, j)))
    
    below = get_pixel_below(width, height, idx)
    if get_section_index(idx, sections) != get_section_index(below, sections):
        i, j = idx_to_ij(width, height, idx)
        result.append(((i, j + 1), (i + 1, j + 1)))

    return get_section_index(idx, sections), result


# TODO - this function assumes unique values in the tuple
def link_in_links(target_link, links): 
    #pdb.gimp_message("target link: {t}, all links: {a}".format(t=target_link, a=links))
    for l_idx, link in enumerate(links):
        found = True 
        for coord in link:
            if coord not in target_link:
                found = False
                break

        if found:
            return l_idx

    return -1


# returns an index to the next link to use, or -1 for no available links
def get_next_clockwise_link(current_link, links):
    result = -1
    direction_index = -1
    start = current_link[0] # NOTE - this assumption only works because we use the order_link func
    end = current_link[1] # NOTE - this assumption only works because we use the order_link func
    if start[0] - end[0] == 0 and start[1] - end[1] == -1:
        # DOWN
        direction_index = 2
    elif start[0] - end[0] == 0 and start[1] - end[1] == 1:
        # UP
        direction_index = 0
    elif start[0] - end[0] == 1 and start[1] - end[1] == 0:
        # LEFT
        direction_index = 3
    elif start[0] - end[0] == -1 and start[1] - end[1] == 0:
        # RIGHT
        direction_index = 1

    # pdb.gimp_message("direction_index: {i}".format(i=direction_index))
    if direction_index == -1:
        pdb.gimp_message("ERROR INVALID DIRECTION INDEX")
        return -1

    
    # create the expected clockwis link values
    dirs = []
    dirs.append((end, (end[0], end[1] - 1))) # UP in pos 0
    dirs.append((end, (end[0] + 1, end[1]))) # RIGHT in pos 1
    dirs.append((end, (end[0], end[1] + 1))) # DOWN in pos 2
    dirs.append((end, (end[0] - 1, end[1]))) # LEFT in pos 3

    # pdb.gimp_message("dirs: {i}".format(i=dirs))
    i = 0
    while(i < len(dirs)):
        found_index = link_in_links(dirs[(direction_index + i) % len(dirs)], links)
        if found_index > -1:
            result = found_index 
            break
             
        i += 1
   
    return result 


def order_link(tail, next_tail):
    if tail[1] == next_tail[0]:
        return (next_tail[0], next_tail[1]) 
    else:
        return (next_tail[1], next_tail[0]) 


def link_up(links):
    chain = [links.pop()]
    while len(links) > 0:
        #pdb.gimp_message("link up iteration: {a}".format(a=links))
        next_idx = get_next_clockwise_link(chain[-1], links)
        if next_idx > -1:
            #pdb.gimp_message("linked at {i}".format(i=next_idx))
            chain.append(order_link(chain[-1], links[next_idx]))
            del links[next_idx] 

        else:
            pdb.gimp_message("ERROR: couldn't find link to {l} in {a}, existing chain was: {c}".format(l=active_chain[-1], a=links, c=active_chain))

    # convert chain of links into list of points
    points = []
    for pairs in chain: # NOTE - this step stops the completion of the chain into a loop
        if pairs[0] not in points:
           points.append(pairs[0])
        if pairs[1] not in points:
           points.append(pairs[1])  

    #points.append(points[0]) # complete the loop here # TODO - this breaks calculating proper wrapping
    return points


def make_point_borders(pixels, sections, width, height):
    links = {}
    for idx, pixel in enumerate(pixels):
        if is_border_pixel(idx, sections, width, height):
            section_index, section_links = get_borders(idx, sections, width, height)
           
            if section_index in links: 
                links[section_index] += section_links
            else: 
                links[section_index] = section_links

    #pdb.gimp_message("links: {u}".format(u=links))
    result = []
    for key, val in links.iteritems():
        result.append(link_up(val))

    return result


def calculate_shared_edges(section_points):
    edges = [] # list of lists, index is edge id, value is the list of points in that edge 
    sections_to_edges = {} # map of sections to array of edges that make up that section 

    edge_wrapped_for = {} # TODO - better way to keep track of which direction something was wrapped for?
    c_idx = 0
    while len(section_points) > 0:
        current = section_points.pop(0) 

        for idx, points in enumerate(section_points):
            common_edges = find_all_common_subarrays(current, list(reversed(points)))
            for common_edge in common_edges:

                edges.append(common_edge)
                edge_wrapped_for[len(edges) - 1] = c_idx

                if c_idx not in sections_to_edges:
                    sections_to_edges[c_idx] = []
                sections_to_edges[c_idx].append(len(edges) - 1)

                if (idx + c_idx + 1) not in sections_to_edges:
                    sections_to_edges[idx + c_idx + 1] = []
                sections_to_edges[idx + c_idx + 1].append(len(edges) - 1)

        # deal with any non-shared edges
        shared_edges = []
        for edge_id in sections_to_edges[c_idx]:
            if edge_wrapped_for[edge_id] == c_idx:
                shared_edges.append(edges[edge_id])
            else:
                shared_edges.append(list(reversed(edges[edge_id])))

        remaining_edges = subtract_subarrays(current, shared_edges)
        for remaining_edge in remaining_edges:
            edges.append(remaining_edge)
            if c_idx not in sections_to_edges:
                sections_to_edges[c_idx] = []
            
            sections_to_edges[c_idx].append(len(edges) - 1)

        c_idx += 1

    # last step is to remove duplicate edge entries (points that belong to 3 or 4 sections)
    found_map = {} 
    merged_list = [] 
    for edge in edges:
        merged_list += edge

    for point in merged_list:
        if point not in found_map:
            found_map[point] = 0

        found_map[point] += 1 

    intersection_points = []
    for found_key, found_val in found_map.iteritems():
        if found_val > 2:
            intersection_points.append(found_key)

    #pdb.gimp_message("intersection_points {b}".format(b=intersection_points))
    for intersection_point in intersection_points:
        # the intersection point may already exist as a singleton edge 
        if [intersection_point] not in edges: 
            edges.append([intersection_point])
        for i_e, edge in enumerate(edges):
            if intersection_point in edge and len(edge) > 1:
                front, back = split_edge(edge, intersection_point)

                new_is = [edges.index([intersection_point])]
                if len(front) > 0:
                    edges.append(front)
                    new_is.append(edges.index(front))
                
                if len(back) > 0:
                    edges.append(back)
                    new_is.append(edges.index(back))

                del edges[i_e]

                replace_map_values(sections_to_edges, i_e, new_is) 
                downshift_indices(sections_to_edges, i_e) # b/c we just deleted this list entry all values higher than this index are now off by one


    return edges, sections_to_edges


def downshift_indices(m, threshold):
    for key, val in m.iteritems():
        new_val = [] 
        for item in val:
            if item >= threshold:
                new_val.append(item - 1) 
            else:
                new_val.append(item)
        m[key] = new_val


def split_edge(edge, point):
    past = False 
    front = []
    back = []
    for p in edge:
        if p == point:
            past = True
        elif past:
            back.append(p)
        else:
            front.append(p)

    return front, back


# where old val is one values and new_vals is a list of new values
def replace_map_values(m, old_item, new_items):
    for key, val in m.iteritems():
        if old_item in val:
            new = []
            new += new_items
            for item in val:
                if item != old_item:
                    new.append(item)
           
            m[key] = list(set(new))


def vectorize(pixels, img):
    sections = make_sections(pixels, img.width, img.height) 
    #pdb.gimp_message("sections count: {a}".format(a=len(sections)))  
    #draw_pixel_groups_to_layers(sections, img, "section")

    section_points = make_point_borders(pixels, sections, img.width, img.height)
    #pdb.gimp_message("section border points: {b}".format(b=section_points))

    edges, sections_to_edges = calculate_shared_edges(section_points)
    #pdb.gimp_message("sections: {s}".format(s=sections_to_edges))
    #for idx, edge in enumerate(edges):
    #    pdb.gimp_message("{i} edge: {e}".format(i=idx, e=edge))

    # TODO - next, feed each edge into the reduction algo
    reduced_edges = []
    for edge in edges:
        if len(edge) > 4: 
            reduced_edges.append(rdpReduce(edge))
            pdb.gimp_message("edge: {e}".format(e=edge))
            pdb.gimp_message("reduced edge: {e}".format(e=rdpReduce(edge)))
        else:
            reduced_edges.append(edge)

    # map reduced edges to polygons
    # TODO - should we try to use the original version and not modify is in calculate_shared_edges?
    section_points = make_point_borders(pixels, sections, img.width, img.height)
    polygons = []
    for key, val in sections_to_edges.iteritems():
        points = [] 
        for idx in val:
           points += reduced_edges[idx]

        polygons.append(reorder_points(points, section_points[key]))
 
    pixel_groups = []
    for idx, polygon in enumerate(polygons):
        pdb.gimp_message("polygon: {p}".format(p=polygon))
       
        pixel_group  = []
        for point in polygon:
            pixel_group.append(ij_to_idx(img.height, point[0] - 1, point[1] - 1))
    
        pixel_groups.append(pixel_group)

    pdb.gimp_message("pixel groups: {p}".format(p=pixel_groups))
    draw_pixel_groups_to_layers(pixel_groups, img, "vertex")
    
    return "hello"


def get_pixels(img, draw):
    return [pdb.gimp_drawable_get_pixel(draw, x % img.width, x / img.height)[1] for x in range(img.width * img.height)]


def create_pixels(img):
    pdb.gimp_context_set_foreground((255, 255, 255))
    
    background = gimp.Layer(img, "seed", img.width, img.height, RGBA_IMAGE, 100, NORMAL_MODE)
    background.fill(TRANSPARENT_FILL) 
    
    img.add_layer(background, 1)

    pdb.gimp_context_push()

    actual_name = pdb.gimp_brush_new('joe')
    #pdb.gimp_message("brush name: {a}".format(a=actual_name)) 
     
    actual_shape = pdb.gimp_brush_set_shape(actual_name, 1) # enum for GIMP_BRUSH_GENERATED_SQUARE doesn't work?
    #pdb.gimp_message("actual shape: {a}".format(a=actual_shape)) 
    
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
    #pdb.gimp_message("pixels: {a}".format(a=pixels)) 
    
    vectorize(pixels, img) 
    
    # Create a new image window
    gimp.Display(img)
    # Show the new image window
    gimp.displays_flush()
    # Restore the old foreground color:
    pdb.gimp_context_pop()


def find_all_common_subarrays(a, b):
    result = []
    iters = 0
    while True:
        iters += 1 
        a_idx, b_idx, span = find_longest_common_subarray(a, b)
        #pdb.gimp_message("sub array: {a}, {b}, {s}".format(a=a_idx, b=b_idx, s=span))
        if span == 0 or iters > 10:
            break
        else:
            # TODO - implement overflow logic here for when the end should wrap around to the front of the array
            a_end = a_idx + span
            b_end = b_idx + span

            a_diff = -1
            if a_end > len(a):
                a_diff = a_end - (len(a))
                a_end = len(a)
            
            b_diff = -1
            if b_end > len(b):
                b_diff = b_end - (len(b))
                b_end = len(b)
        
            #pdb.gimp_message("diffs: {a}, {b}".format(a=a_diff, b=b_diff))

            addition = a[a_idx:a_end]
            if a_diff > -1:
                addition += a[0:a_diff]
            
            bddition = b[b_idx:b_end]
            if b_diff > -1:
                bddition += b[0:b_diff]

            result.append(addition)
            
            #pdb.gimp_message("{a} is the same as {b}".format(a=addition, b=bddition)) 
            del a[a_idx:a_end]
            if a_diff > -1:
                del a[0:a_diff]

            del b[b_idx:b_end]
            if b_diff > -1:
                del b[0:b_diff]
            
            #pdb.gimp_message("common subarray result: {r}".format(r=result))

    return result


def find_longest_common_subarray(a, b):
    a_best = -1
    b_best = -1
    best_span = 0 
    for ai, entry in enumerate(a):
        if entry in b:
            a_start = -1
            b_start = -1
            span = 0
       
            a_idx = ai
            b_idx = 0
            while b_idx > b_start and b_idx % len(b) != b_start: # we're done when we've looped once
                #pdb.gimp_message("comparing a: {a}, to b: {b} (a_idx: {ai}, b_idx:{bi}) len a: {al} len b: {bl}".format(a=a[a_idx % len(a)], b=b[b_idx % len(b)], ai=a_idx, bi=b_idx, al=len(a), bl=len(b))) 

                if a[a_idx % len(a)] != b[b_idx % len(b)]:
                    b_idx += 1
         
                else:
                    span += 1
                    if span == 1:
                        a_start = a_idx
                        b_start = b_idx
                    
                    if span > best_span:
                        best_span = span
                        a_best = a_start
                        b_best = b_start
                        #pdb.gimp_message("new best, a: {a}, b: {b}, s: {s}".format(a=a_best, b=b_best, s=best_span)) 

                    a_idx += 1
                    b_idx += 1
                    if a[a_idx % len(a)] != b[b_idx % len(b)]:
                        a_idx -= 1
                        span = 0


    return a_best, b_best, best_span


def is_point_ajacent(a, b):
    if a[0] == b[0] and a[1] == (b[1] + 1):
        return True
    elif a[0] == b[0] and a[1] == (b[1] - 1):
        return True
    elif a[0] == (b[0] + 1) and a[1] == b[1]:
        return True
    elif a[0] == (b[0] - 1) and a[1] == b[1]:
        return True
    else:
        return False


def subtract_subarrays(current, common_edges):
    tmp = []
    for point in current:
        tmp.append(point)

    #pdb.gimp_message("subtract subarrays current: {c}, common: {e}".format(c=current, e=common_edges))
    for common_edge in common_edges:
        for point in common_edge:
            if point in tmp:
                del tmp[tmp.index(point)]

    #pdb.gimp_message("subtract subarrays tmp: {c}, common: {e}".format(c=tmp, e=common_edges))
    result = [[tmp.pop(0)]]
    for point in tmp:
        if is_point_ajacent(result[-1][-1], point):
            result[-1].append(point)
        else:
            result.append([point])

    return result


def dist(p1, p2):
    return pow(pow(p1[0] - p2[0], 2) + pow(p1[1] - p2[1], 2), 0.5)


def dist_line(p, l0, l1):
    return abs(((l1[1] - l0[1]) * p[0]) - ((l1[0] - l0[0]) * p[1]) + (l1[0] * l0[1]) - (l1[1] * l0[0])) / dist(l0, l1)


# NOTE - you need at least 4 points for this to work
def rdpReduce(l):
    result = []
    e = 0
    dmax = 0
    index = 0
    #pdb.gimp_message("line: {a}, {b}".format(a=l[0], b=l[len(l) - 1]))
    for x in range(1, len(l) - 1):
        d = dist_line(l[x], l[0], l[len(l) - 1])
        #pdb.gimp_message("index: {x}, val: {v}, dist: {d}".format(x=x, v=l[x], d=d))
        if d > dmax:
            dmax = d
            index = x

    if dmax > e:
        #pdb.gimp_message("furthest index: {i}, val: {v}, dist: {d}".format(i=index, v=l[index], d=dmax))
        #pdb.gimp_message("passing in front: {f}".format(f=l[0:index]))
        result += rdpReduce(l[0:index])
        #pdb.gimp_message("resulting front half: {r}".format(r=result))
        #pdb.gimp_message("passing in back: {b}".format(b=l[index + 1:len(l)]))
        result += rdpReduce(l[index + 1:len(l)])
        #pdb.gimp_message("resulting back half added: {r}".format(r=result))
    elif len(l) > 1:
        result += [l[0], l[len(l) - 1]]
    else:
        result += [l[0]]

    return result


# reorder points to appear in order as they do in the reference array
def reorder_points(points, reference):
    result = []
    for reference_point in reference:
        if reference_point in points:
            result.append(reference_point)

    return result


def process_image(img, drw):
    pdb.gimp_message("processing image...")
    
    pixels = get_pixels(img, drw)
    #pdb.gimp_message("pixels: {a}".format(a=pixels)) 
    
    vectorize(pixels, img)

    #edge = [(0,0),(1,0),(2,0),(3,0)]
    #pdb.gimp_message("test: {a}".format(a=split_edge(edge, (1,0))))

    #line = [(8,0),(7,0),(6,0),(5,0),(4,0),(3,0),(2,0),(1,0),(0,0),(0,1),(0,2),(0,3),(0,4),(0,5),(0,6)]
    #pdb.gimp_message("original list: {o} reduced list: {r}".format(o=line, r=rdpReduce(line)))


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
