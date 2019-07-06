import RandomTools from 'randomtools-js';
import AirlineNameObject from './AirlineNameObject.js';
import PlaneDataObject from './PlaneDataObject.js';


export function execute(options) {
    if(!options || !options.romfile) {
        throw new Error("No ROM specified.");
    }
    if(!options.specs || !options.specs.flags) {
        throw new Error("No flags specified.");
    }
    options.specs.isSNES = true;
    options.specs.lorom = true;
    options.specs.title = "AEROBONKERS";
    options.specs.version = 1;
    options.specs.seed = options.specs.seed || Math.floor(Math.random() * Math.floor(99999999));

    // Define all objects that will be read from the ROM and written back to it.
    // These should all inherit from ReadWriteObject (or TableObject).
    const readWriteObjects = [
        AirlineNameObject,
        PlaneDataObject,
    ];

    // You can define an afterOrder if one object has a dependency on one or more others.
    // (This randomizer does not actually have a depenency, this is just used for example.)
    PlaneDataObject.afterOrder = [AirlineNameObject];

    // You can increase the randomDegree of any class or any individual object
    // to make all randomization that uses the normal distribution functions wider.
    if (options.specs.flags.crazy) {
        PlaneDataObject.randomDegree = 0.9;
    }
    
    // You can add patches, defined as a list of indexes with a list of bytes
    // to write to those indexes, to be added to the randomizer. The patches
    // will be written before randomization and verified after randomization
    // to ensure they were not modified. See eb-randomizer for usage examples.
    const patches = [];

    try {
        const context = {
            rom: options.romfile,
            specs: options.specs,
            patches: patches,
            objects: readWriteObjects,
            hooks: options.hooks,
        }

        const newROM = RandomTools.execute(context);
        return newROM;
    }
    catch (e) {
        throw new Error(`Error during RandomTools execution: ${e}`);
    }
}