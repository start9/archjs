#include <errno.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include <libretro.h>

#ifdef EMSCRIPTEN
# include <emscripten.h>
#endif

#include "./bridge_retro.h"
#include "./bridge_virtjs.h"
#include "./frontend.h"

#ifndef EMSCRIPTEN_KEEPALIVE
# define EMSCRIPTEN_KEEPALIVE
#endif

static int g_next_tick_id = 0;

static char const * g_state_path = NULL;

static void * g_state = NULL;
static size_t g_state_size = 0;

static int read_file(char const * path, void ** data, size_t * size)
{
    FILE * file = fopen(path, "rb");

    if (! file)
        return fprintf(stderr, "Cannot open file %s (%s)\n", path, strerror(errno)), fclose(file), -1;

    fseek(file, 0, SEEK_END);

    *size = ftell(file);
    *data = malloc(*size);

    fseek(file, 0, SEEK_SET);

    if (fread(*data, *size, 1, file) != 1)
        return fprintf(stderr, "Cannot read file %s (%s)\n", path, strerror(ferror(file))), fclose(file), -2;

    return fclose(file), 0;
}

static int write_file(char const * path, void const * data, size_t size)
{
    FILE * file = fopen(path, "wb+");

    if (! file)
        return fprintf(stderr, "Cannot open file %s (%s)\n", path, strerror(errno)), fclose(file), -1;

    if (fwrite(data, size, 1, file) != 1)
        return fprintf(stderr, "Cannot write file %s (%s)\n", path, strerror(ferror(file))), fclose(file), -2;

    return fclose(file), 0;
}

static void iterate(void)
{
    g_next_tick_id = bridge_virtjs_timer_next_tick(iterate);

    retro_run();
    bridge_virtjs_screen_flush_screen();
}

void EMSCRIPTEN_KEEPALIVE frontend_start(void)
{
    g_next_tick_id = bridge_virtjs_timer_next_tick(iterate);
}

bool EMSCRIPTEN_KEEPALIVE frontend_status(void)
{
    return g_next_tick_id != 0;
}

void EMSCRIPTEN_KEEPALIVE frontend_stop(void)
{
    bridge_virtjs_timer_cancel_tick(g_next_tick_id);
    g_next_tick_id = 0;
}

int EMSCRIPTEN_KEEPALIVE frontend_load_game(char const * path)
{
    struct retro_system_info system_info;
    retro_get_system_info(&system_info);

    void * data = NULL;
    size_t size = 0;

    if (! system_info.need_fullpath)
        if (read_file(path, &data, &size) < 0)
            return fprintf(stderr, "Cannot launch game %s\n", path), -1;

    struct retro_game_info game_info = { .path = path, .data = data, .size = size };

    if (!retro_load_game(&game_info))
        return fprintf(stderr, "Retroarch refused to launch game %s\n", path), -2;

    g_state_size = retro_serialize_size();
    g_state = malloc(g_state_size);

    struct retro_system_av_info system_av_info;
    retro_get_system_av_info(&system_av_info);

    if (bridge_virtjs_audio_validate_input_format(system_av_info.timing.sample_rate))
        bridge_virtjs_audio_set_input_format(system_av_info.timing.sample_rate);

    return 0;
}

int EMSCRIPTEN_KEEPALIVE frontend_unload_game(void)
{
    retro_unload_game();

    return 0;
}

void EMSCRIPTEN_KEEPALIVE frontend_set_state_path(char const * path)
{
    g_state_path = path;
}

int EMSCRIPTEN_KEEPALIVE frontend_load_state(void)
{
    if (!g_state_path)
        return fprintf(stderr, "Cannot load state - no path specified\n"), -1;

    void * data = NULL;
    size_t size = 0;

    if (read_file(g_state_path, &data, &size) < 0)
        return free(data), -2;

    if (frontend_set_state(data, size) < 0)
        return free(data), -3;

    return free(data), 0;
}

int EMSCRIPTEN_KEEPALIVE frontend_save_state(void)
{
    if (!g_state_path)
        return fprintf(stderr, "Cannot save state - no path specified\n"), -1;

    void const * data = NULL;
    size_t size = 0;

    if (frontend_get_state(&data, &size) < 0)
        return -2;

    if (write_file(g_state_path, data, size) < 0)
        return -3;

    return 0;
}

int EMSCRIPTEN_KEEPALIVE frontend_set_state(void const * state, size_t size)
{
    if (!retro_unserialize(state, size))
        return -1;

    return 0;
}

int EMSCRIPTEN_KEEPALIVE frontend_get_state(void const ** state, size_t * size)
{
    if (!retro_serialize(g_state, g_state_size))
        return -1;

    *state = g_state;
    *size = g_state_size;

    return 0;
}

int EMSCRIPTEN_KEEPALIVE frontend_reset_state(void)
{
    retro_reset();

    return 0;
}
