"use client";
import React, { useState, useEffect, useMemo } from "react";

export default function InteractiveBg() {
  const [icons, setIcons] = useState([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const iconCount = 30;
  const iconSvgs = useMemo(
    () => [
      // Paper Plane
      `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13"/><path d="m22 2-7 20-4-9-9-4 20-7z"/></svg>`,
      // Message Bubble
      `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
      // Circled Paper Plane
      `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m16.5 8.5-6.2 6.2-2.8-2.8"/></svg>`,
    ],
    []
  );

  // Effect to generate icons once on component mount
  useEffect(() => {
    const generatedIcons = [];
    for (let i = 0; i < iconCount; i++) {
      generatedIcons.push({
        id: i,
        svg: iconSvgs[Math.floor(Math.random() * iconSvgs.length)],
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 50 + 20,
        opacity: Math.random() * 0.4 + 0.3, // Using the updated opacity
        animationDuration: Math.random() * 5 + 5,
        animationDelay: Math.random() * 5,
        depth: Math.random() * 0.4 + 0.1,
      });
    }
    setIcons(generatedIcons);
  }, [iconSvgs]);

  // Effect to track mouse movement
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <>
      <style>{`
                body, html {
                    margin: 0;
                    padding: 0;
                    width: 100%;
                    height: 100%;
                    font-family: 'Inter', sans-serif;
                }

                #dynamic-bg {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(135deg, #87CEEB 0%, #6495ED 100%);
                    overflow: hidden;
                    z-index: 0;
                }

                .icon-wrapper {
                    position: absolute;
                    will-change: transform;
                    transition: transform 0.1s linear;
                }
                
                .icon-container {
                    animation: float 6s ease-in-out infinite;
                }

                .icon-container svg {
                    display: block;
                    stroke: rgba(255, 255, 255, 0.8);
                    stroke-width: 1.5px;
                    fill: none;
                    filter: drop-shadow(0 0 5px rgba(255,255,255,0.2));
                }
                
                .info-panel {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    padding: 2rem 3rem;
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    border-radius: 1rem;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    text-align: center;
                    color: #fff;
                    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1);
                }
                
                .info-panel h1 {
                    margin: 0;
                    font-size: 2.5rem;
                    font-weight: 600;
                }
                
                .info-panel p {
                    margin: 0.5rem 0 0;
                    font-size: 1.1rem;
                    opacity: 0.9;
                }

                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                    100% { transform: translateY(0px); }
                }
            `}</style>

      <div id="dynamic-bg">
        {icons.map((icon) => (
          <Icon key={icon.id} {...icon} mousePosition={mousePosition} />
        ))}
      </div>
    </>
  );
}

function Icon({
  id,
  svg,
  x,
  y,
  size,
  opacity,
  animationDuration,
  animationDelay,
  depth,
  mousePosition,
}) {
  // Calculate parallax movement based on mouse position and icon depth
  const moveX = useMemo(() => {
    const centerX = window.innerWidth / 2;
    return -((mousePosition.x - centerX) * depth) / 10;
  }, [mousePosition.x, depth]);

  const moveY = useMemo(() => {
    const centerY = window.innerHeight / 2;
    return -((mousePosition.y - centerY) * depth) / 10;
  }, [mousePosition.y, depth]);

  const wrapperStyle = {
    left: `${x}px`,
    top: `${y}px`,
    opacity: opacity,
    transform: `translate3d(${moveX}px, ${moveY}px, 0)`,
  };

  const containerStyle = {
    animationDuration: `${animationDuration}s`,
    animationDelay: `-${animationDelay}s`,
  };

  const svgStyle = {
    width: `${size}px`,
    height: `${size}px`,
  };

  return (
    <div className="icon-wrapper" style={wrapperStyle}>
      <div
        className="icon-container"
        style={containerStyle}
        dangerouslySetInnerHTML={{ __html: svg }}
        // We need to apply the style to the SVG child after it's rendered
        ref={(el) => {
          if (el && el.firstChild) {
            el.firstChild.style.width = svgStyle.width;
            el.firstChild.style.height = svgStyle.height;
          }
        }}
      />
    </div>
  );
}
