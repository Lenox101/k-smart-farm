/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react'
import sun from '../assets/icons/sun.png'
import cloud from '../assets/icons/cloud.png'
import fog from '../assets/icons/fog.png'
import rain from '../assets/icons/rain.png'
import snow from '../assets/icons/snow.png'
import storm from '../assets/icons/storm.png'
import wind from '../assets/icons/windy.png'

const MiniCard = ({ time, temp, iconString }) => {
  const [icon, setIcon] = useState(sun)

  useEffect(() => {
    if (iconString) {
      const condition = iconString.toLowerCase()
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
  }, [iconString])

  return (
    <div className='glassCard w-[10rem] h-[10rem] p-4 flex flex-col'>
      <p className='text-center'>
        {new Date(time).toLocaleDateString('en-US', { weekday: 'short' })}
      </p>
      <hr />
      <div className='w-full flex justify-center items-center flex-1'>
        <img 
          src={icon} 
          alt="forecast" 
          className='w-[4rem] h-[4rem]'
        />
      </div>
      <p className='text-center font-bold'>{temp}&deg;C</p>
    </div>
  )
}

export default MiniCard