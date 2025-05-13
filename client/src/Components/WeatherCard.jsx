import React, { useEffect, useState } from 'react'
import { useDate } from '../Utils/useDate'
import sun from '../assets/icons/sun.png'
import cloud from '../assets/icons/cloud.png'
import fog from '../assets/icons/fog.png'
import rain from '../assets/icons/rain.png'
import snow from '../assets/icons/snow.png'
import storm from '../assets/icons/storm.png'
import wind from '../assets/icons/windy.png'

const WeatherCard = ({
  temperature,
  windspeed,
  humidity,
  place,
  conditions,
}) => {
  const [icon, setIcon] = useState(sun)
  const { time } = useDate()

  useEffect(() => {
    if (conditions) {
      const condition = conditions.toLowerCase()
      if (condition.includes('cloud')) {
        setIcon(cloud)
      } else if (condition.includes('rain') || condition.includes('shower')) {
        setIcon(rain)
      } else if (condition.includes('clear') || condition.includes('sun')) {
        setIcon(sun)
      } else if (condition.includes('thunder') || condition.includes('storm')) {
        setIcon(storm)
      } else if (condition.includes('fog') || condition.includes('mist') || condition.includes('haze')) {
        setIcon(fog)
      } else if (condition.includes('snow')) {
        setIcon(snow)
      } else if (condition.includes('wind')) {
        setIcon(wind)
      }
    }
  }, [conditions])

  return (
    <div className='w-[22rem] min-w-[22rem] h-[30rem] glassCard p-4'>
      <div className='flex w-full justify-center items-center gap-4 mt-12 mb-4'>
        <img src={icon} alt="weather_icon" className='w-[8rem] h-[8rem]' />
        <span className='font-bold text-5xl flex justify-center items-center'>{temperature} &deg;C</span>
      </div>
      <div className='font-bold text-center text-xl'>
        {place}
      </div>
      <div className='w-full flex justify-between items-center mt-4'>
        <span className='flex-1 text-center p-2'>{new Date().toDateString()}</span>
        <span className='flex-1 text-center p-2'>{time}</span>
      </div>
      <div className='w-full flex justify-between items-center mt-4 gap-4'>
        <div className='flex-1 text-center p-2 font-bold bg-blue-600 shadow rounded-lg'>
          <span className="block">Wind Speed</span>
          <span className='font-normal block'>{windspeed} km/h</span>
        </div>
        <div className='flex-1 text-center p-2 font-bold rounded-lg bg-green-600'>
          <span className="block">Humidity</span>
          <span className='font-normal block'>{humidity}%</span>
        </div>
      </div>
      <hr className='bg-slate-600 my-4' />
      <div className='w-full p-4 flex justify-center items-center text-3xl font-semibold'>
        {conditions}
      </div>
    </div>
  )
}

export default WeatherCard