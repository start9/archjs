#include <stdlib.h>

#include <libretro.h>

#include "./input_formats.h"

struct input_format format_0rgb1555 = {
    .depth = 16,
    .r_mask = 0b0111110000000000,
    .g_mask = 0b0000001111100000,
    .b_mask = 0b0000000000011111,
    .a_mask = 0b0000000000000000
};

struct input_format format_rgb565 = {
    .depth = 16,
    .r_mask = 0b1111100000000000,
    .g_mask = 0b0000011111100000,
    .b_mask = 0b0000000000011111,
    .a_mask = 0b0000000000000000
};

struct input_format format_xrgb8888 = {
    .depth = 32,
    .r_mask = 0x00FF0000,
    .g_mask = 0x0000FF00,
    .b_mask = 0x000000FF,
    .a_mask = 0x00000000
};

struct input_format const * get_input_format( enum retro_pixel_format input_format )
{
    switch ( input_format ) {
    case RETRO_PIXEL_FORMAT_0RGB1555 : return &format_0rgb1555;
    case RETRO_PIXEL_FORMAT_XRGB8888 : return &format_xrgb8888;
    case RETRO_PIXEL_FORMAT_RGB565 : return &format_rgb565;
    default : return NULL;
    }
}
