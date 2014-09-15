var $_GET = {}; //filled by checkGets()
var state = null;
var key = '43f451cf430950000bd903630d362ebf'; //BreweryDB API key
var GoogleKey = 'AIzaSyBVjZXb0yBn1k874yqgQLjvY-0a06eYP-A'; //Maps API key
var pages = 1; 

$(document).on("keypress", 'form', function (e) { //Disable searchbar form submission
    var code = e.keyCode || e.which;
    if (code == 13) { //keycode 13 = enter
        e.preventDefault();
        return false;
    }
});

function showLocationEntry(){

  $('#enterLocation').fadeIn(1000);
  $('#data').fadeOut(1000);
  $('#myLocation').fadeOut(1000);
}

function showGeolocatedInfo(lat,lng){

  //create HTML elements dynamically
  var loc = 'Latitude: ' + lat + '&nbsp;&nbsp;|&nbsp;&nbsp;' + 'Longitude: ' + lng;
  var info = '<button class="ui-btn" onclick="getNearResults(' + lat + ',' + lng + ',$(\'#range\').val());" id="submitGeo">' + loc + '</button>';
  info += '<button class="ui-btn" onclick="$(\'#myLocation\').fadeOut(1000);locateMe();" name="tryAgain" id="tryAgain">Try locating me again</button>';
  
  $('#enterLocation').fadeOut(1000);
  $('#data').fadeOut(1000);
  $('#myLocation').html(info);
  $('#myLocation').fadeIn(1000);
}

function locateMe(){

  //TODO: Why is onSuccess a variable and onError a fcn?

  $('#enterLocation').fadeOut();

  //position object contains GPS coordinates
  var onSuccess = function(position) {
      var lat = position.coords.latitude;
      var lng = position.coords.longitude;
      
      showGeolocatedInfo(lat,lng);
  };

  //error object contains error details
  function onError(error) {
      alert('In order to use automatic geolocation, you must allow us to access your location.');
  }
  
  navigator.geolocation.getCurrentPosition(onSuccess, onError);
}

function getLatLng(address,range){

  if($('#address').val() != ""){
    var url = 'https://maps.googleapis.com/maps/api/geocode/json?key=' + GoogleKey + '&address=' + address;
    $.ajax({
      url: url,
      //dataType: 'json', Further testing will be needed to see if i need this
      
      //xhr contains returned data
      success: function(xhr,status){
      
        console.log(xhr);
        var lat = xhr.results[0].geometry.location.lat;
        var lng = xhr.results[0].geometry.location.lng;
        getNearResults(lat,lng,range);
      },
      
      //xhr contains returned data
      error: function(xhr,status){
      
        window.alert('Geocoding error:' + status);
        console.log(xhr);
      }
    });
  } else {
    alert('Please enter your location, as you would on google maps. For example, "1600 Pennsylvania Ave, Washington, DC"');
  }
}

function getStateResults(){

  state = $('#stateSelect').val();
  if(state != null){  //this ensures a state has been selected before trying to run
  
    $('#data').html('Displaying: ' + toTitleCase(state));  //Replace whatever is in #data with "Displaying: Name"    
    
    var url = 'http://api.brewerydb.com/v2/locations?region=' + state + '&key=' + key;
    
    pages = 1; //ensure this is 1 before we start
    
    getStatePage(url, 1); //recursive function to get every page of result
      
  }
}

function getStatePage(url, i){

  $.ajax({
    dataType: 'json',
    url: url, 
    
    //xhr contains returned data
    success: function(xhr, status){
    
      console.log(xhr);
      onStateResultsReturn(xhr);
      pages = xhr.numberOfPages;
      if(pages > 1){
        i++;
        if(i <= pages){
          url += "&p=" + i;
          console.log(url);
          getStatePage(url,i);
        }
      }
    },
    
    //xhr contains returned data
    error: function(xhr, status){
    
      console.log(status);
      window.alert("Something failed. Contact ghostbusters, " +
          "or someone else who'd know how to fix this. Status error: " + status);
    }
  });
  pages = 1;
}

