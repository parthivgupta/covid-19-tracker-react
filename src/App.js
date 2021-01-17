import React, { useState, useEffect } from 'react';
import './App.css';
import {
          MenuItem,
          FormControl,
          Select, Card,
          CardContent
} from '@material-ui/core';
import InfoBox from './Infobox';
import Map from './Map';
import Table from './Table';
import { sortData, prettyPrintStat } from './util';
import LineGraph from './LineGraph';
import "leaflet/dist/leaflet.css";
function App() {

  // State = how to write variable in react js
  // USEEFFECT = it runs code at given place 
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState('worldwide');
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({lat: 34.80746, lng: -40.4796})
  const [mapZoom, setMapZoom] = useState(3);
  const [casesType, setCasesType] = useState("cases");
  const [mapCountries, setMapCountries] = useState([]);


  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
    .then((response) => response.json())
    .then((data) => {
      setCountryInfo(data);
    });
  }, []);

  useEffect(() => {
      // async => send a reuqest and wait for it, do something with the response of the server 
      // [] means that the code runs only once when the page loads and not after

    const getCountriesData = async() => {
      await fetch("https://disease.sh/v3/covid-19/countries")
      .then((response) => response.json())
      .then((data) => {
        const countries = data.map((country) => ({
          name: country.country,
          value: country.countryInfo.iso2,
        }));

        const sortedData = sortData(data);
        setTableData(sortedData);
        setMapCountries(data);
        setCountries(countries);
      });
    };

getCountriesData();
}, []);

const onCountryChange = async (event) => {
  const countryCode = event.target.value;
  console.log(countryCode);
  setCountry(countryCode);
  const url = countryCode === 'worldwide' ? 'https://disease.sh/v3/covid-19/all': `https://disease.sh/v3/covid-19/countries/${countryCode}`;

  await fetch(url)
  .then(response => response.json())
  .then(data => {
    setCountry(countryCode);
    // all of the data from the country response
    setCountryInfo(data);
    setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
    setMapZoom(4);
  });

}
console.log(countryInfo);

  return (
    <div className="app">
       <div className="app__left">
       <div className="app__header">
          <h1>COVID-19 STATUS</h1>
            <FormControl className="app__dropdown">
                <Select
                  variant="outlined"
                  value={country}
                  onChange={onCountryChange}
                >
                  <MenuItem value="worldwide">Worldwide</MenuItem>
                  {
                      countries.map(country => (
                        <MenuItem value={country.value}>{country.name}</MenuItem>
                      ))
                  }
                </Select>
            </FormControl>
     </div>
       <div className="app__stats">
          <InfoBox isRed active={casesType === "cases"} onClick={e=> setCasesType('cases')} title="Coronavirus cases" cases={prettyPrintStat(countryInfo.todayCases)} total={countryInfo.cases}/>
          <InfoBox active={casesType === "recovered"} onClick={e=> setCasesType('recovered')} title="Recovered" cases={prettyPrintStat(countryInfo.todayRecovered)} total={countryInfo.recovered} />
          <InfoBox isRed active={casesType === "deaths"} onClick={e=> setCasesType('deaths')} title="Deaths" cases={prettyPrintStat(countryInfo.todayDeaths)} total={countryInfo.deaths} />
      </div>
     <Map
      countries={mapCountries}
      center={mapCenter}
      zoom={mapZoom}
      casesType={casesType}
     />
    </div>
       <Card className="app__right">
            <CardContent>
              <div className='app__information'>
               <h3>Live cases by country</h3>
               <Table countries={tableData}></Table>
               <h3>Worldwide new {casesType}</h3>
               <LineGraph className="app__graph" casesType={casesType} />
               </div>
            </CardContent>
       </Card>
    </div>
    
  );
}

export default App;
