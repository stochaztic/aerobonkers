import { TableObject } from 'randomtools-js';

class PlaneDataObject extends TableObject {
/*
* A TableObject defines a class where tabular data in a ROM is loaded into
* rows, assigned attributes based on the structure of the table, and is randomized.
*
* Each class where shouldRandomize returns true will proceed through the 
* steps of randomization in the following order:
*     Intershuffle (intershuffleAttributes)
*     Randomize (randomizeAttributes)
*     Mutate (mutateAttributes)
* 
* It is unlikely any one class will use all steps of randomization.
* All of them are used here for explanatory purposes. Any given attribute
* may appear in none, one, or multiple of each of the steps.
* 
* Finally, all classes will Cleanup regardless of shouldRandomize value.
* 
* All of these steps have static methods and individual methods that can be
* overwritten for more direct control of the randomization process, but the 
* default settings allow for quick development of data-driven table randomization.
*/

    static shouldRandomize() {
        return this.context.specs.flags.p;
    }
    
    // By default, the row's index is used for rank, which is used to determine which
    // rows are similar to each other. You can override this behavior, as shown here.
    get rank() {
        return this.oldData.price;
    }
    
    cleanup() {
        // Ensure seller has not changed
        console.assert(this.data.seller === this.oldData.seller); 
    }
}

// For intershuffleAttributes, the class is taken as a whole, and values are shuffled
// between "nearby" rows. "Nearby" is determined by rank. Attributes nested within an
// array will remain together when intershuffled.
PlaneDataObject.intershuffleAttributes = [
    "speed", ["fuel", "maintenance"],
];

// For randomizeAttributes, each row takes a random value from among all rows' old values.
// No concept of nearby, rank, or normal distribution is used; this is strictly random.
PlaneDataObject.randomizeAttributes = [
    "unknown1", "unknown2",
];
    
// For mutateAttributes, each row's values are changed directly by one of several methods. 
PlaneDataObject.mutateAttributes = {
    // For null, the range of valid values is determined from all of the rows of the table, 
    // and the value is mutated within those bounds. This is the most common 
    // mutateAttribute value and will do the right thing the majority of the time.
    "miles_range": null, 
    "seats": null,
    "price": null,

    // An array of two integers will define bounds the value will be mutated between.
    "fuel": [1, 63],   
    "maintenance": [1, 63],
    
    // A closure can be passed for custom mutation logic.
    "speed": (o) => {   
        if(o.context.random.random() < 0.25) { // A quarter of the time, double the speed.
            return Math.floor(o.data.speed / 2); // Smaller values are faster
        }
        return o.data.speed;
    },

    // An example type not used in this randomizer:
    // "drop_item_index": ItemObject,
    // Setting another TableObect-inheriting class as the value indicates this is an index into
    // that class, and the logic of that class's rank will be used to determine what a similar
    // value to be mutated into is.

    // In all instances except closure, the mutation is done via a normal distribution.
};

PlaneDataObject.tableSpecs = {
    text: [  // The attribute structure of the tabular data to be randomized.
        "seller,1",
        "seats,1",
        "miles_range,2", // This value is not the literal miles_range but partially determines it.
        "price,2",
        "year,1",
        "speed,1",
        "fuel,1",
        "maintenance,1",
        "unknownbitfield,bit:unknown1 unknown2 unknown3 unknown4 unknown5 unknown6 unknown7 unknown8",
        // These values can be loaded from external text files using array-loader instead of written here.
        // First value will be the attribute name in .data and .oldData, second value is byte length.
        // If second value is "bit", it is a single byte that is a bitfield as seen above.
        // Some features are not shown here:
        //   1. A list, for example, "color,32x2,list".
        //   2. A fixed-length ASCII string, for example, "attackname,10,str".
        //   3. Using "?" as the length for complexly-stored data that must have getters and setters custom-written.
    ],
    
    count: 53, // The number of rows of tabular data present.
    pointer: 0x76c1b, // The byte offset of the beginning of the table (PC-addressing, not SNES-addressing)
};

PlaneDataObject._displayName = "plane data";
export default PlaneDataObject;