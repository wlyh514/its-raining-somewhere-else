import { GuessResp, RealtimeWeatherData } from "api";
import React from "react";

interface Props {
  data: RealtimeWeatherData | GuessResp['current'];
}

const DetailedWeatherDataDisplay: React.FC<Props> = ({data}) => {
  return (
    <h5>
    <table className="weather-data-table">
      <colgroup>
        <col style={{fontWeight: 'bolder', textAlign: 'left'}}></col>
        <col></col>
      </colgroup>
      <tbody>
        <tr>
          <td>Condition</td>
          <td style={{alignItems: 'center', justifyContent: 'center', justifyItems: 'center', display: 'flex'}}>
            <img style={{width: '2em', height: '2em'}} src={`https://${data.condition.icon}`} alt={`${data.condition.text} icon`}></img>
            <span style={{display: 'inline-block'}}>{data.condition.text} ({data.is_day ? 'Day' : 'Night'})</span>
          </td>
        </tr>
        <tr>
          <td>Temp</td>
          <td>{data.temp_c}℃ / {data.temp_f}℉</td>
        </tr>
        {
          'feelslike_c' in data && 'feelslike_f' in data ? 
          <tr>
            <td>Feels like</td>
            <td>{data.feelslike_c}℃ / {data.feelslike_f}℉</td>
          </tr> : null
        }
        <tr>
          <td>
            Wind
          </td>
          <td>
            {data.wind_dir} {data.wind_degree}° {data.wind_kph} kph / {data.wind_mph} mph
          </td>
        </tr>
        <tr>
          <td>
            Pressure
          </td>
          <td>
            {data.pressure_mb} Milibar / {data.pressure_in} inHg
          </td>
        </tr>
        <tr>
          <td>
            Cloud
          </td>
          <td>
            {data.cloud}% Coverage
          </td>
        </tr>
        <tr>
          <td>
            Humidity
          </td>
          <td>
            {data.humidity}%
          </td>
        </tr>
      </tbody>
    </table>
    </h5>
  );
}

export default DetailedWeatherDataDisplay;