function onStateResultsReturn(xhr){

  if (typeof xhr.data == 'undefined') {
    alert('We couldn\'t find any breweries in your country.');
  } else {
    for (x = 0; x < xhr.data.length;x++){ //loop through each result in the returned page
    
      //titleString will be applied to button on selection list. Buttons are links inside of div#breweryId
      var titleString = (xhr.data[x].brewery.name || 'Unnamed brewery') + " (" +
        (xhr.data[x].locality || 'Unknown locality') + ", " +
        (xhr.data[x].locationTypeDisplay || 'Unknown location type') + ")";
        
        
      var breweryId = xhr.data[x].id;
      var row = document.createElement("a"); //setup link
      row.rel = "external";
      row.href = 'brews.html?id=' + breweryId;
      row.className = "ui-btn";
      row['data-transition'] = 'flow';
      row.innerHTML += '<p>' + titleString + '</p>';

      var rowDiv = document.createElement("div"); //setup div
      rowDiv.id = breweryId;

      rowDiv.appendChild(row); //add link to div, add div to page
      document.getElementById("data").appendChild(rowDiv);
    }
  }
}

function getCountryResults(displayCountry){

  var country = $("#countrySelect").val();
  if(country != null){  //this ensures a country has been selected before trying to run
  
    $('#data').html('Displaying: ' + displayCountry);  //Replace whatever is in #data with "Displaying: Name"     
    
    var url = 'http://api.brewerydb.com/v2/locations?countryIsoCode=' + country + "&key=" + key;
    
    pages = 1; //ensure this is 1 before we start
    
    getCountryPage(url, 1); //recursive function to get every page of result
  }
}

function getCountryPage(url, i){

  $.ajax({
    dataType: 'json',
    url: url, 
    
    //xhr contains returned data
    success: function(xhr, status){
    
      console.log(xhr);
      onCountryResultsReturn(xhr);
      pages = xhr.numberOfPages;
      if(pages > 1){
        i++;
        if(i <= pages){
          url += "&p=" + i;
          console.log(url);
          getCountryPage(url,i);
        }
      }
    },
    
    //xhr contains returned data
    error: function(xhr, status){
    
      console.log(status);
      window.alert("Something failed. Contact ghostbusters, " +
          "or someone else who'd know how to fix this. Status error: " + status);
    }
  });
  pages = 1;
}

function onCountryResultsReturn(xhr){

  if (typeof xhr.data == 'undefined') {
    alert('We couldn\'t find any breweries in your country.');
  } else {
    for (x = 0; x < xhr.data.length;x++){ //loop thru each result in the returned page
      
      //titleString will be applied to button on selection list. Buttons are links inside of div#breweryId
      var titleString = (xhr.data[x].brewery.name || 'Unnamed brewery') + " (" +
        (xhr.data[x].locality || 'Unknown locality') + ", " + (xhr.data[x].region || 'Unknown region') +
        " " + (xhr.data[x].locationTypeDisplay || 'Unknown location type') + ")";
        
      var breweryId = xhr.data[x].id;
      var row = document.createElement("a"); //setup link
      row.rel = "external";
      row.href = 'brews.html?id=' + breweryId;
      row.className = "ui-btn";
      row['data-transition'] = 'flow';
      row.innerHTML += '<p>' + titleString + '</p>';

      var rowDiv = document.createElement("div"); //setup div
      rowDiv.id = breweryId;

      rowDiv.appendChild(row); //add link to div, add div to page
      document.getElementById("data").appendChild(rowDiv);
    }
  }
}

function getNearResults(lat,lng,radius){
  
  $('#data').fadeOut(); //clear div of previous results
  $('#data').html("");
  
  var url = 'http://api.brewerydb.com/v2/search/geo/point?lat=' + lat + '&lng=' + lng + '&key=' + key + '&radius=' + radius;
  
  pages = 1; //ensure this is 1 before we start
  
  getNearPage(url, 1); //recursive function to get every page of result
}

function getNearPage(url, i){

  $.ajax({
    dataType: 'json',
    url: url, 
    
    //xhr contains returned data
    success: function(xhr, status){
    
      console.log(xhr);
      onNearResultsReturn(xhr);
      pages = xhr.numberOfPages;
      if(pages > 1){
        i++;
        if(i <= pages){
          url += "&p=" + i;
          console.log(url);
          getNearPage(url,i);
        }
      }
    },
    
    //xhr contains returned data
    error: function(xhr, status){
    
      console.log(status);
      window.alert("Something failed. Contact ghostbusters, " +
          "or someone else who'd know how to fix this. Status error: " + status);
    }
  });
  pages = 1;
}

