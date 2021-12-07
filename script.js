//Mapbox setup
mapboxgl.accessToken = 'pk.eyJ1IjoiZXJpY2tlbmNlbCIsImEiOiJja3Rzdmdic28xYWd4MnBvMTJ6NGkxMndiIn0.7oo25-oKYFpovVc2irtlrA';
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/erickencel/ckwgy4b0n0coh15phrk439p7w', // style URL  
    center: [-69.765498, 37.618215], // starting position [lng, lat]
    zoom: 3 // starting zoom
});

//Add Hurricane Tracks layer and style color by category 
map.on('load', () => {
    map.addSource("hurricane_tracks", {
        type: "vector",
        url: 'mapbox://erickencel.92taz91s'
    }); 

    map.addLayer({
        id: 'Historical Hurricane Tracks',
        source: 'hurricane_tracks',
        "source-layer" : 'Hurricanetracks-co6dsh',
        'layout': {
            // Make the layer not visible by default.
            'visibility': 'none',
        },
        type: 'line',
        paint: {
            'line-width': 1,
            'line-color': ['match',
            ['get', 'MaxCat'],  //get match field must be string type
            '0','#6415FF','1','#B215FF','2','#FF15E9','3','#FF1515','4','#FF8B15','5','#F8FF1A', /* other */ '#6415FF' 
            ]
        }
    });
});


//Add Probaility grid layer and style by landfall probability
map.on('load', () => {
        map.addSource("probability_hexgrid", {
            type: "vector",
            url: 'mapbox://erickencel.3d5f84ju'
        }); 

    map.addLayer({
        id: 'Landfall Probability Grid',
        source: 'probability_hexgrid',
        "source-layer" : 'Hexgrid_probability-17h4e6',
        'layout': {
            // Make the layer not visible by default.
            'visibility': 'none',
        },
        type: 'fill',
        paint: {
            'fill-outline-color': '#606060',
            'fill-color': ['match',
            ['get', 'Prob_str'],  //get match field must be string type
            '10','#6415FF','20','#8B15FF','30','#B215FF','40','#E115FF','50','#FF15E9',
            '60','#FF1515','70','#FF5C15','80','#FF8B15','90','#FADF55','100','#FBFF73', /* other */ '#6415FF'
            ]
        }
    });
});


//Setup for layer selector menu TOC
map.on('idle', () => {

    // Enumerate ids of the layers.
    const toggleableLayerIds = ['Historical Hurricane Tracks', 'Landfall Probability Grid'];

    // Set up the corresponding toggle button for each layer.
    for (const id of toggleableLayerIds) {
        // Skip layers that already have a button set up.
        if (document.getElementById(id)) {
            continue;
        };
    
        // Create a link.
        const link = document.createElement('a');
        link.id = id;
        link.href = '#';
        link.textContent = id;
        link.className = '';
        
        // Show or hide layer when the toggle is clicked.
        link.onclick = function (e) {
            const clickedLayer = this.textContent;
            e.preventDefault();
            e.stopPropagation();
     
            const visibility = map.getLayoutProperty(
                clickedLayer,
                'visibility'
            );

            // Toggle layer visibility by changing the layout object's visibility property.
            if (visibility === 'visible') {
                map.setLayoutProperty(clickedLayer, 'visibility', 'none');
                this.className = '';
                //Toggle Legend Visibility
                if (clickedLayer === 'Landfall Probability Grid'){
                    document.getElementsByClassName("legend-container")[0].style.visibility = "hidden";
                    document.getElementsByClassName("legend-color-container")[0].style.visibility = "hidden";
                } else {
                    document.getElementsByClassName("filter-container")[0].style.visibility = "hidden";
                 }
            } else {
                this.className = 'active';
                map.setLayoutProperty(
                    clickedLayer,
                    'visibility',
                    'visible'
                );
                //Toggle Legend Visibility
                if (clickedLayer === 'Landfall Probability Grid'){
                    document.getElementsByClassName("legend-container")[0].style.visibility = "visible";
                    document.getElementsByClassName("legend-color-container")[0].style.visibility = "visible";
                } else {
                    document.getElementsByClassName("filter-container")[0].style.visibility = "visible";
                 }
            }
        };

        const layers = document.getElementById('menu');
        layers.appendChild(link);
    };
});


