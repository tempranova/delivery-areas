//GLOBALS
let storeCenter = { lng: -80.2736907, lat: 25.933373 }
let delivery_areas = localStorage.getItem('delivery_areas') ? JSON.parse(localStorage.getItem('delivery_areas')) : []
let currentLayers = []
let colorCount = 0
let initialMap = false
let modalMap = false 
let editing = false
let clickedId = 0 
let type = 'radius'
let areaColor = false 
let newShape = false 

localStorage.setItem('delivery_areas', JSON.stringify(delivery_areas))

if(initialMap === false) { //ENSURES RENDERS ONLY ONCE FOR FUTURE FUNCTIONALITY
  initialMap = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: { lat: 25.933373, lng: -80.2736907 }
  })
  let marker = new google.maps.Marker({
    position: storeCenter,
    map: initialMap
  })
}

  modalMap = new google.maps.Map(document.getElementById('modal-map'), {
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

const getRandomColor = () => {
   let colors = [
    '#630460',
    '#c500c7',
    '#ed145b',
    '#ed1c24',
    '#ff5300',
    '#ffff00',
    '#63c000',
    '#00882a',
    '#005ec7',
    '#00145f'
  ];
  let thisColor = colors[colorCount];
  colorCount++;
  if(colorCount === 9) {
    colorCount = 0;
  }
  return thisColor;
}

const loadAreas = () => { 
  console.log('loadAreas called')
  let newLayers = []
  let bounds = new google.maps.LatLngBounds() 
  delivery_areas = JSON.parse(localStorage.getItem('delivery_areas'))

  if (delivery_areas.length > 0) {
    delivery_areas.forEach(element => {
    $(`<div class="area" id=${element.id}>${element.areaName}</div>`).appendTo('div.deliveryAreas').append(`<a class="remove" id=${element.id}>remove</a>`)
    $(`#${element.id}`).css({ 'border-color': `${element.color}` })


      if (element.type == 'radius') {
        let newShape = new google.maps.Circle({
          strokeColor: element.color,
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: element.color,
          fillOpacity: 0.25,
          map: initialMap,
          center: element.coordinates, // don't have this yet 
          radius: element.details * 1000
        })
        google.maps.event.addListener(newShape,"mouseover",function(){
          this.setOptions({fillOpacity: 0.6});
        });
        google.maps.event.addListener(newShape,"mouseout",function(){
          this.setOptions({fillOpacity: 0.25});
        });
        newLayers.push(newShape)
      } else {
        let newShape = new google.maps.Polygon({
          paths: element.coordinates,
          strokeColor: element.color,
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: element.color,
          fillOpacity: 0.25,
          map: initialMap
        })
      }
    })
  }

//UPDATED THIS FOR JQUERY USE BUT DOES NOT WORK YET 
  for (var i=0; i < newLayers.length; i++){
      if(delivery_areas[i].type!=='radius') {
        var paths = newLayers[i].getPaths();
         paths.forEach(path => {
           var ar = path.getArray();
           for(var i=0, l = ar.length; i <l; i++) {
              bounds.extend(ar[i]);
            }
        })
      } else {
        bounds.union(newLayers[i].getBounds());
      }
    }
    if(newLayers.length > 0) {
      initialMap.fitBounds(bounds); 
    } else {
      initialMap.setCenter(storeCenter);
    }
    currentLayers = newLayers;
  }

  //DELETE delivery_areas
  $(document).on("click", 'a.remove', function(event){ 
     event.stopPropagation() //PREVENT FROM OPENING MODAL 
    let id = this.id 
    let deliveryAreasCopy = JSON.parse(localStorage.getItem('delivery_areas')) 
    
    let newCopy = deliveryAreasCopy.filter(element =>{
      if(element.id != id) {
        return element
      }
    })
    //DELETE FROM UI DYNAMICALLY
    deliveryAreasCopy.forEach(element => {
      if(element.id == id) {
        $(`#${id}`).remove()
      }
    })
    localStorage.setItem('delivery_areas', JSON.stringify(newCopy))
  })

  //HIGHLIGHT FUNCTION
  $(document).on('mouseover', '.area', function(){
    console.log('highlightme')
  })

  //SLIDER FOR MODAL 
  $('#slider').slider()

 //MODAL FUNCTIONS

//OPEN MODAL WITH BLANK INPUT VALUES
$('button.add-new').click(function(){
  editing = false
  areaColor = getRandomColor()
   $('#newAreaModal').on('shown.bs.modal', function() {
     $('#area-name').val('')
     $('#minimum-order').val('')
     $('#delivery-charge').val('')
     $('#maximum-time').val('')

     newShape = new google.maps.Circle({
       strokeColor: areaColor,
       strokeOpacity: 0.8,
       strokeWeight: 2,
       fillColor: areaColor,
       fillOpacity: 0.25,
       map: modalMap,
       center: storeCenter,
       radius: (.4828032 * 1000 * 0.621371)  // in miles
     })
     //remove old map and put in new
     if (modalMap !== false) {

       
     }
   })
})

//ADD NEW AREA OR EDIT - button will operate differently depending on editing being true or false 
  $('button.save').click(function(event){ 

    if(editing === false) { 
    console.log('creating new delivery area')
    let areaName = $('#area-name').val()
    let minimumOrder = $('#minimum-order').val()
    let deliveryCharge = $('#delivery-charge').val()
    let maximumTime = $('#maximum-time').val()

    let newArea = {
      id : new Date().getUTCMilliseconds(),
      areaName,
      minimumOrder,
      deliveryCharge,
      maximumTime,
      type: type,
      new : true,
      details: 0.4828032,
      color: areaColor,
      coordinates: storeCenter
    }
     $(`<div class="area" id=${newArea.id}>${newArea.areaName}</div>`).appendTo('div.deliveryAreas').append(`<a class="remove" id=${newArea.id}>remove</a>`)
     $(`#${newArea.id}`).css({'border-color': `${newArea.color}`})
    
    let deliveryAreasCopy = JSON.parse(localStorage.getItem('delivery_areas'))
    deliveryAreasCopy.push(newArea)
    localStorage.setItem('delivery_areas', JSON.stringify(deliveryAreasCopy))
    //(if type == 'radius') 
    let newShape = new google.maps.Circle({
      strokeColor: newArea.color,
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: newArea.color,
      fillOpacity: 0.25,
      map: initialMap,
      center: newArea.coordinates,
      radius: newArea.details * 1000 * 0.621371 // in miles
    })
       google.maps.event.addListener(newShape,"mouseover",function(){
      this.setOptions({fillOpacity: 0.6});
    });
    google.maps.event.addListener(newShape,"mouseout",function(){
      this.setOptions({fillOpacity: 0.25});
    });
    let currentLayers = currentLayers
    currentLayers.push(newShape);
  } 
    //else if (type == 'custom_polygon')


  else {
  
  console.log('editing delivery area')
  let deliveryAreasCopy = JSON.parse(localStorage.getItem('delivery_areas')) 
  deliveryAreasCopy.forEach((element, index)=> {
    if(element.id == clickedId) {
      let areaName = $('#area-name').val()
      let minimumOrder = $('#minimum-order').val()
      let deliveryCharge = $('#delivery-charge').val()
      let maximumTime = $('#maximum-time').val()

      element.areaName = areaName
      element.minimumOrder = minimumOrder
      element.deliveryCharge = deliveryCharge
      element.maximumTime = maximumTime

      $(`#${element.id}`).replaceWith(`<div class="area" id=${element.id}>${element.areaName}</div>`)
      $(`#${element.id}`).append(`<a class="remove" id=${element.id}>remove</a>`)
      $(`#${element.id}`).css({ 'border-color': `${element.color}` })
    }
   })
   localStorage.setItem('delivery_areas', JSON.stringify(deliveryAreasCopy)) 
   editing = false 
  }
})

//select option 
$('#radius').click(function(){
  type = 'radius'
})
$('#postal').click(function(){
  type = 'postal'
})
$('#custom_polygon').click(function(){
  type = 'custom_polygon'
})

//THIS WILL CHANGE RADIUS 
$('#ex6').slider()
$('#ex6').on('slide', function(slideEvt) {

newShape.setMap(null)

newShape = new google.maps.Circle({
     strokeColor: areaColor,
     strokeOpacity: 0.8,
     strokeWeight: 2,
     fillColor: areaColor,
     fillOpacity: 0.25,
     map: modalMap,
     center: storeCenter,
     radius: (0.4828032 * 1000 * 0.621371) * slideEvt.value // in miles
   })


  $('#ex6SliderVal').text(slideEvt.value)
  })




  //EDIT DELIVERY AREAS 
  $(document).on('click', '.area', function(){
   
  let id = $(this).attr('id') 
  clickedId = id //Used for conditional in button 
  let deliveryAreasCopy = JSON.parse(localStorage.getItem('delivery_areas')) 

  deliveryAreasCopy.forEach((element,index) => {   //this will open a modal with the elements properties in the input bar 
  if(element.id == id) { 
  editing = true
    $('#newAreaModal').modal()
    $('#newAreaModal').on('shown.bs.modal', function() {
      $('#area-name').val(`${element.areaName}`)
      $('#minimum-order').val(`${element.minimumOrder}`)
      $('#delivery-charge').val(`${element.deliveryCharge}`)
      $('#maximum-time').val(`${element.maximumTime}`)
    })
      // currentLayers[index].setRadius(activeEdit.details*1000); add in later 
      }
  })
})





      

