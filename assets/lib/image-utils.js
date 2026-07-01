/* Comprime un File/Blob de imagen a JPEG mediante canvas.
   maxDim: dimensión máxima (anchura). quality: calidad JPEG 0–1.
   Devuelve Promise<Blob>. */
function compressImage(file, maxDim, quality) {
  maxDim  = maxDim  !== undefined ? maxDim  : 1200;
  quality = quality !== undefined ? quality : 0.75;
  return new Promise(function(resolve, reject) {
    var reader = new FileReader();
    reader.onerror = function() { reject(new Error('FileReader error')); };
    reader.onload = function(e) {
      var img = new Image();
      img.onerror = function() { reject(new Error('Image load error')); };
      img.onload = function() {
        var w = img.width, h = img.height;
        if (w > maxDim) { h = Math.round(h * maxDim / w); w = maxDim; }
        var canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        canvas.toBlob(function(blob) {
          if (blob) resolve(blob);
          else reject(new Error('canvas.toBlob failed'));
        }, 'image/jpeg', quality);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}
