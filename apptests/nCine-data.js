
  var Module = typeof Module !== 'undefined' ? Module : {};

  if (!Module.expectedDataFileDownloads) {
    Module.expectedDataFileDownloads = 0;
  }

  Module.expectedDataFileDownloads++;
  (function() {
    // When running as a pthread, FS operations are proxied to the main thread, so we don't need to
    // fetch the .data bundle on the worker
    if (Module['ENVIRONMENT_IS_PTHREAD']) return;
    var loadPackage = function(metadata) {

      var PACKAGE_PATH = '';
      if (typeof window === 'object') {
        PACKAGE_PATH = window['encodeURIComponent'](window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf('/')) + '/');
      } else if (typeof process === 'undefined' && typeof location !== 'undefined') {
        // web worker
        PACKAGE_PATH = encodeURIComponent(location.pathname.toString().substring(0, location.pathname.toString().lastIndexOf('/')) + '/');
      }
      var PACKAGE_NAME = '/home/encelo/nCine/WEB/nCine-release/tests/nCine-data.data';
      var REMOTE_PACKAGE_BASE = 'nCine-data.data';
      if (typeof Module['locateFilePackage'] === 'function' && !Module['locateFile']) {
        Module['locateFile'] = Module['locateFilePackage'];
        err('warning: you defined Module.locateFilePackage, that has been renamed to Module.locateFile (using your locateFilePackage for now)');
      }
      var REMOTE_PACKAGE_NAME = Module['locateFile'] ? Module['locateFile'](REMOTE_PACKAGE_BASE, '') : REMOTE_PACKAGE_BASE;
var REMOTE_PACKAGE_SIZE = metadata['remote_package_size'];

      function fetchRemotePackage(packageName, packageSize, callback, errback) {
        if (typeof process === 'object' && typeof process.versions === 'object' && typeof process.versions.node === 'string') {
          require('fs').readFile(packageName, function(err, contents) {
            if (err) {
              errback(err);
            } else {
              callback(contents.buffer);
            }
          });
          return;
        }
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
Module['FS_createPath']("/", "fonts", true, true);
Module['FS_createPath']("/", "sounds", true, true);
Module['FS_createPath']("/", "textures", true, true);
Module['FS_createPath']("/textures", "testformats", true, true);
Module['FS_createPath']("/", "scripts", true, true);

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
          // canOwn this data in the filesystem, it is a slide into the heap that will never change
          Module['FS_createDataFile'](this.name, null, byteArray, true, true, true);
          Module['removeRunDependency']('fp ' + that.name);
          this.requests[this.name] = null;
        }
      };

      var files = metadata['files'];
      for (var i = 0; i < files.length; ++i) {
        new DataRequest(files[i]['start'], files[i]['end'], files[i]['audio'] || 0).open('GET', files[i]['filename']);
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
          }          Module['removeRunDependency']('datafile_/home/encelo/nCine/WEB/nCine-release/tests/nCine-data.data');

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
    loadPackage({"files": [{"filename": "/fonts/DroidSans32_256.fnt", "start": 0, "end": 21882}, {"filename": "/fonts/Roboto-Regular32_256.png", "start": 21882, "end": 32178}, {"filename": "/fonts/NotoSerif-Regular32_256.png", "start": 32178, "end": 42898}, {"filename": "/fonts/DroidSans32_256_8.ktx", "start": 42898, "end": 108534}, {"filename": "/fonts/OpenSans-Regular-19.fnt", "start": 108534, "end": 211260}, {"filename": "/fonts/noto_serif_medium_50.fnt", "start": 211260, "end": 229723}, {"filename": "/fonts/OpenSans-Regular32_256.fnt", "start": 229723, "end": 268563}, {"filename": "/fonts/OpenSans-Regular.fnt", "start": 268563, "end": 360701}, {"filename": "/fonts/NotoSerif-Regular32_256.fnt", "start": 360701, "end": 382817}, {"filename": "/fonts/DroidSans32_256_888.ktx", "start": 382817, "end": 579525}, {"filename": "/fonts/OpenSans-Regular32_256.png", "start": 579525, "end": 589569}, {"filename": "/fonts/Roboto-Regular32_256.fnt", "start": 589569, "end": 626969}, {"filename": "/fonts/NotoSans-Regular32_256.png", "start": 626969, "end": 637093}, {"filename": "/fonts/noto_serif_medium_50.png", "start": 637093, "end": 755810}, {"filename": "/fonts/OpenSans-Bold-19_0.png", "start": 755810, "end": 773064}, {"filename": "/fonts/DroidSans32_256.png", "start": 773064, "end": 784595}, {"filename": "/fonts/OpenSans-Regular_0.png", "start": 784595, "end": 796518}, {"filename": "/fonts/DroidSans32_256_8888.ktx", "start": 796518, "end": 1058762}, {"filename": "/fonts/OpenSans-Bold-19.fnt", "start": 1058762, "end": 1161485}, {"filename": "/fonts/NotoSans-Regular32_256.fnt", "start": 1161485, "end": 1183599}, {"filename": "/fonts/RobotoCondensed-Light.ttf_0.png", "start": 1183599, "end": 1209725}, {"filename": "/fonts/RobotoCondensed-Light.fnt", "start": 1209725, "end": 1218410}, {"filename": "/fonts/DroidSans32_256_88.ktx", "start": 1218410, "end": 1349582}, {"filename": "/fonts/OpenSans-Regular-19_0.png", "start": 1349582, "end": 1366102}, {"filename": "/sounds/coins.ogg", "start": 1366102, "end": 1379405, "audio": 1}, {"filename": "/sounds/coins.wav", "start": 1379405, "end": 1419229, "audio": 1}, {"filename": "/sounds/explode.ogg", "start": 1419229, "end": 1534906, "audio": 1}, {"filename": "/sounds/waterdrop.wav", "start": 1534906, "end": 1656180, "audio": 1}, {"filename": "/sounds/explode.wav", "start": 1656180, "end": 2371504, "audio": 1}, {"filename": "/sounds/chiptune_loop.ogg", "start": 2371504, "end": 2631104, "audio": 1}, {"filename": "/sounds/waterdrop.ogg", "start": 2631104, "end": 2657300, "audio": 1}, {"filename": "/sounds/c64.ogg", "start": 2657300, "end": 2986276, "audio": 1}, {"filename": "/textures/megatexture_256_cutout.png", "start": 2986276, "end": 3008330}, {"filename": "/textures/texture2_cutout.png", "start": 3008330, "end": 3010568}, {"filename": "/textures/sample.png", "start": 3010568, "end": 3034701}, {"filename": "/textures/normal.png", "start": 3034701, "end": 3086561}, {"filename": "/textures/texture1_cutout.png", "start": 3086561, "end": 3090814}, {"filename": "/textures/spritesheet.png", "start": 3090814, "end": 3095057}, {"filename": "/textures/sample_n.png", "start": 3095057, "end": 3146964}, {"filename": "/textures/diffuse.png", "start": 3146964, "end": 3160894}, {"filename": "/textures/texture4_cutout.png", "start": 3160894, "end": 3167631}, {"filename": "/textures/texture1.png", "start": 3167631, "end": 3172740}, {"filename": "/textures/texture3.png", "start": 3172740, "end": 3180896}, {"filename": "/textures/megatexture_256.png", "start": 3180896, "end": 3208323}, {"filename": "/textures/texture2.png", "start": 3208323, "end": 3211662}, {"filename": "/textures/texture4.png", "start": 3211662, "end": 3217109}, {"filename": "/textures/texture3_cutout.png", "start": 3217109, "end": 3225577}, {"filename": "/textures/smoke_256.png", "start": 3225577, "end": 3267980}, {"filename": "/textures/testformats/texture_512_RGB_888.pvr", "start": 3267980, "end": 4054479}, {"filename": "/textures/testformats/texture_512_RGB_888.ktx", "start": 4054479, "end": 4841011}, {"filename": "/textures/testformats/texture_512_RGB.webp", "start": 4841011, "end": 4851895}, {"filename": "/textures/testformats/texture_512_RGBA_4444.pvr", "start": 4851895, "end": 5376250}, {"filename": "/textures/testformats/texture_512_RGBA_DXT3.dds", "start": 5376250, "end": 5638522}, {"filename": "/textures/testformats/texture_512_RGB_888_MIP.dds", "start": 5638522, "end": 6687225}, {"filename": "/textures/testformats/texture_512_RGB_565.pvr", "start": 6687225, "end": 7211580}, {"filename": "/textures/testformats/texture_512_RGB_565.ktx", "start": 7211580, "end": 7735968}, {"filename": "/textures/testformats/texture_512_RGBA.webp", "start": 7735968, "end": 7747542}, {"filename": "/textures/testformats/texture_512_RGBA.png", "start": 7747542, "end": 7767650}, {"filename": "/textures/testformats/texture_512_RGB_DXT1.dds", "start": 7767650, "end": 7898850}, {"filename": "/textures/testformats/.directory", "start": 7898850, "end": 7898908}, {"filename": "/textures/testformats/texture_512_RGB.png", "start": 7898908, "end": 7916738}, {"filename": "/textures/testformats/texture_512_RGB_888_MIP.pvr", "start": 7916738, "end": 8965380}, {"filename": "/textures/testformats/texture_512_RGB_565.dds", "start": 8965380, "end": 9489796}, {"filename": "/textures/testformats/texture_512_RGBA_8888.pvr", "start": 9489796, "end": 10538439}, {"filename": "/textures/testformats/texture_512_RGBA_8888.ktx", "start": 10538439, "end": 11587115}, {"filename": "/textures/testformats/texture_512_RGBA_DXT5.dds", "start": 11587115, "end": 11849387}, {"filename": "/textures/testformats/texture_512_RGBA_4444.ktx", "start": 11849387, "end": 12373775}, {"filename": "/textures/testformats/texture_512_RGBA_8888.dds", "start": 12373775, "end": 13422479}, {"filename": "/textures/testformats/texture_512_RGB_888.dds", "start": 13422479, "end": 14209039}, {"filename": "/textures/testformats/texture_512_RGB_888_MIP.ktx", "start": 14209039, "end": 15257756}, {"filename": "/textures/testformats/texture_512_RGB_DXT1_MIP.dds", "start": 15257756, "end": 15432660}, {"filename": "/scripts/test_vec2.lua", "start": 15432660, "end": 15434141}, {"filename": "/scripts/init.lua", "start": 15434141, "end": 15434559}, {"filename": "/scripts/test_vec3.lua", "start": 15434559, "end": 15436129}, {"filename": "/scripts/export_lua_api.lua", "start": 15436129, "end": 15437245}, {"filename": "/scripts/test_color.lua", "start": 15437245, "end": 15438108}, {"filename": "/scripts/reload.lua", "start": 15438108, "end": 15438846}, {"filename": "/scripts/script.lua", "start": 15438846, "end": 15447495}], "remote_package_size": 15447495});

  })();
