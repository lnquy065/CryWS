var timeConst = {
    day: 86400,
    hour: 3600,
    minute: 60
}

var timeStamp = {};

timeStamp.day = (d) => {
    return d* timeConst.day;
}

timeStamp.hour = (h) => {
    return h* timeConst.hour;
}

timeStamp.minute = (m) => {
    return m* timeConst.minute;
}

timeStamp.current = () => {
    return Math.round(+new Date()/1000);
}

timeStamp.currentAt0h = () => {
    var date = new Date().getDay;
    return Math.round(+new Date()/1000);
}

timeStamp.getDateFromCurrent = (offset) => {
    var date = new Date();
    date.setDate (date.getDate() - offset);  
    return date.getFullYear() +'/'+timeStamp.padding((date.getMonth()+1), 2)+'/'+timeStamp.padding(date.getDate(), 2);
}

timeStamp.get7DaysPrevious = () => {
    var arr  = [];
    for (i=0;i<7;i++) {
        arr.push(timeStamp.getDateFromCurrent(i));
    }
    return arr;
}

timeStamp.toTime = (UNIX_timestamp) =>{
  var a = new Date(UNIX_timestamp * 1000);
  var months = ['01','02','03','04','05','06','07','08','09','10','11','12'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
  return year+'/'+month+'/'+timeStamp.padding(date, 2);
}


timeStamp.padding = (input, padding) => {
    input = String(input);
    if (input.length === padding) return input;
    else {
        while (input.length!==padding) {
            input = '0'+input;
        }
    }
    return input;
}

module.exports = timeStamp;