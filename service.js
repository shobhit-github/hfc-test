const url = require('url');
const fs = require('fs');


function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}


exports.findStoreService = function (req, res) {

    const reqUrl = url.parse(req.url, true);
    var latInput, lngInput;

    if (reqUrl.query.lat && reqUrl.query.lng) {
        latInput = reqUrl.query.lat;
        lngInput = reqUrl.query.lng;
    }
    

    var rawData = fs.readFileSync('./FullStackTest_DeliveryAreas.geojson');
    var StoreData = JSON.parse(rawData);
    var strArr = [];
    var response;

    StoreData.features.forEach(
        feature => {
            if (Array.isArray(feature.geometry.coordinates[0])) {
                feature.geometry.coordinates[0].forEach(
                    coordinateList => {
                        strArr.push({
                          storeName: feature.properties.Name,
                          distance: getDistanceFromLatLonInKm(latInput, lngInput, coordinateList[1], coordinateList[0])   
                        })
                    }
                )
            }
        }
    )
    strArr.sort((a,b) => (a.distance > b.distance) ? 1 : ((b.distance > a.distance) ? -1 : 0)); 
    
    response = strArr[0];

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(response));

};

exports.invalidRequest = function (req, res) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Invalid Request');
};