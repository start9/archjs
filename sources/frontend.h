#pragma once

#include <stdbool.h>
#include <stddef.h>

#ifdef __cplusplus
extern "C" {
#endif

void frontend_start(void);
bool frontend_status(void);
void frontend_stop(void);

int frontend_load_game(char const * path);
int frontend_unload_game(void);

void frontend_set_state_path(char const * path);

int frontend_load_state(void);
int frontend_save_state(void);

int frontend_set_state(void const * state, size_t size);
int frontend_get_state(void const ** state, size_t * size);
int frontend_reset_state(void);

#ifdef __cplusplus
}
#endif
