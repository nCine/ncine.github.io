
  var Module = typeof Module !== 'undefined' ? Module : {};
  
  if (!Module.expectedDataFileDownloads) {
    Module.expectedDataFileDownloads = 0;
  }
  Module.expectedDataFileDownloads++;
  (function() {
   var loadPackage = function(metadata) {
  
      var PACKAGE_PATH;
      if (typeof window === 'object') {
        PACKAGE_PATH = window['encodeURIComponent'](window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf('/')) + '/');
      } else if (typeof location !== 'undefined') {
        // worker
        PACKAGE_PATH = encodeURIComponent(location.pathname.toString().substring(0, location.pathname.toString().lastIndexOf('/')) + '/');
      } else {
        throw 'using preloaded data can only be done on a web page or in a web worker';
      }
      var PACKAGE_NAME = '/home/encelo/nCine/WEB/nCine-release/tests/nCine-data.data';
      var REMOTE_PACKAGE_BASE = 'nCine-data.data';
      if (typeof Module['locateFilePackage'] === 'function' && !Module['locateFile']) {
        Module['locateFile'] = Module['locateFilePackage'];
        err('warning: you defined Module.locateFilePackage, that has been renamed to Module.locateFile (using your locateFilePackage for now)');
      }
      var REMOTE_PACKAGE_NAME = Module['locateFile'] ? Module['locateFile'](REMOTE_PACKAGE_BASE, '') : REMOTE_PACKAGE_BASE;
    
      var REMOTE_PACKAGE_SIZE = metadata['remote_package_size'];
      var PACKAGE_UUID = metadata['package_uuid'];
    
      function fetchRemotePackage(packageName, packageSize, callback, errback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', packageName, true);
        xhr.responseType = 'arraybuffer';
        xhr.onprogress = function(event) {
          var url = packageName;
          var size = packageSize;
          if (event.total) size = event.total;
          if (event.loaded) {
            if (!xhr.addedTotal) {
              xhr.addedTotal = true;
              if (!Module.dataFileDownloads) Module.dataFileDownloads = {};
              Module.dataFileDownloads[url] = {
                loaded: event.loaded,
                total: size
              };
            } else {
              Module.dataFileDownloads[url].loaded = event.loaded;
            }
            var total = 0;
            var loaded = 0;
            var num = 0;
            for (var download in Module.dataFileDownloads) {
            var data = Module.dataFileDownloads[download];
              total += data.total;
              loaded += data.loaded;
              num++;
            }
            total = Math.ceil(total * Module.expectedDataFileDownloads/num);
            if (Module['setStatus']) Module['setStatus']('Downloading data... (' + loaded + '/' + total + ')');
          } else if (!Module.dataFileDownloads) {
            if (Module['setStatus']) Module['setStatus']('Downloading data...');
          }
        };
        xhr.onerror = function(event) {
          throw new Error("NetworkError for: " + packageName);
        }
        xhr.onload = function(event) {
          if (xhr.status == 200 || xhr.status == 304 || xhr.status == 206 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            var packageData = xhr.response;
            callback(packageData);
          } else {
            throw new Error(xhr.statusText + " : " + xhr.responseURL);
          }
        };
        xhr.send(null);
      };

      function handleError(error) {
        console.error('package error:', error);
      };
    
        var fetchedCallback = null;
        var fetched = Module['getPreloadedPackage'] ? Module['getPreloadedPackage'](REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE) : null;

        if (!fetched) fetchRemotePackage(REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE, function(data) {
          if (fetchedCallback) {
            fetchedCallback(data);
            fetchedCallback = null;
          } else {
            fetched = data;
          }
        }, handleError);
      
    function runWithFS() {
  
      function assert(check, msg) {
        if (!check) throw msg + new Error().stack;
      }
  Module['FS_createPath']('/', 'fonts', true, true);
Module['FS_createPath']('/', 'scripts', true, true);
Module['FS_createPath']('/', 'sounds', true, true);
Module['FS_createPath']('/', 'textures', true, true);
Module['FS_createPath']('/textures', 'testformats', true, true);

      /** @constructor */
      function DataRequest(start, end, audio) {
        this.start = start;
        this.end = end;
        this.audio = audio;
      }
      DataRequest.prototype = {
        requests: {},
        open: function(mode, name) {
          this.name = name;
          this.requests[name] = this;
          Module['addRunDependency']('fp ' + this.name);
        },
        send: function() {},
        onload: function() {
          var byteArray = this.byteArray.subarray(this.start, this.end);
          this.finish(byteArray);
        },
        finish: function(byteArray) {
          var that = this;
  
          Module['FS_createDataFile'](this.name, null, byteArray, true, true, true); // canOwn this data in the filesystem, it is a slide into the heap that will never change
          Module['removeRunDependency']('fp ' + that.name);
  
          this.requests[this.name] = null;
        }
      };
  
          var files = metadata['files'];
          for (var i = 0; i < files.length; ++i) {
            new DataRequest(files[i]['start'], files[i]['end'], files[i]['audio']).open('GET', files[i]['filename']);
          }
  
    
      function processPackageData(arrayBuffer) {
        assert(arrayBuffer, 'Loading data file failed.');
        assert(arrayBuffer instanceof ArrayBuffer, 'bad input to processPackageData');
        var byteArray = new Uint8Array(arrayBuffer);
        var curr;
        
          // Reuse the bytearray from the XHR as the source for file reads.
          DataRequest.prototype.byteArray = byteArray;
    
            var files = metadata['files'];
            for (var i = 0; i < files.length; ++i) {
              DataRequest.prototype.requests[files[i].filename].onload();
            }
                Module['removeRunDependency']('datafile_/home/encelo/nCine/WEB/nCine-release/tests/nCine-data.data');

      };
      Module['addRunDependency']('datafile_/home/encelo/nCine/WEB/nCine-release/tests/nCine-data.data');
    
      if (!Module.preloadResults) Module.preloadResults = {};
    
        Module.preloadResults[PACKAGE_NAME] = {fromCache: false};
        if (fetched) {
          processPackageData(fetched);
          fetched = null;
        } else {
          fetchedCallback = processPackageData;
        }
      
    }
    if (Module['calledRun']) {
      runWithFS();
    } else {
      if (!Module['preRun']) Module['preRun'] = [];
      Module["preRun"].push(runWithFS); // FS is not initialized yet, wait for it
    }
  
   }
   loadPackage({"files": [{"filename": "/fonts/DroidSans32_256.fnt", "start": 0, "end": 21882, "audio": 0}, {"filename": "/fonts/Roboto-Regular32_256.png", "start": 21882, "end": 32178, "audio": 0}, {"filename": "/fonts/NotoSerif-Regular32_256.png", "start": 32178, "end": 42898, "audio": 0}, {"filename": "/fonts/DroidSans32_256_8.ktx", "start": 42898, "end": 108534, "audio": 0}, {"filename": "/fonts/OpenSans-Regular-19.fnt", "start": 108534, "end": 211260, "audio": 0}, {"filename": "/fonts/noto_serif_medium_50.fnt", "start": 211260, "end": 229723, "audio": 0}, {"filename": "/fonts/OpenSans-Regular32_256.fnt", "start": 229723, "end": 268563, "audio": 0}, {"filename": "/fonts/OpenSans-Regular.fnt", "start": 268563, "end": 360701, "audio": 0}, {"filename": "/fonts/NotoSerif-Regular32_256.fnt", "start": 360701, "end": 382817, "audio": 0}, {"filename": "/fonts/DroidSans32_256_888.ktx", "start": 382817, "end": 579525, "audio": 0}, {"filename": "/fonts/OpenSans-Regular32_256.png", "start": 579525, "end": 589569, "audio": 0}, {"filename": "/fonts/Roboto-Regular32_256.fnt", "start": 589569, "end": 626969, "audio": 0}, {"filename": "/fonts/NotoSans-Regular32_256.png", "start": 626969, "end": 637093, "audio": 0}, {"filename": "/fonts/noto_serif_medium_50.png", "start": 637093, "end": 755810, "audio": 0}, {"filename": "/fonts/OpenSans-Bold-19_0.png", "start": 755810, "end": 773064, "audio": 0}, {"filename": "/fonts/DroidSans32_256.png", "start": 773064, "end": 784595, "audio": 0}, {"filename": "/fonts/OpenSans-Regular_0.png", "start": 784595, "end": 796518, "audio": 0}, {"filename": "/fonts/DroidSans32_256_8888.ktx", "start": 796518, "end": 1058762, "audio": 0}, {"filename": "/fonts/OpenSans-Bold-19.fnt", "start": 1058762, "end": 1161485, "audio": 0}, {"filename": "/fonts/NotoSans-Regular32_256.fnt", "start": 1161485, "end": 1183599, "audio": 0}, {"filename": "/fonts/DroidSans32_256_88.ktx", "start": 1183599, "end": 1314771, "audio": 0}, {"filename": "/fonts/OpenSans-Regular-19_0.png", "start": 1314771, "end": 1331291, "audio": 0}, {"filename": "/scripts/test_vec2.lua", "start": 1331291, "end": 1332772, "audio": 0}, {"filename": "/scripts/init.lua", "start": 1332772, "end": 1333190, "audio": 0}, {"filename": "/scripts/test_vec3.lua", "start": 1333190, "end": 1334760, "audio": 0}, {"filename": "/scripts/export_lua_api.lua", "start": 1334760, "end": 1335852, "audio": 0}, {"filename": "/scripts/test_color.lua", "start": 1335852, "end": 1336715, "audio": 0}, {"filename": "/scripts/reload.lua", "start": 1336715, "end": 1337453, "audio": 0}, {"filename": "/scripts/script.lua", "start": 1337453, "end": 1342156, "audio": 0}, {"filename": "/sounds/coins.ogg", "start": 1342156, "end": 1355459, "audio": 1}, {"filename": "/sounds/coins.wav", "start": 1355459, "end": 1395283, "audio": 1}, {"filename": "/sounds/explode.ogg", "start": 1395283, "end": 1510960, "audio": 1}, {"filename": "/sounds/waterdrop.wav", "start": 1510960, "end": 1632234, "audio": 1}, {"filename": "/sounds/explode.wav", "start": 1632234, "end": 2347558, "audio": 1}, {"filename": "/sounds/chiptune_loop.ogg", "start": 2347558, "end": 2607158, "audio": 1}, {"filename": "/sounds/waterdrop.ogg", "start": 2607158, "end": 2633354, "audio": 1}, {"filename": "/sounds/c64.ogg", "start": 2633354, "end": 2962330, "audio": 1}, {"filename": "/textures/megatexture_256_cutout.png", "start": 2962330, "end": 2983256, "audio": 0}, {"filename": "/textures/texture2_cutout.png", "start": 2983256, "end": 2985493, "audio": 0}, {"filename": "/textures/texture1_cutout.png", "start": 2985493, "end": 2989754, "audio": 0}, {"filename": "/textures/spritesheet.png", "start": 2989754, "end": 2993997, "audio": 0}, {"filename": "/textures/texture4_cutout.png", "start": 2993997, "end": 3000721, "audio": 0}, {"filename": "/textures/texture1.png", "start": 3000721, "end": 3005830, "audio": 0}, {"filename": "/textures/texture3.png", "start": 3005830, "end": 3013986, "audio": 0}, {"filename": "/textures/megatexture_256.png", "start": 3013986, "end": 3036131, "audio": 0}, {"filename": "/textures/texture2.png", "start": 3036131, "end": 3039470, "audio": 0}, {"filename": "/textures/texture4.png", "start": 3039470, "end": 3044917, "audio": 0}, {"filename": "/textures/texture3_cutout.png", "start": 3044917, "end": 3053364, "audio": 0}, {"filename": "/textures/smoke_256.png", "start": 3053364, "end": 3095767, "audio": 0}, {"filename": "/textures/testformats/texture_512_RGB_888.pvr", "start": 3095767, "end": 3882266, "audio": 0}, {"filename": "/textures/testformats/texture_512_RGB_888.ktx", "start": 3882266, "end": 4668798, "audio": 0}, {"filename": "/textures/testformats/texture_512_RGB.webp", "start": 4668798, "end": 4679682, "audio": 0}, {"filename": "/textures/testformats/texture_512_RGBA_4444.pvr", "start": 4679682, "end": 5204037, "audio": 0}, {"filename": "/textures/testformats/texture_512_RGBA_DXT3.dds", "start": 5204037, "end": 5466309, "audio": 0}, {"filename": "/textures/testformats/texture_512_RGB_888_MIP.dds", "start": 5466309, "end": 6515012, "audio": 0}, {"filename": "/textures/testformats/texture_512_RGB_565.pvr", "start": 6515012, "end": 7039367, "audio": 0}, {"filename": "/textures/testformats/texture_512_RGB_565.ktx", "start": 7039367, "end": 7563755, "audio": 0}, {"filename": "/textures/testformats/texture_512_RGBA.webp", "start": 7563755, "end": 7575329, "audio": 0}, {"filename": "/textures/testformats/texture_512_RGBA.png", "start": 7575329, "end": 7595437, "audio": 0}, {"filename": "/textures/testformats/texture_512_RGB_DXT1.dds", "start": 7595437, "end": 7726637, "audio": 0}, {"filename": "/textures/testformats/.directory", "start": 7726637, "end": 7726695, "audio": 0}, {"filename": "/textures/testformats/texture_512_RGB.png", "start": 7726695, "end": 7744525, "audio": 0}, {"filename": "/textures/testformats/texture_512_RGB_888_MIP.pvr", "start": 7744525, "end": 8793167, "audio": 0}, {"filename": "/textures/testformats/texture_512_RGB_565.dds", "start": 8793167, "end": 9317583, "audio": 0}, {"filename": "/textures/testformats/texture_512_RGBA_8888.pvr", "start": 9317583, "end": 10366226, "audio": 0}, {"filename": "/textures/testformats/texture_512_RGBA_8888.ktx", "start": 10366226, "end": 11414902, "audio": 0}, {"filename": "/textures/testformats/texture_512_RGBA_DXT5.dds", "start": 11414902, "end": 11677174, "audio": 0}, {"filename": "/textures/testformats/texture_512_RGBA_4444.ktx", "start": 11677174, "end": 12201562, "audio": 0}, {"filename": "/textures/testformats/texture_512_RGBA_8888.dds", "start": 12201562, "end": 13250266, "audio": 0}, {"filename": "/textures/testformats/texture_512_RGB_888.dds", "start": 13250266, "end": 14036826, "audio": 0}, {"filename": "/textures/testformats/texture_512_RGB_888_MIP.ktx", "start": 14036826, "end": 15085543, "audio": 0}, {"filename": "/textures/testformats/texture_512_RGB_DXT1_MIP.dds", "start": 15085543, "end": 15260447, "audio": 0}], "remote_package_size": 15260447, "package_uuid": "ae14ff93-23f6-4bf2-8914-0bed8f0e4fbc"});
  
  })();
  