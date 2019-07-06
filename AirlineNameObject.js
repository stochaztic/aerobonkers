import { ReadWriteObject } from 'randomtools-js';
import nameparts from './nameparts.js';

class AirlineNameObject extends ReadWriteObject {
/*
* A ReadWriteObject defines the basic class for data that will be read, randomized,
* and written back to the ROM. It can be used either entirely as a static class, or
* you can create new instances of individual objects. It should be used for data that
* is not structured as a simple table (for which you should use TableObject).
*
* The only necessary method to be implemented is:
*   static shouldRandomize(): Determines whether static fullRandomize() should be called
*
* If you write the class to create new instances, instead of being used entirely as
* a static class, you will also likely need to define:
*   writeData(): Determines how to write the data, either modified or unmodified.
*   constructor(config): If you override this method, be sure to call its super.
*       When you call this constructor, the config object expects a pointer attribute
*       with the rom offset of the object.
*   static initialize(context): If you override this method, be sure to call its super.
*       The best location to create the new instances of the object.
*
* Defining or overriding further methods is up to you, as using this class is intended 
* to be very flexible to account for many circumstances. Often, you may write directly 
* to the ROM using this.context.rom in various places. AirlineNameObject is intended as
* an example of a common usage that involves creating new instances.
*/
    static shouldRandomize() {
        return this.context.specs.flags.a;
    }

    static initialize(context) {
        super.initialize(context);

        let pointer = 0x764d3;
        let airlineCount = 32;

        while(airlineCount > 0) {
            const newObject = new AirlineNameObject({pointer: pointer});
            pointer += (newObject.oldData.name.length + 1);
            airlineCount -= 1;
        }
    }
    
    constructor(config) {
        super(config);
        this.readData();
    }

    randomize() {
        const n1size = this.context.random.randint(2, this.oldData.name.length);
        const n2size = this.oldData.name.length - n1size;
        const n1 = this.context.random.choice(nameparts.filter(n => n.length === n1size));
        const n2 = this.context.random.choice(nameparts.filter(n => n.length === n2size));
        this.data.name = `${n1}${n2}`;
    }

    readData() {
        this.oldData.name = "";
        let characterPointer = this.pointer;
        while(this.context.rom[characterPointer] !== 0) {
            this.oldData.name += String.fromCharCode(this.context.rom[characterPointer]);
            characterPointer += 1;
        }
        
        this.data.name = this.oldData.name;
    }

    writeData() {
        if(this.data.name.length > this.oldData.name.length) {
            throw new Error(`Airline name at index ${this.index} too long: ${this.data.name}`);
        }
        const charArray = this.data.name.split("").map(x => x.charCodeAt(0));
        while(charArray.length < this.oldData.name.length) {
            charArray.push(0);
        }
        this.context.rom.set(charArray, this.pointer);
    }
}

AirlineNameObject._displayName = "airline names";
export default AirlineNameObject;