function onNearResultsReturn(xhr){

  $('#enterLocation').fadeOut(); //fade out the location selection divs
  $('#myLocation').fadeOut();
  
  if (typeof xhr.data == 'undefined') {
    alert('We couldn\'t find any breweries in your country.');
  } else {
    for (x = 0; x < xhr.data.length;x++){ //loop thru each result in the returned page
    
      //titleString will be applied to button on selection list. Buttons are links inside of div#breweryId
      var titleString = (xhr.data[x].brewery.name || 'Unnamed brewery') + " (" +
                        (xhr.data[x].locality || '') + ", " +
                        (xhr.data[x].locationTypeDisplay || 'Unknown location type') + ")";
      
      var breweryId = xhr.data[x].id;
      var row = document.createElement("a"); //setup link
      row.rel = "external";
      row.href = 'brews.html?id=' + breweryId;
      row.className = "ui-btn";
      row['data-transition'] = 'flow';
      row.innerHTML += '<p>' + titleString + '</p>';

      var rowDiv = document.createElement("div"); //setup div
      rowDiv.id = breweryId;

      rowDiv.appendChild(row); //add link to div, add div to page
      document.getElementById("data").appendChild(rowDiv);
    }
    $('#data').fadeIn(1000); //lastly, fade in the returned results
  }
}

function checkGets(){ //stackoverflow code, but hey it works. Used to check GET vars on the client side.

  if(document.location.toString().indexOf('?') !== -1){
    var query = document.location.toString().replace(/^.*?\?/, '').split('&');
    for(var i=0, l=query.length; i<l; i++){
      var aux = decodeURIComponent(query[i]).split('=');
      $_GET[aux[0]] = aux[1];
    }
  }
}

function getMoreInfo(id){

  var url = 'http://api.brewerydb.com/v2/location/' + id + "?key=" + key; //creates the api endpoint.
  
  //async option specifies if request is to be made synchronous or not
  
  $.ajax({
    dataType: 'json',
    url: url,
    
    success: function(xhr, status){  //runs on 200 status
    
      populateBreweryPage(xhr.data);
    },
    error: function(xhr, status){    //runs on other (failure) statuses
  
      console.log(status);
      window.alert("Something failed. Contact ghostbusters," +
        " or someone else who'd know how to fix this. Status error: " + status);
      return xhr.data;
    }
  });
}

$( document ).on( 'pageinit', '#breweryPage', function() {

	onBreweryPageInit();
});

function onBreweryPageInit(){

  checkGets();
  var id = $_GET['id']; //brewery id
  getMoreInfo(id);
}

//refactored. Below function was a part of getMoreInfo()
function populateBreweryPage(breweryInfo){
  
  //Use breweryInfo to fill the page
  $("#title").append('<h3>' + (breweryInfo.brewery.name || 'Untitled Brewery') + '</h3>');

  $("#location").append("<p>" + (breweryInfo.streetAddress || 'No Address Given') + "<br />" +
    (breweryInfo.locality || 'No City Given') + ", " + (breweryInfo.region || 'No State Given') +
    " " + (breweryInfo.postalCode || 'No Postal Code Given') + "</p>");

  $("#location").append("<p>" + (breweryInfo.locationTypeDisplay || 'No Brewery Type Given') + "</p>");

  if(breweryInfo.openToPublic == "N"){
    $("#open").append('<p>This location is <b style="color:red;">not</b> open to the public</p>');
  } else {
    $("#open").append("<p>This location is open to the public, and the hours of operation are: " +
        ( breweryInfo.hoursOfOperation || 'Not Given'));
  }

  $("#descriptionText").append('<p>' +
    (breweryInfo.brewery.description || 'This brewery has not provided a description.') + '</p>');

  if(breweryInfo.brewery.website != undefined){
    $("#moreInfo").append('<p>Website: <a href="' + breweryInfo.brewery.website +
        '" title="View this company on their own webpage">' + breweryInfo.brewery.website + '</a></p>');
  } else {
    $("#moreInfo").append('<p>This brewery has not added a website.</p>');
  }

  $("#moreInfo").append("<p>Phone: " + (breweryInfo.phone || 'No phone number given.') + "</p>");

  
  //Next, add a google-maps image.
  
  //start by determining image size and location
  var width = $(document).width();
  var height = 400;
  var imgSize = width + "x" + height;
  
  var latitude = breweryInfo.latitude;
  var longitude = breweryInfo.longitude;

  //add the image to the page
  $("#googleImg").append('<img src="http://maps.googleapis.com/maps/api/staticmap?maptype=satellite&center=' +
    latitude + "," + longitude + "&markers=color:blue%7C" + latitude + "," + longitude + '&zoom=17&size=' +
    imgSize + '&sensor=false&key=AIzaSyBVjZXb0yBn1k874yqgQLjvY-0a06eYP-A" alt="Map of the area" />');
}


