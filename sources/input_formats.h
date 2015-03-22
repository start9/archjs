#pragma once

#include <stdlib.h>

#include <libretro.h>

struct input_format {
    uint32_t depth;
    uint32_t r_mask;
    uint32_t g_mask;
    uint32_t b_mask;
    uint32_t a_mask;
};

struct input_format const * get_input_format( enum retro_pixel_format pixel_format );
