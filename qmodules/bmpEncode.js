var pixelBitmap= require('pixel-bmp');
// var Jimp = require('jimp');
 const fs = require('fs');
// const path = require('path');

// fs.readdir(__dirname+"/res/coins/", (err, files) => {
//     var count = files.length;
//     var cur = 0;
//     files.forEach(file => {
//         cur+=1;
//         console.log(cur+'/'+count);
//         Jimp.read(__dirname+"/res/coins/"+file, function(err, img) {
//             if (err) ;
//             else {
//                 var pathf = __dirname+"/res/coins/"+file;
//             var fname = path.basename(pathf, path.extname(pathf));
//             img.grayscale().contrast(1).write('res/coins_mono/'+fname+'.bmp');
//             }
//         })
//     })
// })



var toArray = (coinsymbol) => {
    var file= __dirname+'/../res/coins_high/16/blackbmp/'+coinsymbol+'.bmp';
    if (!fs.existsSync(file)) file = __dirname+'/../res/coins_high/16/blackbmp/none.bmp';

    var getRet = (v) => {
        console.log(v);
        return v;
    }

    var imageData = pixelBitmap.parse(file).then(function(images, getRet){
        var imageData = images[0];
        var threshold = 40;
        var rs = [];
        for (i=0; i<(16*16*4);i=i+32) {
             var byte = [];
            for (j = i;j<i+32;j=j+4) {
                var gray = imageData.data[j];
                if (gray > threshold) gray=0;
                else gray=1;
                byte.push(gray);
            }
             rs.push(toByte(byte));
           
        }
        getRet(rs);
        return rs;
      });
     
  //  return rs;
}




function toByte(arr) {
    var rsB = 0;
    for (h=0;h<8;h++) {
        rsB+= Math.pow(2,(7-h)) * arr[h];
    }
    return rsB;
}

module.exports = toArray;