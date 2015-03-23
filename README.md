# Archjs

Archjs is a [Libretro](http://www.libretro.com/) frontend dedicated to one specific purpose : being easily compiled to Javascript using [Emscripten](http://kripken.github.io/emscripten-site/).

Once compiled to Javascript, the scripts export [Virtjs](http://virtjs.com/) engines (available in the `Archjs` global), which can then be instanciated just like any other engine ([documentation here](http://virtjs.com/documentation/instanciating-an-emulator/)).

## Supported cores

Since we're only a libretro frontend, we should work with most emscripten-compatible libretro cores. However, it is not so common, so you should check each one to see if they support it. The following cores have been tested with Archjs:

  - [Gambatte](https://github.com/libretro/gambatte-libretro)
  - [VBA-Next](https://github.com/libretro/vba-next)

## Multi-format cores

Some cores may support multiple kinds of games. In such event, you may use the file name option of the `loadArrayBuffer()` method to tell the emulator about the actual file name (since they often rely on the file extension to select the right emulator). However, each core also has a main extension (such as `.gb` for Gambatte, or `.gba` for VBA-Next) which will be used if you omit to specify the arraybuffer file name.

## SDL frontend

In order to be easily debugged, Archjs ships with a small SDL frontend, mimicking Virtjs devices.

**Note** This frontend is only used when `make` is called without using emscripten, and is not present in the dist Javascript builds, which does not use the SDL at all (we instead except you to plug whatever device you want to usexs).

## License

Archjs is supported and maintained by the [Start9](https://github.com/start9/) organization. The frontend is available under the [GPL v3 license](https://www.gnu.org/copyleft/gpl.html).

## Contributing

If you notice a bug or want to suggest a feature, feel free to open an issue or pull request on the repository. However, keep in mind that the focus of Archjs is to remain simple (in order to be both easily compiled and heavily optimized by Emscripten).

We also hang out on the #start9-dev irc network on Freenode, so feel free to join us there.
