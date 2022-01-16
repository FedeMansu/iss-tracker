import React from 'react';
import L from 'leaflet';
import $ from 'jquery';

class Map extends React.Component{
  //inizializzo le variabili dinamiche
  constructor() {
    super();
    this.state = {
      nextLat:'',
      nextLng:'',
      risetime:[],
      duration:[],
      meteo:['','',''],
      woeid:'', 
      wasClick: false
    };
  }
  componentDidMount = () => {
    // creo la mappa
    let map = L.map('map').setView([0,1], 2);

    //recupero la posione della stazione e imposto le coordinate
    const ISS = () => {
        $.getJSON('http://api.open-notify.org/iss-now.json?callback=?', function(data) {
            let lat = data['iss_position']['latitude'];
            let lon = data['iss_position']['longitude']; 
            iss.setLatLng([lat, lon]);
            isscirc.setLatLng([lat, lon]);
            map.panTo([lat, lon]);
        }); 
        setTimeout(ISS, 40000); 
    }   
    //imposto il layer con la mappa
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(map);

    //creo dei cerchi per segnare la stazione sulla mappa
    let iss = L.circle([0, 0], {color: "red", radius: 1}).addTo(map); 
    let isscirc = L.circle([0,0], 2200e3, {color: "87816f", opacity: 0.3, weight:1, fillColor: "#87816f", fillOpacity: 0.2}).addTo(map); 
    
    //chiamo la funzione per l'update della posizione
    ISS();
    
    //al click sulla mappa memorizzo le coordinate, stampo un popup e avvio flyover() woeid()
    let popup = L.popup();    
    const onMapClick = (e) => {
        popup
            .setLatLng(e.latlng)
            .setContent("Hai cliccato nella seguente posizione: " + e.latlng.lat + " "+ e.latlng.lng)
            .openOn(map);
        this.setState({nextLat: e.latlng.wrap().lat});
        this.setState({nextLng: e.latlng.wrap().lng});
        flyover();
        nextMeteo();
        this.setState({wasClick: true});
    }
    map.on('click', onMapClick);

    //recupero i dati riguradanti i fly-over
    const flyover = () => {
      $.getJSON('http://api.open-notify.org/iss-pass.json?lat=' + this.state.nextLat + '&lon=' + this.state.nextLng, (data) => {
          let risetime = $.map(data.response, function (a) {
            return a.risetime
          });
          this.setState({risetime: risetime});
          let duration = $.map(data.response, function (a) {
            return a.duration
          });
          this.setState({duration: duration});
      });
    }

    //recupero i dati riguardanti il meteo
    const nextMeteo = () => {
      $.getJSON('https://www.metaweather.com/api/location/search/?lattlong=' + this.state.nextLat + ',' + this.state.nextLng, (data) => {
          this.setState({woeid: data[0]['woeid']});
      });
      let weather = (new Date (this.state.risetime[0]*1000));
      $.getJSON('https://www.metaweather.com/api/location/' + this.state.woeid + '/' +  weather.getFullYear() + '/' + (weather.getMonth()+1) + '/' + weather.getDate() + '/', (data) => {
          this.setState({meteo: data});
      });
    }
  }  
  render() {
    return <div>
            <div id="map"></div>
            {this.state.wasClick ? (<table id='table'>
                <thead>
                  <tr>
                    <th>Prossimi passaggi</th>
                    <th>Visibile per questi secondi</th>
                    <th>Meteo previsto per i prossimi 3 giorni</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      {this.state.risetime.map((data, index) => (
                      <p key={index}>{(new Date (data*1000)).toLocaleString()}</p>))}
                    </td>
                    <td>
                      {this.state.duration.map((data, index) => (
                      <p key={index}>{data}</p>))}
                    </td>
                    <td>
                    <p>{this.state.meteo[0]['weather_state_name']}</p>
                    <p>{this.state.meteo[1]['weather_state_name']}</p>
                    <p>{this.state.meteo[2]['weather_state_name']}</p>
                    </td>
                  </tr>
                </tbody>
              </table>) : ('')}
            </div>
  }
}
export default Map;