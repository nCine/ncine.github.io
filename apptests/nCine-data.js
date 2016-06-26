
  var Module = typeof Module != 'undefined' ? Module : {};

  if (!Module['expectedDataFileDownloads']) Module['expectedDataFileDownloads'] = 0;
  Module['expectedDataFileDownloads']++;
  (() => {
    // Do not attempt to redownload the virtual filesystem data when in a pthread or a Wasm Worker context.
    var isPthread = typeof ENVIRONMENT_IS_PTHREAD != 'undefined' && ENVIRONMENT_IS_PTHREAD;
    var isWasmWorker = typeof ENVIRONMENT_IS_WASM_WORKER != 'undefined' && ENVIRONMENT_IS_WASM_WORKER;
    if (isPthread || isWasmWorker) return;
    var isNode = globalThis.process && globalThis.process.versions && globalThis.process.versions.node && globalThis.process.type != 'renderer';
    async function loadPackage(metadata) {

      var PACKAGE_PATH = '';
      if (typeof window === 'object') {
        PACKAGE_PATH = window['encodeURIComponent'](window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/')) + '/');
      } else if (typeof process === 'undefined' && typeof location !== 'undefined') {
        // web worker
        PACKAGE_PATH = encodeURIComponent(location.pathname.substring(0, location.pathname.lastIndexOf('/')) + '/');
      }
      var PACKAGE_NAME = '/home/encelo/nCine/DEPLOY_WEB/nCine-release-SDL2/tests/nCine-data.data';
      var REMOTE_PACKAGE_BASE = 'nCine-data.data';
      var REMOTE_PACKAGE_NAME = Module['locateFile'] ? Module['locateFile'](REMOTE_PACKAGE_BASE, '') : REMOTE_PACKAGE_BASE;
      var REMOTE_PACKAGE_SIZE = metadata['remote_package_size'];

      async function fetchRemotePackage(packageName, packageSize) {
        if (isNode) {
          var contents = require('fs').readFileSync(packageName);
          return new Uint8Array(contents).buffer;
        }
        if (!Module['dataFileDownloads']) Module['dataFileDownloads'] = {};
        try {
          var response = await fetch(packageName);
        } catch (e) {
          throw new Error(`Network Error: ${packageName}`, {e});
        }
        if (!response.ok) {
          throw new Error(`${response.status}: ${response.url}`);
        }

        const chunks = [];
        const headers = response.headers;
        const total = Number(headers.get('Content-Length') || packageSize);
        let loaded = 0;

        Module['setStatus'] && Module['setStatus']('Downloading data...');
        const reader = response.body.getReader();

        while (1) {
          var {done, value} = await reader.read();
          if (done) break;
          chunks.push(value);
          loaded += value.length;
          Module['dataFileDownloads'][packageName] = {loaded, total};

          let totalLoaded = 0;
          let totalSize = 0;

          for (const download of Object.values(Module['dataFileDownloads'])) {
            totalLoaded += download.loaded;
            totalSize += download.total;
          }

          Module['setStatus'] && Module['setStatus'](`Downloading data... (${totalLoaded}/${totalSize})`);
        }

        const packageData = new Uint8Array(chunks.map((c) => c.length).reduce((a, b) => a + b, 0));
        let offset = 0;
        for (const chunk of chunks) {
          packageData.set(chunk, offset);
          offset += chunk.length;
        }
        return packageData.buffer;
      }

      var fetchPromise;
      var fetched = Module['getPreloadedPackage'] && Module['getPreloadedPackage'](REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE);

      if (!fetched) {
        // Note that we don't use await here because we want to execute the
        // the rest of this function immediately.
        fetchPromise = fetchRemotePackage(REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE);
      }

    async function runWithFS(Module) {

      function assert(check, msg) {
        if (!check) throw new Error(msg);
      }
Module['FS_createPath']("/", "fonts", true, true);
Module['FS_createPath']("/", "scripts", true, true);
Module['FS_createPath']("/", "sounds", true, true);
Module['FS_createPath']("/", "textures", true, true);
Module['FS_createPath']("/textures", "testformats", true, true);

      async function processPackageData(arrayBuffer) {
        assert(arrayBuffer, 'Loading data file failed.');
        assert(arrayBuffer.constructor.name === ArrayBuffer.name, 'bad input to processPackageData ' + arrayBuffer.constructor.name);
        var byteArray = new Uint8Array(arrayBuffer);
        var curr;
        // Reuse the bytearray from the XHR as the source for file reads.
          for (var file of metadata['files']) {
            var name = file['filename'];
            var data = byteArray.subarray(file['start'], file['end']);
            // canOwn this data in the filesystem, it is a slice into the heap that will never change
        Module['FS_createDataFile'](name, null, data, true, true, true);
          }
          Module['removeRunDependency']('datafile_/home/encelo/nCine/DEPLOY_WEB/nCine-release-SDL2/tests/nCine-data.data');
      }
      Module['addRunDependency']('datafile_/home/encelo/nCine/DEPLOY_WEB/nCine-release-SDL2/tests/nCine-data.data');

      if (!Module['preloadResults']) Module['preloadResults'] = {};

      Module['preloadResults'][PACKAGE_NAME] = {fromCache: false};
      if (!fetched) {
        fetched = await fetchPromise;
      }
      await processPackageData(fetched);

    }
    // Detect whether the module JS file has already been loaded.
    if (Module['FS_createPath']) {
      runWithFS(Module);
    } else {
      if (!Module['preRun']) Module['preRun'] = [];
      Module['preRun'].push(runWithFS); // FS is not initialized yet, wait for it
    }

    }
    loadPackage({"files": [{"filename": "/fonts/DroidSans32_256.fnt", "start": 0, "end": 21882}, {"filename": "/fonts/DroidSans32_256.png", "start": 21882, "end": 33413}, {"filename": "/fonts/NotoSans-Regular32_256.fnt", "start": 33413, "end": 55527}, {"filename": "/fonts/NotoSans-Regular32_256.png", "start": 55527, "end": 65651}, {"filename": "/fonts/NotoSerif-Regular32_256.fnt", "start": 65651, "end": 87767}, {"filename": "/fonts/NotoSerif-Regular32_256.png", "start": 87767, "end": 98487}, {"filename": "/fonts/OpenSans-Regular32_256.fnt", "start": 98487, "end": 137327}, {"filename": "/fonts/OpenSans-Regular32_256.png", "start": 137327, "end": 147371}, {"filename": "/fonts/Roboto-Regular32_256.fnt", "start": 147371, "end": 184771}, {"filename": "/fonts/Roboto-Regular32_256.png", "start": 184771, "end": 195067}, {"filename": "/scripts/export_lua_api_list.lua", "start": 195067, "end": 196163}, {"filename": "/scripts/init.lua", "start": 196163, "end": 196581}, {"filename": "/scripts/ncine_footer.lua", "start": 196581, "end": 196620}, {"filename": "/scripts/ncine_header.lua", "start": 196620, "end": 196940}, {"filename": "/scripts/reload.lua", "start": 196940, "end": 197678}, {"filename": "/scripts/script.lua", "start": 197678, "end": 212265}, {"filename": "/scripts/test_color.lua", "start": 212265, "end": 213098}, {"filename": "/scripts/test_vec2.lua", "start": 213098, "end": 214549}, {"filename": "/scripts/test_vec3.lua", "start": 214549, "end": 216089}, {"filename": "/scripts/test_vec4.lua", "start": 216089, "end": 217717}, {"filename": "/sounds/c64.ogg", "start": 217717, "end": 546693}, {"filename": "/sounds/chiptune_loop.ogg", "start": 546693, "end": 806293}, {"filename": "/sounds/coins.ogg", "start": 806293, "end": 819596}, {"filename": "/sounds/coins.wav", "start": 819596, "end": 859420}, {"filename": "/sounds/explode.ogg", "start": 859420, "end": 975097}, {"filename": "/sounds/explode.wav", "start": 975097, "end": 1690421}, {"filename": "/sounds/waterdrop.ogg", "start": 1690421, "end": 1716617}, {"filename": "/sounds/waterdrop.wav", "start": 1716617, "end": 1837891}, {"filename": "/textures/bunny.png", "start": 1837891, "end": 1838340}, {"filename": "/textures/diffuse.png", "start": 1838340, "end": 1852270}, {"filename": "/textures/megatexture_256.png", "start": 1852270, "end": 1879697}, {"filename": "/textures/megatexture_256_cutout.png", "start": 1879697, "end": 1901751}, {"filename": "/textures/normal.png", "start": 1901751, "end": 1953611}, {"filename": "/textures/smoke_256.png", "start": 1953611, "end": 1996014}, {"filename": "/textures/spritesheet.png", "start": 1996014, "end": 2000257}, {"filename": "/textures/testformats/.directory", "start": 2000257, "end": 2000315}, {"filename": "/textures/testformats/texture_512_RGB.png", "start": 2000315, "end": 2018145}, {"filename": "/textures/testformats/texture_512_RGB.webp", "start": 2018145, "end": 2029029}, {"filename": "/textures/testformats/texture_512_RGBA.png", "start": 2029029, "end": 2049137}, {"filename": "/textures/testformats/texture_512_RGBA.webp", "start": 2049137, "end": 2060711}, {"filename": "/textures/testformats/texture_512_RGBA_4444.ktx", "start": 2060711, "end": 2585099}, {"filename": "/textures/testformats/texture_512_RGBA_4444.pvr", "start": 2585099, "end": 3109454}, {"filename": "/textures/testformats/texture_512_RGBA_8888.dds", "start": 3109454, "end": 4158158}, {"filename": "/textures/testformats/texture_512_RGBA_8888.ktx", "start": 4158158, "end": 5206834}, {"filename": "/textures/testformats/texture_512_RGBA_8888.pvr", "start": 5206834, "end": 6255477}, {"filename": "/textures/testformats/texture_512_RGBA_DXT3.dds", "start": 6255477, "end": 6517749}, {"filename": "/textures/testformats/texture_512_RGBA_DXT5.dds", "start": 6517749, "end": 6780021}, {"filename": "/textures/testformats/texture_512_RGB_565.dds", "start": 6780021, "end": 7304437}, {"filename": "/textures/testformats/texture_512_RGB_565.ktx", "start": 7304437, "end": 7828825}, {"filename": "/textures/testformats/texture_512_RGB_565.pvr", "start": 7828825, "end": 8353180}, {"filename": "/textures/testformats/texture_512_RGB_888.dds", "start": 8353180, "end": 9139740}, {"filename": "/textures/testformats/texture_512_RGB_888.ktx", "start": 9139740, "end": 9926272}, {"filename": "/textures/testformats/texture_512_RGB_888.pvr", "start": 9926272, "end": 10712771}, {"filename": "/textures/testformats/texture_512_RGB_888_MIP.dds", "start": 10712771, "end": 11761474}, {"filename": "/textures/testformats/texture_512_RGB_888_MIP.ktx", "start": 11761474, "end": 12810191}, {"filename": "/textures/testformats/texture_512_RGB_888_MIP.pvr", "start": 12810191, "end": 13858833}, {"filename": "/textures/testformats/texture_512_RGB_DXT1.dds", "start": 13858833, "end": 13990033}, {"filename": "/textures/testformats/texture_512_RGB_DXT1_MIP.dds", "start": 13990033, "end": 14164937}, {"filename": "/textures/texture1.png", "start": 14164937, "end": 14170046}, {"filename": "/textures/texture1_cutout.png", "start": 14170046, "end": 14174299}, {"filename": "/textures/texture2.png", "start": 14174299, "end": 14177638}, {"filename": "/textures/texture2_cutout.png", "start": 14177638, "end": 14179876}, {"filename": "/textures/texture3.png", "start": 14179876, "end": 14188032}, {"filename": "/textures/texture3_cutout.png", "start": 14188032, "end": 14196500}, {"filename": "/textures/texture4.png", "start": 14196500, "end": 14201947}, {"filename": "/textures/texture4_cutout.png", "start": 14201947, "end": 14208684}], "remote_package_size": 14208684});

  })();
