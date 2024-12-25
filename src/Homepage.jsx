// src/Homepage.jsx
import React, { useEffect, useRef } from 'react';
import images from './utils';
const { homepage } = images
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Footer from './Footer';
import { Link } from 'react-router-dom';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

function Homepage() {
  const heroRef = useRef(null);

  useEffect(() => {
    const hero = heroRef.current;
    const h1 = hero.querySelector('h1');
    const p = hero.querySelector('p');
    const button = hero.querySelector('button');

    // Hero animations
    gsap.set([h1, p], {
      y: '-100vh',
      opacity: 0
    });

    gsap.set(button, {
      scale: 1.5,
      opacity: 0
    });

    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' }
    });

    tl.to([h1, p], {
      y: 0,
      opacity: 1,
      duration: 1.5,
      stagger: 0.2,
      ease: 'back.out(1.2)'
    }).to(button, {
      scale: 1,
      opacity: 1,
      duration: 1,
      ease: 'power2.out'
    }, '-=1');

    // Feature cards animation
    const featureCards = document.querySelectorAll('.feature-card');

    // Set initial state and animate on scroll
    gsap.from(featureCards, {
      scrollTrigger: {
        trigger: '.py-20.bg-white', // Use a class or selector for the entire features section
        start: 'top bottom-=100',
        toggleActions: 'play reverse play reverse' // Play on enter, reverse on leave
      },
      y: 100,
      opacity: 0,
      duration: 0.8,
      stagger: 0.2 // Optional: if you want a stagger effect
    });

    // Animate to final state
    gsap.to(featureCards, {
      scrollTrigger: {
        trigger: '.py-20.bg-white',
        start: 'top bottom-=100',
        toggleActions: 'play reverse play reverse' // Play on enter, reverse on leave
      },
      y: 0,
      opacity: 1,
      duration: 0.8,
      stagger: 0.2 // Optional: if you want a stagger effect
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div
        ref={heroRef}
        className="h-screen w-full bg-cover bg-center bg-no-repeat relative"
        style={{ backgroundImage: `url(${homepage})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>

        <div className="container mx-auto p-4 pt-6 md:p-6 lg:p-12 xl:p-24 relative h-full flex items-center justify-center">
          <div className="flex flex-col items-center justify-center space-y-8 max-w-4xl">
            <h1 className="text-4xl font-bold text-green-400 md:text-6xl lg:text-7xl text-center leading-tight">
              Empowering Smallholder Farmers Through Technology
            </h1>
            <p className="text-xl text-green-300 md:text-2xl lg:text-3xl text-center">
              Kuboresha kilimo, kupunguza hasara, na kuongeza mapato kupitia jukwaa letu la kilimo-teknolojia
            </p>
            <Link to="/login" className="mt-8 bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-10 rounded-lg 
              transform transition duration-200 hover:scale-105 shadow-xl text-xl">
              Anza Sasa | Get Started
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-16">Our Services</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Weather Alerts */}
            <Link to="/login" className="feature-card bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-green-600 text-5xl mb-4">🌦️</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Weather Alerts</h3>
              <p className="text-gray-600">
                Get real-time weather updates and seasonal predictions specific to your location to plan your farming activities better.
              </p>
            </Link>

            {/* Market Linkage */}
            <Link to="/login" className="feature-card bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-green-600 text-5xl mb-4">🏪</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Market Access</h3>
              <p className="text-gray-600">
                Connect directly with buyers and get fair prices for your produce through our transparent marketplace.
              </p>
            </Link>

            {/* Resource Access */}
            <Link to="/login" className="feature-card bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-green-600 text-5xl mb-4">🌱</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Farm Inputs</h3>
              <p className="text-gray-600">
                Access quality seeds, fertilizers, and tools at discounted prices through group buying options.
              </p>
            </Link>

            {/* Educational Content */}
            <Link to="/login" className="feature-card bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-green-600 text-5xl mb-4">📱</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Smart Farming</h3>
              <p className="text-gray-600">
                Get AI-powered pest identification and step-by-step farming guides in Kiswahili and local dialects.
              </p>
            </Link>

            {/* Community */}
            <Link to="/login" className="feature-card bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-green-600 text-5xl mb-4">👥</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Community</h3>
              <p className="text-gray-600">
                Join a community of farmers, share experiences, and get expert advice from certified agronomists.
              </p>
            </Link>

            {/* Support */}
            <Link to="/login" className="feature-card bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-green-600 text-5xl mb-4">💪</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Local Support</h3>
              <p className="text-gray-600">
                Access dedicated support in your language and connect with local agricultural experts.
              </p>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Homepage;