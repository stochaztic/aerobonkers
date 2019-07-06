# AeroBonkers - Aerobiz Supersonic Randomizer
AeroBonkers is a simple JavaScript-based randomizer for Aerobiz Supersonic for the Super Nintendo. The primary purpose of this randomizer is to be an example of use of the library [randomtools-js](http://github.com/stochaztic/randomtools-js), which allows anyone to develop a JavaScript-based randomizer.

Since this randomizer is mainly an educational tool, only two aspects of the game are randomized: the statistics of the planes available in each scenario, and the suggested airline names given at the beginning of the game.

## Running the program
There are two ways to run AeroBonkers: command line and website. 

* Command line: `node --experimental-modules index.js filename.sfc`
  * There are a few flags you can set via the command line. Use `--help` for more information.
* Website: Run a local webserver with a program such as `serve` and access `index.html`.
  * Note that this website is not suitable for production deployment. See later in this document for information on deploying a website.

## Structure
To learn how to develop your own randomizer with the `randomtools-js` framework, looking at the structure of this example randomizer is the quickest way to understand how to build your own.

The files involved can broadly be broken into two categories: The entry point files: `index.js` and `index.html`; and the actual randomizer files: `randomizer.js`, `PlaneDataObject.js`, and `AirlineNameObject.js`. Each file has a number of inline comments to help you understand its role in the system.`

### [index.js](https://github.com/stochaztic/aerobonkers/blob/master/index.js)
`index.js` is an example of how to run the randomizer via the command line. The tasks it handles are to load the data of an existing ROM into a buffer, configure a partial options object based on the user input, handle displaying messages to the user, and handle saving the file when randomization is complete.

### [index.html](https://github.com/stochaztic/aerobonkers/blob/master/index.html)
`index.html` is an example of how to run the randomizer via a website. It handles the exact same tasks as `index.js`, just via a browser interface. This file does not require a build system. Note this is not a production-ready file; I would recommend using a system such as `create-react-app` to create your website-based randomizer. [eb-randomizer](http://github.com/stochaztic/eb-randomizer) is `create-react-app`-based.

### [randomizer.js](https://github.com/stochaztic/aerobonkers/blob/master/randomizer.js)
This is the main logic of the randomizer. It accepts the partial configuration objects from whichever frontend is used, loads the objects that are to be randomized, finishes the configuration, starts the execution of the randomization, and finalizes the process after the result is returned from the `randomtools-js` framework.

Fundamentally, the way that `randomtools-js` works is that a number of classes inheriting from either `TableObject` or `ReadWriteObject` are loaded into a `context`. Upon execution, the system determines the proper order for each step of the randomization process, including loading initial data and saving final data, to be called on each class. Throughout the system, the `context` remains available, allowing you to do such tasks as check the flags via `context.specs.flags`, use the `context.random` library to get a random number or a choice from an array, or write directly to the new ROM via `context.rom`.

`ReadWriteObject`-inheriting classes have a number of convenience methods already implemented to facilitate the randomization process. `TableObject`-inheriting classes, designed to be used for tabular data within the ROM, have even more convenience methods, and oftentimes will not need any code at all to be written, just configuration data set. The two following files are examples of how to inherit from each of these classes.

### [PlaneDataObject.js](https://github.com/stochaztic/aerobonkers/blob/master/PlaneDataObject.js)
`PlaneDataObject.js` is an example of a class inheriting from `TableObject`. It has an object called `tableSpecs` that defines the structure of the data inside the ROM. By simply setting the `tableSpecs`, the `shouldRandomize`, and one or more of the ways attributes should be randomized, you can easily have an entire table of data being randomized with no specific code being written. This also allows you to easily iterate on how the randomization happens in a data-driven way until your randomizer is performing as you design.

Of course, you can also do code-driven randomization in these classes as well. The `TableObject` class has a large number of methods that can be overridden for custom behavior. `PlaneDataObject.js` has a few examples of this. Check the inline comments for more details.

### [AirlineNameObject.js](https://github.com/stochaztic/aerobonkers/blob/master/AirlineNameObject.js)
`AirlineNameObject` is an example of a class inheriting from `ReadWriteObject`. As it is not working on tabular data, there are fewer automatic conveniences provided to you by the parent class, so you will have to write more code yourself. `ReadWriteObject`-inheriting classes can be used either entirely statically, or can have individual instances similar to the `TableObject` classes; the `AirlineNameObject` is an example of the latter.

## Steps for improvement
By following the example of this Aerobiz Supersonic randomizer, you should be able to use `randomtools-js` to create a randomizer for any game in which you have identified data, especially tabular data, and have a strategy for changing it. However, there are a number of ways you can improve the result and the user experience from this basic structure. Many of these steps have already been implemented in the [EarthBound Randomizer](https://earthbound.app) ([eb-randomizer on GitHub](http://github.com/stochaztic/eb-randomizer)), so you can look in that codebase for further ideas and help.

1. Use `create-react-app` or a similar framework for your web-based randomizer. This is the most important of these tips. These frameworks allow you to build a website bundle and deploy it easily at any location that can serve static files. Additionally, as you make your website frontend more complex, you will want the flexibility of one of these frameworks rather than writing all of your HTML and DOM-modifying JavaScript by hand.
1. Use a common Flag Definition file. In the EarthBound Randomizer, I have a file named [flagDescriptions.js](https://github.com/stochaztic/eb-randomizer/blob/master/src/flagDescriptions.js) that the React front-end uses to build the interface for the user to select the flags that they want. This file can also be used by the randomizer logic. In complex projects, you may find other ways to structure data to make it available to both front-end and "back-end". (For example, eb-randomizer has sprite definition files for the custom player sprites used by both halves of the program.)
1. If your randomizer becomes very complex such that execution takes a large amount of time, use Web Workers to offload the "back-end" part of your randomizer to a background thread. This allows the UI to stay up to date, and using the existing hooks system, your UI can update with the messages created by the framework during execution to let the user know how the process is proceeding.
1. Cache the ROM the user uploads in their browser's storage, so they do not need to re-select it every time.
1. Create a link upon creation of the ROM that will allow another user to click on that link and get the exact same setup, flags, and seed as the user who initially generated the ROM. This allows your users to easily share links to have races.
1. There are a number of features of `randomtools-js` I have not listed here, such as hooks and patches, that can allow for a more complex randomizer. Please let me know if you need more information about a specific part of the framework, or want to contribute to its further development. My entire goal in making this available was to encourage additional randomizer development, so please let me know if it is helping! The easiest way to reach me is [@stochaztic](https://twitter.com/stochaztic) on Twitter.

## The rationale for fully web-based randomizers
If you are merely interested in the technical details of how to use the `randomtools-js` framework, you can stop reading now. The following is my rationale for why I believe entirely JavaScript and web-based randomizers are the best option for creating a randomizer in the modern day.

Currently, a large number of randomizers fall into one of two camps: Either an executable that the user downloads to their machine, or a web-based randomizer that calls an executable on a server. Both of these methods have major drawbacks compared to fully-web-based randomizers.

Downloadable randomizers first face the obstacle of many security-conscious users not wanting to run an executable on their machine. Even for those who do want to, with the variety of different operating systems and platforms available, ensuring you have a download available for every type of computer is difficult--impossible, if you consider those people working on Chrome OS or mobile operating systems. Finally, downloadable randomizers make releasing updates a frustrating exercise, splintering the community as not everyone will get the updates you produce. All of these factors combine to drastically decrease the potential audience for your randomizer.

Partially web-based randomizers, which have a web-based frontend and then run an executable on their own servers before returning the randomized ROM to the user, do solve the above problems. Accessing a website for a randomizer is an excellent experience for a user; they do not need to download anything, they always have the latest version available, and they are only seconds away from hearing about a randomizer for the first time to being ready to play.

However, the partial-web-based system creates some new problems. First and foremost among them is server resources. You will have to pay for a server that can run your randomizer program, and you are centralizing the workload. If you have a very complex randomizer, or a number of people are generating ROMs at once, you can easily create very long loading times for everyone. If your backend is in a different language than JavaScript, you now need to know two languages to create your program, and you have made it much harder or impossible to use shared resources on both sides as recommended above. Furthermore, you are putting yourself at greater legal risk, as ROM files will be, even if temporarily, existing on public servers under your control and sent from your servers to end-users.

Fully web-based randomizers, however, run entirely in JavaScript on the user's machine, so they can be just as fast as downloadable randomizers (modern browsers have put astounding amounts of resources into making JavaScript more efficient). You don't even need a server to host your randomizer; all you need is a site that can host static files, which can be easy, fast, free, and never go down due to load. (Personally I use [Firebase](https://firebase.com) for the Google-backed CDNs and easy command-line deployment interface.) Every downside I listed of each of the two methods above are avoided.

There are a few downsides to fully web-based randomizers. First, you cannot hide your data, as it is all visible in the JavaScript source of your randomizer. Personally I consider this an upside, as I prefer open-source development for my randomizers for the greater sense of community and sharing in a project. Second, some people dislike the use of JavaScript; however, since I consider at least a web frontend a minimal requirement to be accessible to everyone, you will need to use JavaScript anyway, so standardizing on it as your single programming language for your randomizer is an easy solution. Finally, some people prefer downloadable randomizers as they can always have them permanently available, even if the person who made it disappears. I agree that this is a good thing to have, which is another reason I keep my randomizers open-source; anyone can clone the randomizer from GitHub and run it locally if they so desire.

## Credits
The `randomtools-js` framework began as a port of the Python framework [randomtools](https://github.com/abyssonym/randomtools) by [Abyssonym](https://twitter.com/abyssonym). Many thanks to him for helping me get started in randomizer development. Thanks to [tsjonte](https://twitter.com/tsjonte) for continual playtesting and support.

I am most easily reachable [@stochaztic](https://twitter.com/stochaztic) on Twitter.