
    var gyear=2010;
    var dataLayer=undefined;
   // var query= 1 //"stabilized"
    var query=0; //"complaint"

    // initialize the map
    var map = L.map('map').setView([40.778, -73.942], 11);
    $(function() {
      render(gyear);
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
    });

    function yearChanged(year){
      console.log(year);
      gyear = year;
      map.removeLayer(dataLayer);
      render(gyear);
    }

    // load a tile layer
    L.tileLayer('http://{s}.tiles.mapbox.com/v3/heatseeknyc.jjl743fc/{z}/{x}/{y}.png', {
              attribution: 'Map Data © OpenStreetMap contributors, CC-BY-SA, Tile Set © Mapbox, Complaint Data © NYC Open Data',
              maxZoom: 18
    }).addTo(map);

    // load geojson layer
    function addDataToMap(geojsondata, zipcodedata, map, year) {
      dataLayer = L.geoJson(geojsondata, {
        onEachFeature: function(feature, layer){

        },
        style: function(feature){
          return getFeatureStyle(feature, zipcodedata, year, query)
        }
      });
      dataLayer.addTo(map);
    }

    function render(year){
      $.getJSON("data/neighborhoods.geojson", function(geojsondata) { 
        $.getJSON("data/dataZipcodeIndexed.json", function(jointdata) {
          if (dataLayer!=undefined){
            map.removeLayer(dataLayer);
          }
          addDataToMap(geojsondata, jointdata, map, year); 
        });
      });
    }

    function getFeatureStyle(feature, jointdata, year, query){
      var targetZip = feature.properties.postalCode;
      var records = jointdata.features;
      console.log(records)
      var key=0;
      //console.log(query)
      //console.log("year:", year)

      if (query==0){ //complaints
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
      else{ // rent stabilization
        for (var i in records) {
          if (targetZip == records[i].zipcode) {
            for (var j in records[i].data){
              if (records[i].data[j].year == year) {
                key = records[i].data[j].number_stabilized;
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
          fillOpacity: getColor(key)
        };
      }
      else if (key >0 && query==1){
        return { 
          weight: 1,
          color: '#000000',
          opacity: 0.3,
          fillColor: '#088989',
          fillOpacity: getColor(key)
        };
      }
      return {
        weight:1,
        fillColor: '#000000'
      }
    }

    // chloropleth
    function getColor(density) {
      var color = d3.scale.linear() // create a linear scale
        .domain([0, 5000])  // input uses min and max values
        .range([.1,1]);   // output for opacity between .3 and 1 %
        console.log(color(density))
      return color(density);  // return that number to the caller
    }
