#include <stdarg.h>
#include <stdint.h>
#include <stdio.h>

#include <libretro.h>

#include "./bridge_retro.h"
#include "./bridge_virtjs.h"
#include "./input_formats.h"

void bridge_retro_log( enum retro_log_level level, char const * format, ... )
{
    va_list args;
    va_start( args, format );
    vfprintf( stderr, format, args );
    va_end( args );
}

bool bridge_retro_environment( unsigned command, void * data )
{
    switch ( command ) {

    default:
        return false;

    case RETRO_ENVIRONMENT_GET_LOG_INTERFACE: {

        ((struct retro_log_callback *) data)->log = bridge_retro_log;

        return true;

    } break ;

    case RETRO_ENVIRONMENT_GET_CAN_DUPE: {

        *(bool*) data = true;

        return true;

    } break ;

    case RETRO_ENVIRONMENT_SET_PIXEL_FORMAT: {

        enum retro_pixel_format const * retro_pixel_format = (enum retro_pixel_format *) data;
        struct input_format const * input_format = get_input_format( *retro_pixel_format );

        if ( !input_format || !bridge_virtjs_screen_validate_input_format( input_format ) )
            return false;

        bridge_virtjs_screen_set_input_format( input_format );
        return true;

    } break ;

    }
}

void bridge_retro_video_refresh( void const * data, unsigned width, unsigned height, size_t pitch )
{
    bridge_virtjs_screen_set_input_size( width, height, pitch );
    bridge_virtjs_screen_set_input_data( data );
}

void bridge_retro_input_poll( void )
{
    bridge_virtjs_input_poll_inputs( );
}

int16_t bridge_retro_input_state( unsigned port, unsigned device, unsigned index, unsigned id )
{
    if ( device != RETRO_DEVICE_JOYPAD || index != 0 )
        return 0;

    return bridge_virtjs_input_get_state( port, id );
}

void bridge_retro_audio_sample( int16_t left, int16_t right )
{
}

size_t bridge_retro_audio_sample_batch( int16_t const * data, size_t frames )
{
    return frames;
}
