import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './WelcomePage.css';

const WelcomePage = () => {
  const navigate = useNavigate();
  const vantaRef = useRef(null);

  useEffect(() => {
    const VANTA = window.VANTA;
    const vantaEffect = VANTA.GLOBE({
      el: vantaRef.current,
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200.00,
      minWidth: 200.00,
      scale: 1.00,
      scaleMobile: 1.00,
      color: 0x00ff9d,
      backgroundColor: 0x0a0f2c,
      color2: 0x00bfa6,
    });
    
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, []);

  return (
    <div ref={vantaRef} className="landing-page">
      <div className="heading bubble-text">Stock Loom</div>
      <div className="subheading">Chart your path to better trades</div>
      <div className="button-container">
        <button className="button" onClick={() => navigate('/home')}>Get Started</button>
      </div>
    </div>
  );
};

export default WelcomePage;
