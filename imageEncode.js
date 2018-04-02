var pixelBitmap= require('pixel-bmp');

var file= 'res/coins_mono/BTC.bmp';


pixelBitmap.parse(file).then(function(images){
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
    var toArr = '{';
    for (l=0;l<rs.length;l++) {
        toArr+= rs[l] +',';
    }
    toArr = toArr.slice(0, -1) + '};'
    console.log(toArr);
  });

// pixelPng.parse(file).then(function(images){
//   var i= 0;

//   console.log(images.numPlays); // 0(Infinite)
// var threshold = 40;
//   var nextImage= function(){
//     var imageData= images[i++];
//     if(imageData==null) return;

//     var rs = [];
//     for (i=0; i<(16*16*4);i=i+32) {
//         var byte = [];
//         for (j = i;j<i+32;j=j+4) {
//             var gray = ( (0.3 * imageData.data[j+1]) + (0.59 * imageData.data[j+2]) + (0.11 * imageData.data[j+3]) );
//             if (gray > threshold) gray=0;
//             else gray=1;
//             byte.push(gray);
            
//         }
//         console.log(byte);
//         rs.push(toByte(byte));
//     }
//     console.log(rs);
//     nextImage();
//   }

//   nextImage();
// });


function toByte(arr) {
    var rsB = 0;
    for (h=0;h<8;h++) {
        rsB+= Math.pow(2,(7-h)) * arr[h];
    }
    return rsB;
}