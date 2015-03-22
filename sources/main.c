#include <stdio.h>
#include <unistd.h>

#include <libretro.h>

#include "./bridge_retro.h"
#include "./bridge_virtjs.h"
#include "./frontend.h"

static void initialize( void )
{
    retro_set_environment( bridge_retro_environment );
    retro_set_video_refresh( bridge_retro_video_refresh );
    retro_set_input_poll( bridge_retro_input_poll );
    retro_set_input_state( bridge_retro_input_state );
    retro_set_audio_sample( bridge_retro_audio_sample );
    retro_set_audio_sample_batch( bridge_retro_audio_sample_batch );

    retro_init( );
}

#if !defined(EMSCRIPTEN)

int main( int argc, char const ** argv )
{
    if ( argc < 2 )
        return fprintf( stderr, "Usage: %s <rom> [<state>]\n", argv[ 0 ] );

    initialize( );

    if ( frontend_load_game( argv[ 1 ] ) < 0 )
        return fprintf( stderr, "Game load failed\n" ), -1;

    if ( argc >= 3 ) {
        frontend_set_state_path( argv[ 2 ] );
        if ( access( argv[ 2 ], F_OK ) == 0 && frontend_load_state( ) < 0 ) {
            return fprintf( stderr, "Initial state load failed\n" ), -1;
        }
    }

    frontend_start( );
    bridge_virtjs_timer_start( );

    return 0;
}

#else

int main( void )
{
    initialize( );

    return 0;
}

#endif
