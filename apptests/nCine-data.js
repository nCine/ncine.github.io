
  var Module = typeof Module != 'undefined' ? Module : {};

  if (!Module.expectedDataFileDownloads) {
    Module.expectedDataFileDownloads = 0;
  }

  Module.expectedDataFileDownloads++;
  (function() {
    // Do not attempt to redownload the virtual filesystem data when in a pthread or a Wasm Worker context.
    if (Module['ENVIRONMENT_IS_PTHREAD'] || Module['$ww']) return;
    var loadPackage = function(metadata) {

      var PACKAGE_PATH = '';
      if (typeof window === 'object') {
        PACKAGE_PATH = window['encodeURIComponent'](window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf('/')) + '/');
      } else if (typeof process === 'undefined' && typeof location !== 'undefined') {
        // web worker
        PACKAGE_PATH = encodeURIComponent(location.pathname.toString().substring(0, location.pathname.toString().lastIndexOf('/')) + '/');
      }
      var PACKAGE_NAME = '/home/encelo/nCine/WEB/AMEND-release/tests/nCine-data.data';
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
            if (Module['setStatus']) Module['setStatus'](`Downloading data... (${loaded}/${total})`);
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
Module['FS_createPath']("/", "scripts", true, true);
Module['FS_createPath']("/", "sounds", true, true);
Module['FS_createPath']("/", "textures", true, true);
Module['FS_createPath']("/textures", "testformats", true, true);

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
          Module['addRunDependency'](`fp ${this.name}`);
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
          Module['removeRunDependency'](`fp ${that.name}`);
          this.requests[this.name] = null;
        }
      };

      var files = metadata['files'];
      for (var i = 0; i < files.length; ++i) {
        new DataRequest(files[i]['start'], files[i]['end'], files[i]['audio'] || 0).open('GET', files[i]['filename']);
      }

      function processPackageData(arrayBuffer) {
        assert(arrayBuffer, 'Loading data file failed.');
        assert(arrayBuffer.constructor.name === ArrayBuffer.name, 'bad input to processPackageData');
        var byteArray = new Uint8Array(arrayBuffer);
        var curr;
        // Reuse the bytearray from the XHR as the source for file reads.
          DataRequest.prototype.byteArray = byteArray;
          var files = metadata['files'];
          for (var i = 0; i < files.length; ++i) {
            DataRequest.prototype.requests[files[i].filename].onload();
          }          Module['removeRunDependency']('datafile_/home/encelo/nCine/WEB/AMEND-release/tests/nCine-data.data');

      };
      Module['addRunDependency']('datafile_/home/encelo/nCine/WEB/AMEND-release/tests/nCine-data.data');

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
    loadPackage({"files": [{"filename": "/fonts/DroidSans32_256.fnt", "start": 0, "end": 21882}, {"filename": "/fonts/DroidSans32_256.png", "start": 21882, "end": 33413}, {"filename": "/fonts/DroidSans32_256_8.ktx", "start": 33413, "end": 99049}, {"filename": "/fonts/DroidSans32_256_88.ktx", "start": 99049, "end": 230221}, {"filename": "/fonts/DroidSans32_256_888.ktx", "start": 230221, "end": 426929}, {"filename": "/fonts/DroidSans32_256_8888.ktx", "start": 426929, "end": 689173}, {"filename": "/fonts/JetBrainsMono.fnt", "start": 689173, "end": 700226}, {"filename": "/fonts/JetBrainsMono_0.png", "start": 700226, "end": 717392}, {"filename": "/fonts/NotoSans-Regular32_256.fnt", "start": 717392, "end": 739506}, {"filename": "/fonts/NotoSans-Regular32_256.png", "start": 739506, "end": 749630}, {"filename": "/fonts/NotoSerif-Regular32_256.fnt", "start": 749630, "end": 771746}, {"filename": "/fonts/NotoSerif-Regular32_256.png", "start": 771746, "end": 782466}, {"filename": "/fonts/OpenSans-Bold-19.fnt", "start": 782466, "end": 885189}, {"filename": "/fonts/OpenSans-Bold-19_0.png", "start": 885189, "end": 902443}, {"filename": "/fonts/OpenSans-Regular-19.fnt", "start": 902443, "end": 1005169}, {"filename": "/fonts/OpenSans-Regular-19_0.png", "start": 1005169, "end": 1021689}, {"filename": "/fonts/OpenSans-Regular.fnt", "start": 1021689, "end": 1113827}, {"filename": "/fonts/OpenSans-Regular32_256.fnt", "start": 1113827, "end": 1152667}, {"filename": "/fonts/OpenSans-Regular32_256.png", "start": 1152667, "end": 1162711}, {"filename": "/fonts/OpenSans-Regular_0.png", "start": 1162711, "end": 1174634}, {"filename": "/fonts/Roboto-Regular32_256.fnt", "start": 1174634, "end": 1212034}, {"filename": "/fonts/Roboto-Regular32_256.png", "start": 1212034, "end": 1222330}, {"filename": "/fonts/RobotoCondensed-Light.fnt", "start": 1222330, "end": 1231015}, {"filename": "/fonts/RobotoCondensed-Light.ttf_0.png", "start": 1231015, "end": 1257141}, {"filename": "/fonts/calibri_r_bold_50px_outline2px_A.fnt", "start": 1257141, "end": 1317768}, {"filename": "/fonts/calibri_r_bold_50px_outline2px_A.png", "start": 1317768, "end": 1698745}, {"filename": "/fonts/noto_serif_medium_50.fnt", "start": 1698745, "end": 1717208}, {"filename": "/fonts/noto_serif_medium_50.png", "start": 1717208, "end": 1835925}, {"filename": "/scripts/export_lua_api.lua", "start": 1835925, "end": 1837041}, {"filename": "/scripts/init.lua", "start": 1837041, "end": 1837459}, {"filename": "/scripts/reload.lua", "start": 1837459, "end": 1838197}, {"filename": "/scripts/script.lua", "start": 1838197, "end": 1849292}, {"filename": "/scripts/test_color.lua", "start": 1849292, "end": 1850155}, {"filename": "/scripts/test_vec2.lua", "start": 1850155, "end": 1851636}, {"filename": "/scripts/test_vec3.lua", "start": 1851636, "end": 1853206}, {"filename": "/scripts/test_vec4.lua", "start": 1853206, "end": 1854864}, {"filename": "/sounds/c64.ogg", "start": 1854864, "end": 2183840, "audio": 1}, {"filename": "/sounds/chiptune_loop.ogg", "start": 2183840, "end": 2443440, "audio": 1}, {"filename": "/sounds/coins.ogg", "start": 2443440, "end": 2456743, "audio": 1}, {"filename": "/sounds/coins.wav", "start": 2456743, "end": 2496567, "audio": 1}, {"filename": "/sounds/explode.ogg", "start": 2496567, "end": 2612244, "audio": 1}, {"filename": "/sounds/explode.wav", "start": 2612244, "end": 3327568, "audio": 1}, {"filename": "/sounds/waterdrop.ogg", "start": 3327568, "end": 3353764, "audio": 1}, {"filename": "/sounds/waterdrop.wav", "start": 3353764, "end": 3475038, "audio": 1}, {"filename": "/textures/bunny.png", "start": 3475038, "end": 3475487}, {"filename": "/textures/diffuse.png", "start": 3475487, "end": 3489417}, {"filename": "/textures/megatexture_256.png", "start": 3489417, "end": 3516844}, {"filename": "/textures/megatexture_256_cutout.png", "start": 3516844, "end": 3538898}, {"filename": "/textures/normal.png", "start": 3538898, "end": 3590758}, {"filename": "/textures/sample.png", "start": 3590758, "end": 3614891}, {"filename": "/textures/sample_n.png", "start": 3614891, "end": 3666798}, {"filename": "/textures/smoke_256.png", "start": 3666798, "end": 3709201}, {"filename": "/textures/spritesheet.png", "start": 3709201, "end": 3713444}, {"filename": "/textures/testformats/.directory", "start": 3713444, "end": 3713502}, {"filename": "/textures/testformats/texture_512_RGB.png", "start": 3713502, "end": 3731332}, {"filename": "/textures/testformats/texture_512_RGB.webp", "start": 3731332, "end": 3742216}, {"filename": "/textures/testformats/texture_512_RGBA.png", "start": 3742216, "end": 3762324}, {"filename": "/textures/testformats/texture_512_RGBA.webp", "start": 3762324, "end": 3773898}, {"filename": "/textures/testformats/texture_512_RGBA_4444.ktx", "start": 3773898, "end": 4298286}, {"filename": "/textures/testformats/texture_512_RGBA_4444.pvr", "start": 4298286, "end": 4822641}, {"filename": "/textures/testformats/texture_512_RGBA_8888.dds", "start": 4822641, "end": 5871345}, {"filename": "/textures/testformats/texture_512_RGBA_8888.ktx", "start": 5871345, "end": 6920021}, {"filename": "/textures/testformats/texture_512_RGBA_8888.pvr", "start": 6920021, "end": 7968664}, {"filename": "/textures/testformats/texture_512_RGBA_DXT3.dds", "start": 7968664, "end": 8230936}, {"filename": "/textures/testformats/texture_512_RGBA_DXT5.dds", "start": 8230936, "end": 8493208}, {"filename": "/textures/testformats/texture_512_RGB_565.dds", "start": 8493208, "end": 9017624}, {"filename": "/textures/testformats/texture_512_RGB_565.ktx", "start": 9017624, "end": 9542012}, {"filename": "/textures/testformats/texture_512_RGB_565.pvr", "start": 9542012, "end": 10066367}, {"filename": "/textures/testformats/texture_512_RGB_888.dds", "start": 10066367, "end": 10852927}, {"filename": "/textures/testformats/texture_512_RGB_888.ktx", "start": 10852927, "end": 11639459}, {"filename": "/textures/testformats/texture_512_RGB_888.pvr", "start": 11639459, "end": 12425958}, {"filename": "/textures/testformats/texture_512_RGB_888_MIP.dds", "start": 12425958, "end": 13474661}, {"filename": "/textures/testformats/texture_512_RGB_888_MIP.ktx", "start": 13474661, "end": 14523378}, {"filename": "/textures/testformats/texture_512_RGB_888_MIP.pvr", "start": 14523378, "end": 15572020}, {"filename": "/textures/testformats/texture_512_RGB_DXT1.dds", "start": 15572020, "end": 15703220}, {"filename": "/textures/testformats/texture_512_RGB_DXT1_MIP.dds", "start": 15703220, "end": 15878124}, {"filename": "/textures/texture1.png", "start": 15878124, "end": 15883233}, {"filename": "/textures/texture1_cutout.png", "start": 15883233, "end": 15887486}, {"filename": "/textures/texture2.png", "start": 15887486, "end": 15890825}, {"filename": "/textures/texture2_cutout.png", "start": 15890825, "end": 15893063}, {"filename": "/textures/texture3.png", "start": 15893063, "end": 15901219}, {"filename": "/textures/texture3_cutout.png", "start": 15901219, "end": 15909687}, {"filename": "/textures/texture4.png", "start": 15909687, "end": 15915134}, {"filename": "/textures/texture4_cutout.png", "start": 15915134, "end": 15921871}], "remote_package_size": 15921871});

  })();
