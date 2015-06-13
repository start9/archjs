#pragma once

#include <stdint.h>

#include <libretro.h>

void bridge_retro_log( enum retro_log_level level, char const * format, ... );

bool bridge_retro_environment( unsigned command, void * data );

void bridge_retro_video_refresh( void const * data, unsigned width, unsigned height, size_t pitch );

void bridge_retro_input_poll( void );

int16_t bridge_retro_input_state( unsigned port, unsigned device, unsigned index, unsigned id );

void bridge_retro_audio_sample( int16_t left, int16_t right );

size_t bridge_retro_audio_sample_batch( int16_t const * samples, size_t count );
