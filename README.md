# Archjs

Archjs is a [Libretro](http://www.libretro.com/) frontend dedicated to one specific purpose : being easily compiled to Javascript using [Emscripten](http://kripken.github.io/emscripten-site/).

Once compiled to Javascript, the built scripts export [Virtjs](http://virtjs.com/) engines, which can then be instanciated. Communication between the engines and the page work just like any other Virtjs engine : through a set of [devices](http://virtjs.com/documentation/instanciating-an-emulator/). Thanks to this, it is very easy to manipulate the emulators using a pure Javascript API, with all its benefits (the main one being that once an Archjs engine is built, it usually doesn't have to be rebuilt except when updating the emulator version).

## Supported cores

Since we're only a libretro frontend, we should work with most emscripten-compatible cores. However, it is not so common, so you should check each one to see if they support it. The following cores have been tested with Archjs:

  - [Gambatte](https://github.com/libretro/gambatte-libretro)
  - [VBA-Next](https://github.com/libretro/vba-next)

## Multi-format cores

Some cores (such as VBA-next) support multiple kinds of games (Gameboy, Gameboy Color, Gameboy Advance). In such event, you may use the `fileName` option of the `loadArrayBuffer` method to tell the emulator about the actual file name (since they often rely on the file extension to set the right emulator). However, each core also has a main extension (such as `.gb` for Gambatte, or `.gba` for VBA-Next) which will be used if you omit the file name option.

## SDL frontend

In order to be easily debugged, Archjs ships with an additional SDL frontend. It is used only when the frontend is built without using emscripten, and is not there in Javascript builds (which are expected to use the regular Virtjs devices). The SDL build support save files via the F1 (Quick Save) and F2 (Quick Load) keys, which may only be used if a save path has been specified in the command line (the file does not have to exist at the time the program is launched).

```
arcanis@~/Projets/archjs # ./dist/archjs-gambatte
Usage: ./dist/archjs-gambatte <rom> [<state>]
```

## License

Archjs is supported and maintained by the [Start9](https://github.com/start9/) organization. The frontend is available under the [GPL v3 license](https://www.gnu.org/copyleft/gpl.html).

## Contributing

If you notice a bug or want to suggest a feature, feel free to open an issue or pull request on the repository. However, keep in mind that the focus of Archjs is to remain simple (in order to be easily compiled and heavily optimized by Emscripten).

We also hang out on the #start9-dev irc network on Freenode, so feel free to join us there.
