var dateS = '2018/04/09';
var dateE = '2018/04/05';
var date = new Date(dateS);
var delta = Math.abs(new Date().getDay() - new Date(dateE));
console.log(delta/1000/60/60/24);