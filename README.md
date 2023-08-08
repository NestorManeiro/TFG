#TFG

  Work In Progres... I guess

# Index

- [Information](#Information)
- [Notes](#notes)
- [Maintenance](#maintenance)



# Information

  This webpage allows us, using a shape, to generate a figure through C++ code that has been adapted using WebAssembly.
  
  Users could modify the figure, save it as an image, or upload/download their own shape.
  
  For modifications, users can move circles, increase the radius of these circles, or adjust the smooth factor (that affects their connections with other circles). Users can also add circles, delete them, add   
  connections, insert circles along segments, create random figures, and generate similar figures.


# Notes

  Tracking of features [Documento en Google Docs](https://docs.google.com/document/d/1GtQtelN7FGx5gK_FEvt-q0SWJWtZPghOxBOqhI2w_kc/edit).

  blackbox.js: Created with WebAssembly.
  handleEvents.js: Contains all the functions used for event handling.
  init.js: Initializes all variables and adds all the necessary events.
  tools.js: Contains various implemented functions.
  app.js: Handles everything related to managing WebAssembly and initializing the webpage, such as loading the initial shape.txt.


# Maintenance ###

  If you make any change inside the "BranchedShapesEdition" folder, you will need to use the /script.bat (You need to change the routes).
  This will make inside the folder:
  
    -blackbox.js
    -blackbox.wasm
  
  On blackbox.js you need to swap:
  
      var _free = createExportWrapper("free");
  
  to this:
  
      var _free = Module["_free"] = createExportWrapper("free");
  
  Then just move this files to the root.
  
