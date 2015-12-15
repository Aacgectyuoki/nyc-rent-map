
    var gyear=2010;
    var dataLayer=undefined;
   // var query= 1 //"stabilized"
    var query=0; //"complaint"
    var map, demographicData, coreData, geojsonData;

    var defaultStyle = {
      color: 'black', 
      weight: 1,
    }

    var hoverStyle = {
      color: 'black', 
      weight: 3,
    }

    $(function() {
      // initialize the map
      map = L.map('map').setView([40.778, -73.942], 11);
            // load a tile layer
      L.tileLayer('http://{s}.tiles.mapbox.com/v3/heatseeknyc.jjl743fc/{z}/{x}/{y}.png', {
                attribution: 'Map Data © OpenStreetMap contributors, CC-BY-SA, Tile Set © Mapbox, Complaint Data © NYC Open Data',
                maxZoom: 18
      }).addTo(map);
      $( "#slider" ).slider({
        position: 'topright',
        min: 2010,
        max: 2014,
        //values: [2010, 2011, 2012, 2013, 2014, 2015],
        //animate:"slow",
        orientation: "horizontal", 
        stop: function(event,ui){
          $('#slider-label').val(ui.value) 
          yearChanged(ui.value)
        }
      });

      $('#cbutton').click(function(e){
        console.log('cbutton clicked')
        query = 0;
        //map.removeLayer(dataLayer)
        render(gyear);
      });
      $('#sbutton').click(function(e){
        console.log('cbutton clicked')
        query = 1;
        //map.removeLayer(dataLayer)
        render(gyear);
      });

      $.getJSON("data/Income_Bronx2013Zip.json", function(loaded) {
        demographicData = loaded;
        $.getJSON("data/neighborhoods.geojson", function(loaded) {
          geojsonData = loaded;
          $.getJSON("data/jointdata.json", function(loaded) {
            coreData = loaded;
            render(gyear);
          });
        });
      });
    });

    function render(year){    
      var oldDataLayer = dataLayer;
      addDataToMap(geojsonData, coreData, map, year, query);
      
      if (oldDataLayer!=undefined){
        console.log('old',oldDataLayer)
        console.log('current',dataLayer)
        map.removeLayer(oldDataLayer); 
      }  
    }
    // load geojson layer
    function addDataToMap(geojsonData, zipcodedata, map, year, query) {
      dataLayer = L.geoJson(geojsonData, {
        onEachFeature: function(feature, layer){
          // popup information about the demographic of the zipcode
          var popupHtml = getPopupContent(feature);
          //console.log(popupHtml)
          var popup = L.popup()
            .setContent(popupHtml)
          layer.bindPopup(popup);
          layer.on('mouseover', function (e){
            layer.setStyle(hoverStyle);
          });
          layer.on('mouseout', function (e){
            layer.setStyle(defaultStyle);
          });
        },
        style: function(feature){
          return getFeatureStyle(feature, zipcodedata, year, query)
        }
      });
      dataLayer.addTo(map);
    }

    function getPopupContent(feature){
      var targetZip = feature.properties.postalCode;
      var html = "Hello World"
      for (var i in demographicData){
        rec = demographicData[i]
        //console.log(rec)
        if (targetZip == rec.Zip) {
          html = '<div><strong> Demographics in 2013 </strong></div>' +
            '<div> Media Income: ' + rec["Median Income"] + '</div>' +
            '<div> Home Owners: '+ rec["Home Owners"] + '</div>' +
            '<div> Renters: ' + rec["Renters"] + '</div>' +
            '<div> % Difference: ' + rec["% Difference HO&R"] +'</div>'
        }
      }

      return html;
    }
    function getFeatureStyle(feature, cor, year, query){
      var targetZip = feature.properties.postalCode;
      var records = cor.features;
      var key=0;
      //console.log(query)
      //console.log("year:", year)
      if (query==0){
        for (var i in records) {
          if (targetZip == records[i].zipcode) {
            for (var j in records[i].data){
              if (records[i].data[j].year == year) {
                key = records[i].data[j].complaint_count;
              }
            }
          } 
        }
      }
      else{
        for (var i in records) {
          if (targetZip == records[i].zipcode) {
            for (var j in records[i].data){
              if (records[i].data[j].year == year) {
                key = records[i].data[j].percent_stabilized;
              }
            }
          } 
        }
      }  
      //console.log(zipcodedata.type)
      // return {
      //   weight: 2,
      //   color: '#000000'}
      if (key >0 && query==0){
        return { 
          weight: 1,
          color: '#000000',
          opacity: 0.3,
          fillColor: '#bc0b0b',
          fillOpacity: getColorComplaints(key)
        };
      }
      else if (key >0 && query==1){
        return { 
          weight: 1,
          color: '#000000',
          opacity: 0.3,
          fillColor: '#088989',
          fillOpacity: getColorRent(key)
        };
      }
      return {
        weight:1,
        fillColor: '#000000'
      }
    }

    function getColorComplaints(density) {
      // in the 4000's is highest number
      return density/5000;
    }

    function getColorRent(density) {
      return density;
    }

    function yearChanged(year){
      //console.log(year);
      gyear = year;
      render(gyear);
    }
