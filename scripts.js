let storeCenter = { lng: -80.2736907, lat: 25.933373 }

initMap = () => { 
 
  let initialized = false // A flag so initialMap is only initialized once. 

  if (initialized === false) {
  let initialMap = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: { lat: 25.933373, lng: -80.2736907 }
  })
  let marker = new google.maps.Marker({
    position: storeCenter,
    map: initialMap
  })
  initialized = true
}

  let modalMap = new google.maps.Map(document.getElementById('modal-map'), {
    zoom: 12,
    center: { lat: 25.933373, lng: -80.2736907 }
  })
  let modalMarker = new google.maps.Marker({
    position: storeCenter,
    map: modalMap
  })

  google.maps.event.addListenerOnce(modalMap, 'idle', function() {
    loadAreas()
  })
}

let delivery_areas = []
//gloal object for different shapes?  

const loadAreas = () => {
  console.log('call')
  let newLayers = []
  let bounds = new window.google.maps.LatLngBounds()
  delivery_areas = localStorage.getItem('delivery_areas')

  if (delivery_areas.length > 0) {
    delivery_areas.forEach(element => {
      if (element.type === 'radius') {
        let newShape = new window.google.maps.Circle({
          strokeColor: element.color,
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: element.color,
          fillOpacity: 0.25,
          map: map,
          center: element.coordinates,
          radius: element.details * 1000
        })
        $(window.google.maps.event.addListener).mouseover(function(){
          $('newShape').data({fillOpacity: 0.6}) //double check this 
        })  
        $(window.google.maps.event.addListener).mouseout(function(){
          $('newShape').data({ fillOpacity: 0.6 })
        })
        newLayers.push(newShape)
      } else {
        let newShape = new window.google.maps.Polygon({
          paths: element.coordinates,
          strokeColor: element.color,
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: element.color,
          fillOpacity: 0.25,
          map: map
        })
      }
    })
  }
  for (var i=0; i < newLayers.length; i++){
      if(delivery_areas[i].type!=='radius') {
        var paths = newLayers[i].getPaths();
         paths.forEach(function(path){
           var ar = path.getArray();
           for(var i=0, l = ar.length; i <l; i++) {
              bounds.extend(ar[i]);
            }
        })
      } else {
        // console.log(newLayers[i].position)
        bounds.union(newLayers[i].getBounds());
      }
    }
    if(newLayers.length > 0) {
      map.fitBounds(bounds);
    } else {
      map.setCenter(storeCenter);
    }
    currentLayers = newLayers;
  }



      

