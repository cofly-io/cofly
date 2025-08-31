import { AmapWeatherOptions } from "./types";

export default async function(opts : AmapWeatherOptions) {
    const apiUrl = `https://restapi.amap.com/v3/weather/weatherInfo?key=`
        + `${opts.apiKey}&city=${opts.cityCode}&extensions=${opts.extensions??"all"}`;
    const resp = await fetch(apiUrl);
    return await resp.json();
}