function toTitleCase(str){ //once again stolen from stackoverflow

  var x = str.replace('%20',' '); //strings with spaces are stored like new%20york, change those to spaces
  
  //capitalize the first letter of every word, lowercase the rest.
  return x.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
  
  //new%20york becomes New York, nEVADA becomes Nevada
}

function addToFavorites(id){

  addToLocalList(id); //Save to local favorites list

  //sendToAggregationServer(id); //Send breweryId to aggregation server
}

function addToLocalList(id){

  var rawFavorites = getFileContents();
  var favorites = rawFavorites.split(",");
  
  if(!exists(id,favorites)){
    if(rawFavorites == ''){
      rawFavorites = id;
    } else {
      rawFavorites += ',' + id;
    }
    overwriteFile(rawFavorites);
  } else {
    alert('You\'ve already added this brewery to your favorites.');
  }
}

function getFileContents(){

  var defaultVal = '';
  if(localStorage.getItem('favorites') != undefined){
    return localStorage.getItem('favorites');
  } else {
    localStorage.setItem('favorites',defaultVal);
    return defaultVal;
  }
}

function exists(element,array){ //simple algorithm to check if element exists in array

  var length = array.length;
  for(var item = 0;item < length;item++){
    if(array[item] == element){
      return true;
    }
  }
  return false;
}

function overwriteFile(file){

  console.log(file);
  localStorage.setItem('favorites',file);
}

$( document ).on( 'pageinit', '#favoritesPage', function() {
  onFavoritesPageInit();
});

function onFavoritesPageInit() {

  var rawFavorites = getFileContents();
  var favorites = rawFavorites.split(",");
  
  lookupFavorites(favorites);
}

function lookupFavorites(ids) {

  var i = 0;
  var url = 'http://api.brewerydb.com/v2/location/' + ids[0] + "?key=" + key; //creates the first api endpoint    var length = ids.length;
  var strings = [];
  if (strings.length > 0) {
    lookupBreweries(length, ids, strings, i, url); //starts the recursive ajax lookup
  }
}

function lookupBreweries(length, ids, strings, i, url){
  $.ajax({
    dataType: 'json',
    url: url,
    success: function(xhr, status){  //runs on 200 status
      
      console.log(xhr);
      strings[i] = (xhr.data.brewery.name || 'Unnamed brewery') + " (" +
        (xhr.data.locality || 'Unknown locality') + ", " + (xhr.data.region || 'Unknown region') +
        " " + (xhr.data.locationTypeDisplay || 'Unknown location type') + ")";
      i++;
      if(i < length){
        url = 'http://api.brewerydb.com/v2/location/' + ids[i] + "?key=" + key;
        lookupBreweries(length, ids, strings, i, url);
      } else {
        populateFavoritesPage(strings, ids);
      }
      
    },
    error: function(xhr, status){    //runs on other (failure) statuses
      console.log(url);
      console.log(status);
      window.alert(url + " Something failed. Contact ghostbusters," +
        " or someone else who'd know how to fix this. Status error: " + status);
      return 'error';
    }
  });
}

function populateFavoritesPage(strings, ids){

  var stringLen = strings.length;
  var idLen = ids.length;
  if(stringLen == idLen){
    for(var item = 0;item < idLen;item++){
    
      var row = document.createElement("a"); //setup link
      row.rel = "external";
      row.href = 'brews.html?id=' + ids[item];
      row.className = "ui-btn";
      row['data-transition'] = 'flow';
      row.innerHTML += '<p>' + strings[item] + '</p>';

      var rowDiv = document.createElement("div"); //setup div
      rowDiv.id = ids[item];

      rowDiv.appendChild(row); //add link to div, add div to page
      document.getElementById("data").appendChild(rowDiv);
    }
  } else {
    console.log('ERROR: String array length != Id array length.');
  }
}

function clearFavorites() {
    localStorage.setItem('favorites', '');
    $('data').html('');
}