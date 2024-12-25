import { useState, useEffect } from "react";
import search from "./assets/icons/search.svg";
import { useStateContext } from "./Context";
import { BackgroundLayout, WeatherCard, MiniCard } from "./Components";
import Footer from "./Footer";
import gsap from "gsap";

function Weather() {
  useEffect(() => {
    gsap.fromTo(
      ".main",
      { opacity: 0 }, // Start state
      {
        opacity: 1,
        duration: 4,
      }
    );
  }, []);

  const [input, setInput] = useState("");
  const { weather, thisLocation, values, place, setPlace } = useStateContext();
  // console.log(weather)

  const submitCity = () => {
    setPlace(input);
    setInput("");
  };

  return (
    <>
      <div className="w-full h-screen text-white px-8">
        <nav className="w-full p-9 flex justify-between items-center">
          <h1 className="font-bold tracking-wide text-3xl">Weather Forecast</h1>
          <div className="bg-white w-[15rem] overflow-hidden shadow-2xl rounded flex items-center p-2 gap-2">
            <img src={search} alt="search" className="w-[1.5rem] h-[1.5rem]" />
            <input
              onKeyUp={(e) => {
                if (e.key === "Enter") {
                  // sumit the form
                  submitCity();
                }
              }}
              type="text"
              placeholder="Search city"
              className="focus:outline-none w-full text-[#212121] text-lg"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
        </nav>
        <BackgroundLayout></BackgroundLayout>
        <main className="main w-full flex flex-wrap gap-8 py-4 px-[10%] items-center justify-center bg-black bg-opacity-30 backdrop-blur-md rounded-lg">
          <WeatherCard
            place={thisLocation}
            windspeed={weather.wspd}
            humidity={weather.humidity}
            temperature={weather.temp}
            heatIndex={weather.heatindex}
            iconString={weather.conditions}
            conditions={weather.conditions}
          />

          <div className="flex justify-center gap-8 flex-wrap w-[60%] bg-black bg-opacity-30 backdrop-blur-md rounded-lg">
            {values?.slice(1, 7).map((curr) => {
              return (
                <MiniCard
                  key={curr.datetime}
                  time={curr.datetime}
                  temp={curr.temp}
                  iconString={curr.conditions}
                />
              );
            })}
          </div>
        </main>
      </div>

      <Footer />
    </>
  );
}

export default Weather;
