#include <assert.h>
#include <stdlib.h>
#include <string.h>

#include <SDL2/SDL.h>
#include <libretro.h>

#include "./bridge_virtjs.h"
#include "./frontend.h"
#include "./input_formats.h"

static void (*g_timer_callback)(void) = NULL;
static bool g_timer_is_running = false;
static bool g_timer_has_parent = false;

static SDL_Window * g_window = NULL;
static SDL_Surface * g_screen = NULL;
static SDL_Surface * g_pending = NULL;

static int16_t * g_audio_samples = NULL;
static size_t g_audio_sample_count = 0;

static unsigned g_input_width = 0;
static unsigned g_input_height = 0;
static unsigned g_input_pitch = 0;

struct input_format const * g_input_format = NULL;

static bool g_input_state[ 16 ] = { 0 };

static unsigned g_input_bindings[ ][ 2 ] = {

    { SDL_SCANCODE_RETURN, RETRO_DEVICE_ID_JOYPAD_START },

    { SDL_SCANCODE_A, RETRO_DEVICE_ID_JOYPAD_A },
    { SDL_SCANCODE_Q, RETRO_DEVICE_ID_JOYPAD_A },
    { SDL_SCANCODE_Z, RETRO_DEVICE_ID_JOYPAD_B },
    { SDL_SCANCODE_W, RETRO_DEVICE_ID_JOYPAD_B },

    { SDL_SCANCODE_LEFT, RETRO_DEVICE_ID_JOYPAD_LEFT },
    { SDL_SCANCODE_RIGHT, RETRO_DEVICE_ID_JOYPAD_RIGHT },
    { SDL_SCANCODE_UP, RETRO_DEVICE_ID_JOYPAD_UP },
    { SDL_SCANCODE_DOWN, RETRO_DEVICE_ID_JOYPAD_DOWN }

};

static void timer_iterate(void)
{
    Uint32 lastTime = SDL_GetTicks();

    void (*timer_callback)(void) = g_timer_callback;
    g_timer_callback = NULL;

    SDL_Event event;

    if (SDL_PollEvent(&event)) {
        if (event.type == SDL_QUIT) {
            bridge_virtjs_timer_stop(); return;
        } else if (event.type == SDL_KEYDOWN) switch (event.key.keysym.scancode) {
            case SDL_SCANCODE_ESCAPE: bridge_virtjs_timer_stop(); return;
            case SDL_SCANCODE_F1: if (frontend_save_state() < 0) fprintf(stderr, "Save failed\n"); break;
            case SDL_SCANCODE_F2: if (frontend_load_state() < 0) fprintf(stderr, "Load failed\n"); break;
            default: break;
        }
    }

    timer_callback();

    Uint32 currentTime = SDL_GetTicks();

    Uint32 obtained = currentTime - lastTime;
    Uint32 expected = 1000 / 60;

    if (obtained < expected) {
        SDL_Delay(expected - obtained);
    }
}

static void audio_write(int16_t const * samples, size_t count)
{
    SDL_LockAudio();

    int16_t * previous_samples = g_audio_samples;
    size_t previous_count = g_audio_sample_count;

    g_audio_sample_count = previous_count + count;
    g_audio_samples = calloc(g_audio_sample_count * 2, sizeof(int16_t));

    for (size_t index = 0; index < previous_count * 2; ++ index)
        g_audio_samples[ index ] = previous_samples[ index ];

    for (size_t index = 0; index < count * 2; ++ index)
        g_audio_samples[ previous_count * 2 + index ] = samples[ index ];

    free(previous_samples);

    SDL_UnlockAudio();
}

static void audio_callback(void * userdata, Uint8 * stream, int length)
{
    int16_t * available_samples = g_audio_samples;
    size_t available_sample_count = g_audio_sample_count;

    size_t requested_sample_count = length / 2 / 2;
    size_t requested_byte_length = requested_sample_count * 2 * 2;

    size_t providen_sample_count = requested_sample_count < available_sample_count ? requested_sample_count : available_sample_count;
    size_t providen_byte_length = providen_sample_count * 2 * 2;

    memcpy(stream, available_samples, providen_byte_length);
    memset(stream + providen_byte_length, 0, requested_byte_length - providen_byte_length);

    g_audio_samples = NULL;
    g_audio_sample_count = 0;

    if (providen_sample_count < available_sample_count)
        audio_write(available_samples + providen_sample_count * 2, available_sample_count - providen_sample_count);

    free(available_samples);
}

