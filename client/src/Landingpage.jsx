import Header from "./Header";
import Footer from "./Footer";
import React, { useEffect, useState } from "react";
import { gsap } from "gsap";
import { Link } from "react-router-dom";
import images from "./utils";
const { contactUs, landingpagePic } = images;
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Landingpage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    // GSAP animation triggered on scroll
    gsap.fromTo(
      ".welcome-text",
      { opacity: 0, y: -20 }, // Start state
      {
        opacity: 1,
        y: 0,
        duration: 1,
        scrollTrigger: {
          trigger: ".welcome-text", // Element that triggers the animation
          start: "top 80%", // When the top of the element hits 80% of the viewport height
          end: "top 30%", // When the top of the element hits 30% of the viewport height
          toggleActions: "play reverse play reverse", // Play on enter, reverse on leave
        },
      }
    );

    gsap.fromTo(
      ".motto-text",
      { opacity: 0, y: 20 }, // Start state
      {
        opacity: 1,
        y: 0,
        duration: 1,
        delay: 0.5, // Delay of 0.5 seconds
        scrollTrigger: {
          trigger: ".motto-text", // Element that triggers the animation
          start: "top 80%", // When the top of the element hits 80% of the viewport height
          toggleActions: "play reverse play reverse", // Play on enter, reverse on leave
        },
      }
    );

    // GSAP animation for the call to action text with a delay
    gsap.fromTo(
      ".cta-text",
      { opacity: 0, y: 20 }, // Start state
      {
        opacity: 1,
        y: 0,
        duration: 1,
        delay: 1, // Delay of 1 second (0.5 seconds after the motto)
        scrollTrigger: {
          trigger: ".cta-text", // Element that triggers the animation
          start: "top 80%", // When the top of the element hits 80% of the viewport height
          toggleActions: "play reverse play reverse", // Play on enter, reverse on leave
        },
      }
    );

    gsap.fromTo(
      ".contact-title",
      { opacity: 0, y: 20 }, // Start state
      {
        opacity: 1,
        y: 0,
        duration: 1,
        scrollTrigger: {
          trigger: ".contact-title", // Element that triggers the animation
          start: "top 80%", // When the top of the element hits 80% of the viewport height
          toggleActions: "play none none reverse", // Play on enter, reverse on leave
        },
      }
    );

    gsap.fromTo(
      ".contact-description",
      { opacity: 0, y: 20 }, // Start state
      {
        opacity: 1,
        y: 0,
        duration: 1,
        delay: 0.5, // Delay of 0.5 seconds
        scrollTrigger: {
          trigger: ".contact-description", // Element that triggers the animation
          start: "top 80%", // When the top of the element hits 80% of the viewport height
          toggleActions: "play none none reverse", // Play on enter, reverse on leave
        },
      }
    );
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Sending...');
    
    const formData = { name, email, message };

    try {
      const response = await fetch('http://localhost:5000/api/sendemail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus('Message sent successfully!');
        setName('');
        setEmail('');
        setMessage('');
      } else {
        setStatus('Failed to send message.');
      }
    } catch (error) {
      setStatus('Error sending message: ' + error.message);
    }
  };


  return (
    <>
      <Header />
      {/* Home Section */}
      <section
        id="home"
        className="relative h-screen bg-cover bg-center"
        style={{ backgroundImage: `url(${landingpagePic})` }}
      >
        <div className="absolute inset-0 bg-black opacity-20"></div>{" "}
        {/* Optional overlay for better text visibility */}
        <div className="container mx-auto flex items-center justify-center h-full">
          <div className="bg-black bg-opacity-50 backdrop-blur-md p-4 rounded-lg">
            {" "}
            {/* Blurred background around text */}
            <h1 className="welcome-text text-5xl md:text-6xl lg:text-7xl font-bold text-white text-center">
              Welcome to K Smart Farm
            </h1>
            <p className="motto-text text-lg md:text-xl text-white text-center mt-4">
              Empowering Farmers with Technology
            </p>
            <p className="cta-text text-md text-white text-center mt-2">
              Join us today and start your journey towards smarter farming!
            </p>
          </div>
        </div>
      </section>

      <section id="services" className="py-10 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-16">
            Our Services
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Weather Alerts */}
            <Link
              to="/weather"
              className="feature-card bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="text-green-600 text-5xl mb-4">🌦️</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Weather Alerts
              </h3>
              <p className="text-gray-600">
                Get real-time weather updates and seasonal predictions specific
                to your location to plan your farming activities better.
              </p>
            </Link>

            {/* Market Linkage */}
            <Link
              to="/marketplace"
              className="feature-card bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="text-green-600 text-5xl mb-4">🏪</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Market Access
              </h3>
              <p className="text-gray-600">
                Connect directly with buyers and get fair prices for your
                produce through our transparent marketplace.
              </p>
            </Link>

            {/* Resource Access */}
            <Link
              to="/farminputs"
              className="feature-card bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="text-green-600 text-5xl mb-4">🌱</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Farm Inputs
              </h3>
              <p className="text-gray-600">
                Access quality seeds, fertilizers, and tools at discounted
                prices through group buying options.
              </p>
            </Link>

            {/* Educational Content */}
            <Link
              to="/farmingguides"
              className="feature-card bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="text-green-600 text-5xl mb-4">📱</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Smart Farming
              </h3>
              <p className="text-gray-600">
                Get AI-powered pest identification and step-by-step farming
                guides in Kiswahili and local dialects.
              </p>
            </Link>

            {/* Community */}
            <Link
              to="/community"
              className="feature-card bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="text-green-600 text-5xl mb-4">👥</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Community
              </h3>
              <p className="text-gray-600">
                Join a community of farmers, share experiences, and get expert
                advice from certified agronomists.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white p-10">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-8">
            About Us
          </h2>
          <p className="text-lg text-gray-600 text-center mb-4">
            At FarmTech, we believe that technology can transform agriculture
            and empower farmers to achieve their fullest potential. Our journey
            began with a simple idea: to bridge the gap between traditional
            farming practices and modern technology.
          </p>
          <p className="text-lg text-gray-600 text-center mb-4">
            Founded by a group of passionate agriculturalists and tech
            enthusiasts, FarmTech was established to provide innovative
            solutions tailored to the unique challenges faced by farmers. We
            understand that farming is not just a job; it’s a way of life. Our
            mission is to support farmers in their quest for sustainability,
            efficiency, and profitability.
          </p>
          <p className="text-lg text-gray-600 text-center mb-4">
            Our platform offers a range of services, including real-time weather
            updates, market access, and educational resources. We leverage
            cutting-edge technology, such as AI and data analytics, to provide
            farmers with actionable insights that help them make informed
            decisions. Whether it’s identifying pests, optimizing crop yields,
            or connecting with buyers, FarmTech is here to help.
          </p>
          <p className="text-lg text-gray-600 text-center mb-4">
            But we don’t stop there. We believe in the power of community.
            FarmTech fosters a network of farmers who share their experiences,
            knowledge, and support. Together, we can overcome challenges and
            celebrate successes. Our vision is to create a thriving agricultural
            ecosystem where every farmer has access to the tools and resources
            they need to succeed.
          </p>
          <p className="text-lg text-gray-600 text-center mb-4">
            Join us on this journey towards a smarter, more sustainable future
            in agriculture. Together, we can cultivate success and make a
            lasting impact on the world.
          </p>
        </div>
      </section>

      <section
        id="contact"
        className="py-20"
        style={{
          backgroundImage: `url(${contactUs})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="contact-title text-4xl font-bold text-center text-white mb-8">
            Contact Us
          </h2>
          <p className="contact-description text-lg text-white text-center mb-8">
            We would love to hear from you! Please fill out the form below, and
            we will get back to you as soon as possible.
          </p>
          <div className="bg-white bg-opacity-50 backdrop-blur-md p-8 rounded-lg shadow-md max-w-lg mx-auto">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block text-lg font-medium text-gray-700"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2 block w-full border border-gray-300 rounded-md p-3"
                  placeholder="Your Name"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-lg font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 block w-full border border-gray-300 rounded-md p-3"
                  placeholder="Your Email"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="message"
                  className="block text-lg font-medium text-gray-700"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="mt-2 block w-full border border-gray-300 rounded-md p-3"
                  rows="4"
                  placeholder="Your Message"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 text-white font-bold py-3 rounded-md hover:bg-green-700 transition duration-200"
              >
                Send Message
              </button>
            </form>
            {status && <p className="mt-4 text-center text-white">{status}</p>}
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default Landingpage;
