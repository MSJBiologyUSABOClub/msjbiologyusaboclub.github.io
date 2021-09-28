'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "version.json": "b93d48b87f3bd6fed6a5c2a294e18ab4",
"index.html": "8e4d8aa56ddffe431fc7e0fa919dd995",
"/": "8e4d8aa56ddffe431fc7e0fa919dd995",
"main.dart.js": "797f3edadfb3db44dbe5f2d3f80e4594",
"favicon.png": "2a1a95284527b15f2097a624860a4cf1",
"icons/favicon-16x16.png": "2a1a95284527b15f2097a624860a4cf1",
"icons/favicon.ico": "24c208260000e57304d010314c6f30c1",
"icons/apple-icon.png": "5e73c52fc6f4c72d36b91080b25412d4",
"icons/apple-icon-144x144.png": "f3db5b782ee577e6f3faab293e5b8fff",
"icons/android-icon-192x192.png": "5be4f4bf54434bd9bc0e6b3ce0ef4208",
"icons/apple-icon-precomposed.png": "5e73c52fc6f4c72d36b91080b25412d4",
"icons/apple-icon-114x114.png": "492e6654750d250d5bb800106a24029a",
"icons/ms-icon-310x310.png": "c07776bc2e7a4796e5186184e3e0c5c5",
"icons/ms-icon-144x144.png": "f3db5b782ee577e6f3faab293e5b8fff",
"icons/apple-icon-57x57.png": "df0edbd7c329b141f36253ca2d6e6979",
"icons/apple-icon-152x152.png": "5b9aefc62eed5571f1f413adfa760183",
"icons/ms-icon-150x150.png": "659940807d136626fa771f2d4cb37a5e",
"icons/android-icon-72x72.png": "83545e4dc34bcf5c0ce1221954e4e8a5",
"icons/android-icon-96x96.png": "1171f96171a32e43fa1dc2194fd48881",
"icons/android-icon-36x36.png": "fe7d909011167f130fc4d022bf6d842d",
"icons/apple-icon-180x180.png": "54dc7f942ebc8fd17456963111748f88",
"icons/favicon-96x96.png": "1171f96171a32e43fa1dc2194fd48881",
"icons/manifest.json": "5892ea697cab46a4bdd87b8ddd297014",
"icons/android-icon-48x48.png": "0e7e59d673482c3d64f90caa392b4d49",
"icons/apple-icon-76x76.png": "b22ec3590c1a740ae3d41bcee5639717",
"icons/apple-icon-60x60.png": "ae14bf702c4749e00f1e141843768c26",
"icons/browserconfig.xml": "93c98f9c263a2747d8e80bef42b6ffad",
"icons/android-icon-144x144.png": "f3db5b782ee577e6f3faab293e5b8fff",
"icons/apple-icon-72x72.png": "83545e4dc34bcf5c0ce1221954e4e8a5",
"icons/apple-icon-120x120.png": "281222f488e680609cece2c87f498c80",
"icons/favicon-32x32.png": "2c20aac6c6a2c9ecc6670254ed0d2fb9",
"icons/ms-icon-70x70.png": "2551af53c8d2846c53c52d00602ae56b",
"manifest.json": "8465694ad6bfa4aca4849de409cd8598",
"assets/AssetManifest.json": "cf53e431bac60a311e7350d68a61b90a",
"assets/NOTICES": "58fc54fcc82d663b03c77a196d9efdec",
"assets/FontManifest.json": "7b2a36307916a9721811788013e65289",
"assets/fonts/MaterialIcons-Regular.otf": "4e6447691c9509f7acdbf8a931a85ca1",
"assets/assets/images/cee.png": "0ef0977bb4cfc9b1e9ed77ee3e5dd8b4",
"assets/assets/images/usabo_blue-logo-300x120.png": "fd9206b445f37b1c9d6b1c691cf19b10"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