//Hurricane Track Category Filter Button interaction
const buttonEls = document.querySelectorAll(".filter-button");

buttonEls.forEach((button) => {
    button.addEventListener("click", (e) => buttonClicked(e));
});
//When filter button is clicked, filter data to match query
const buttonClicked = (e) => {
    const buttonIsSelected = e.target.classList.contains("selected");
    if (buttonIsSelected) {
        e.target.classList.remove("selected");
        map.setFilter("Historical Hurricane Tracks", null);
    }   else {
        buttonEls.forEach((button) => button.classList.remove("selected"));     //loops through and sets background color to grey first, then white when selected
        e.target.classList.add("selected");
        map.setFilter("Historical Hurricane Tracks", ["==", "MaxCat", e.target.dataset.operator]);  //filter out all the points that have an element attribute = attribute name in data 
    }
};

//Filter reset button
const buttonRes = document.querySelectorAll(".reset-button");

buttonRes.forEach((button) => {
    button.addEventListener("click", (e) => resbuttonClicked(e));
});
//When reset button is clicked, clear filters on data 
const resbuttonClicked = (e) => {
    buttonEls.forEach((button) => button.classList.remove("selected"));
    map.setFilter("Historical Hurricane Tracks", null);  
};


//Popup setup for Hurricane Tracks Layer
const popup = new mapboxgl.Popup({closeButton: false});

//Popup data setup
map.on('click', 'Historical Hurricane Tracks', (e) => {
    const coordinates = e.lngLat;
    let StormName = e.features[0].properties['Name']
    StormName = StormName?`Storm Name: ${StormName}`:'Storm Name: Not Provided'
    let StormCat = e.features[0].properties['MaxCat']
    StormCat = StormCat?`Storm Category: ${StormCat}`:'Storm Category: Not Provided'
    let StormWind = e.features[0].properties['MaxWindMPH']
    StormWind = StormWind?`Max Wind Speed: ${StormWind} MPH`:'Max Wind Speed: Not Provided'
    let StormYear = e.features[0].properties['Year']
    StormYear = StormYear?`Year: ${StormYear}`:'Year: Not Provided'
    let StormLandfall = e.features[0].properties['Landfall']
    StormLandfall = StormLandfall?`Landfall: ${StormLandfall}`:'Landfall: Not Provided'

    //Popup layout setup
    popup.setLngLat(coordinates).setHTML(
        `<p>${StormName}</p>
        <p>${StormCat}</p>
        <p>${StormWind}</p>
        <p>${StormYear}</p>
        <p>${StormLandfall}</p>`
        ).addTo(map);
});

//Change cursor when hovering over hurricane track
map.on('mouseenter', 'Historical Hurricane Tracks', () => {
    map.getCanvas().style.cursor = 'pointer'
});

map.on('mouseleave', 'Historical Hurricane Tracks', () => {
    map.getCanvas().style.cursor = ""
});


//Popup setup for Landfall Probability Grid
const popupn = new mapboxgl.Popup({closeButton: false});

//Popup data setup
map.on('click', 'Landfall Probability Grid', (e) => {
    const coordinatesn = e.lngLat;
    //add in check for cat = 0 for TS
    let LandFallProb = e.features[0].properties['Prob_str']
    LandFallProb = LandFallProb?`Probability of Landfall: ${LandFallProb} %`:'Probability of Landfall: Not Provided'
    let TrackCount = e.features[0].properties['Trackc_str']
    TrackCount = TrackCount?`Storm Track Count: ${TrackCount}`:'Storm Track Count: Not Provided'

    //Popup layout setup
    popupn.setLngLat(coordinatesn).setHTML(
        `<p>${LandFallProb}</p>
        <p>${TrackCount}</p>`
        ).addTo(map);
});

//Change cursor when hovering over probability grid
map.on('mouseenter', 'Landfall Probability Grid', () => {
    map.getCanvas().style.cursor = 'pointer'
});

map.on('mouseleave', 'Landfall Probability Grid', () => {
    map.getCanvas().style.cursor = ""
});


