var Hapi = require('hapi');
var path = require('path');
var Inert = require('inert');
var request = require("request");
var server = new Hapi.Server();
var rawUrl = "https://github.com/mrmrs/colors";
var params = rawUrl.split('/');
var url = "https://api.github.com/repos/"+params[3]+"/"+params[4];
console.log(url);
allData = [];
server.connection({
    port : Number(process.argv[2] || 8000),
    routes: {
      cors:true
    }

});
server.register(Inert,function(err){
    if(err) throw err;
});
var d = new Date().valueOf();
d = d - 7*3600000;
var date = new Date(d).toISOString();
console.log(date);

server.route({
    path : '/',
    method : 'GET',
    handler : function(request,reply){
        reply.file('index.html');
    }
});
server.route({

    path : '/length',
    method : 'GET',
    handler : function(request,reply){
        reply(allData);
    }
});

server.route({
  path: '/demo',
  method: 'POST',
  handler: function(request,reply){
    var rawUrl = request.payload.url;
    var params = rawUrl.split('/');
    allData = [];
    var url = "https://api.github.com/repos/"+params[3]+"/"+params[4];
    new Promise(function(resolve, reject) {
      var status = getAllData(url,1,resolve);
    }).then(function(data){
      var returnData1 = [];
      var returnData2 = [];
      var returnData3 = [];
      var now = new Date().valueOf();
      var twentyFour = now - 24*3600000;
      var week = now - 168*3600000;
      for (var i = 0; i < allData.length; i++) {
        if (allData[i].pull_request) {
          // console.log('this is not issue');
        }
        else{

          var currentDate = new Date(allData[i].created_at).valueOf();
          if(currentDate > twentyFour){
            console.log('less than 24 called');
              returnData1.push(allData[i]);
          }
          else if(currentDate < twentyFour && currentDate > week){
            console.log('24 hours to one week');
            returnData2.push(allData[i]);
          }
          else{
            console.log('more than one week');
            returnData3.push(allData[i]);
          }
        }
      }
      // reply('less than 24 hours ='+returnData1.length);
      reply({
        one : "less than 24 hours = "+returnData1.length,
        two : "24 hours to one week = "+ returnData2.length,
        three : "more than one week = "+ returnData3.length
      });
    });
  }
});

server.start(function(){
    console.log('Hapi Server running at ' + server.info.uri);
    // getAllData(url,1);
});

function getAllData(uri,number,resolve){
  var i = number;
  var options = {
    method: 'GET',
    url: uri+'/issues?per_page=100&page='+i,
    headers:
     { 'postman-token': '7da3eaeb-f77d-427e-05e1-dcdfa0a321b4',
       'cache-control': 'no-cache',
       'User-Agent':'akshay111meher'
     }
   };

  request(options, function (error, response, body) {
    console.log(JSON.parse(body).length);
    console.log(response.headers.link);
    if (response.headers.link && JSON.parse(body).length!=0) {
      allData = allData.concat(JSON.parse(body));
      getAllData(uri,i+1,resolve);
    }
    else{
      allData = allData.concat(JSON.parse(body));
      resolve('done');
    }
  });

}