void bridge_virtjs_input_poll_inputs(void)
{
    uint8_t const * keyboard_state = SDL_GetKeyboardState(NULL);

    for (size_t t = 0, T = sizeof(g_input_bindings) / sizeof(*g_input_bindings); t < T; ++ t) {

        unsigned sdl_key_code = g_input_bindings[ t ][ 0 ];
        unsigned retro_key_code = g_input_bindings[ t ][ 1 ];

        g_input_state[ retro_key_code ] = keyboard_state[ sdl_key_code ];

    }
}

bool bridge_virtjs_input_get_state(unsigned port, unsigned key)
{
    if (port != 0)
        return 0;

    return g_input_state[ key ];
}

int bridge_virtjs_timer_next_tick(void (*callback)(void))
{
    assert(g_timer_callback == NULL);

    g_timer_callback = callback;

    return 1;
}

void bridge_virtjs_timer_cancel_tick(int identifier)
{
    if (identifier != 1)
        return ;

    g_timer_callback = NULL;
}

void bridge_virtjs_timer_start(void)
{
    g_timer_is_running = true;

    if (g_timer_has_parent)
        return ;

    g_timer_has_parent = true;

    while (g_timer_is_running)
        timer_iterate();

    g_timer_has_parent = false;
}

void bridge_virtjs_timer_stop(void)
{
    g_timer_is_running = false;
}

bool bridge_virtjs_screen_validate_input_format(unsigned depth, uint32_t r_mask, uint32_t g_mask, uint32_t b_mask, uint32_t a_mask)
{
    return true;
}

void bridge_virtjs_screen_set_input_format(unsigned depth, uint32_t r_mask, uint32_t g_mask, uint32_t b_mask, uint32_t a_mask)
{
    static struct input_format input_format;
    g_input_format = &input_format;

    input_format.depth = depth;

    input_format.r_mask = r_mask;
    input_format.g_mask = g_mask;
    input_format.b_mask = b_mask;
    input_format.a_mask = a_mask;
}

void bridge_virtjs_screen_set_input_size(unsigned width, unsigned height, unsigned pitch)
{
    if (g_window && g_input_width == width && g_input_height == height && g_input_pitch == pitch)
        return ;

    g_input_width = width;
    g_input_height = height;
    g_input_pitch = pitch;

    if (! g_window) {

        SDL_InitSubSystem(SDL_INIT_VIDEO);
        SDL_ClearError();

        g_window = SDL_CreateWindow("archjs", SDL_WINDOWPOS_CENTERED, SDL_WINDOWPOS_CENTERED, g_input_width, g_input_height, SDL_WINDOW_SHOWN);
        g_screen = SDL_GetWindowSurface(g_window);

    } else {

        SDL_SetWindowSize(g_window, g_input_width, g_input_height);

    }
}

void bridge_virtjs_screen_set_input_data(void const * data)
{
    if (! data)
        return ;

    g_pending = SDL_CreateRGBSurfaceFrom((void*) data, g_input_width, g_input_height, g_input_format->depth, g_input_pitch, g_input_format->r_mask, g_input_format->g_mask, g_input_format->b_mask, 0);
}

void bridge_virtjs_screen_flush_screen(void)
{
    if (! g_pending)
        return ;

    SDL_BlitSurface(g_pending, NULL, g_screen, NULL);
    SDL_UpdateWindowSurface(g_window);

    SDL_FreeSurface(g_pending);
    g_pending = NULL;
}

bool bridge_virtjs_audio_validate_input_format(unsigned sample_rate)
{
    return true;
}

void bridge_virtjs_audio_set_input_format(unsigned sample_rate)
{
    SDL_InitSubSystem(SDL_INIT_AUDIO);

    SDL_AudioSpec desired_spec;
    SDL_AudioSpec obtained_spec;

    desired_spec.freq = sample_rate;
    desired_spec.format = AUDIO_S16SYS;
    desired_spec.channels = 2;
    desired_spec.samples = 1024;
    desired_spec.callback = audio_callback;
    desired_spec.userdata = NULL;

    SDL_OpenAudio(&desired_spec, &obtained_spec);

    SDL_PauseAudio(0);

}

void bridge_virtjs_audio_push_sample_batch(int16_t const * samples, unsigned count)
{
    audio_write(samples, count);
}
