#pragma once

#include <stdint.h>

#include "./input_formats.h"

#ifdef __cplusplus
extern "C" {
#endif

void   bridge_virtjs_input_poll_inputs( void );
bool   bridge_virtjs_input_get_state( unsigned device, unsigned code );

void   bridge_virtjs_timer_start( void );
void   bridge_virtjs_timer_stop( void );
int    bridge_virtjs_timer_next_tick( void (*callback)( void ) );
void   bridge_virtjs_timer_cancel_tick( int );

bool   bridge_virtjs_screen_validate_input_format( struct input_format const * input_format );
void   bridge_virtjs_screen_set_input_format( struct input_format const * input_format );
void   bridge_virtjs_screen_set_input_size( unsigned width, unsigned height, unsigned pitch );
void   bridge_virtjs_screen_set_input_data( void const * data );
void   bridge_virtjs_screen_flush_screen( void );

void   bridge_virtjs_audio_set_sample_rate( double sample_rate );
void   bridge_virtjs_audio_push_sample( int16_t left, int16_t right );
size_t bridge_virtjs_audio_push_sample_batch( int16_t const * samples, size_t count );

#ifdef __cplusplus
}
#endif
