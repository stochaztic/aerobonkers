#!/usr/bin/env node
import program  from 'commander';
import fs from 'fs';
import { execute } from './randomizer.js';


program 
    .usage('[options] <file>')
    .option('--no-data', 'Do not randomize plane data')
    .option('--no-names', 'Do not randomize airline names')
    .option('-o, --output <name>', 'Output file name', 'aerobonkers-output.sfc')
    .parse(process.argv);
 

if(!program.args || program.args.length !== 1) {
    console.error("Please supply the filename of an Aerobiz Supersonic ROM.");
    process.exit(1);
}

console.log("Rom found.");
fs.readFile(program.args[0], (error, fileBuffer) => {
    if (error) {
        console.error("Error when reading file.");
        console.error(error);
        return;
    };

    // The randomizer will remove the SNES header if it exists and throw an error
    // if the file is not an appropriate size for a SNES ROM, so we do not need to
    // process or check the file beforehand.

    // Options specific to the console use of the randomizer. They will be merged
    // with shared options inside of randomizer.js.
    const options = {
        romfile: fileBuffer,
        specs: {
            flags: {
                a: program.names,
                p: program.data,
                crazy: false,
            }
        },
        hooks: {
            message: text => console.log(text),
            error: text => console.error(text),
        },
    }

    execute(options).then(newROM => {
        fs.writeFile(program.output, newROM, (error) => {
            if (error) {
                console.error("Error when writing file.");
                console.error(error);
                return;
            };
            console.log(`Randomization successful. Saved to ${program.output}`);
        });
    }).catch(console.error);

});