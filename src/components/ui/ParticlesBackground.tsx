
import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    particlesJS: any;
  }
}

const ParticlesBackground = () => {
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if particles.js is already loaded
    if (window.particlesJS) {
      initializeParticles();
      return;
    }

    // Load particles.js script
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js';
    script.async = true;
    
    script.onload = () => {
      console.log('Particles.js loaded successfully');
      initializeParticles();
    };

    script.onerror = () => {
      console.error('Failed to load particles.js');
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup script when component unmounts
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const initializeParticles = () => {
    if (window.particlesJS && particlesRef.current) {
      console.log('Initializing particles...');
      window.particlesJS('particles-js', {
        particles: {
          number: {
            value: 50,
            density: {
              enable: true,
              value_area: 800
            }
          },
          color: {
            value: '#ffffff'
          },
          shape: {
            type: 'circle',
            stroke: {
              width: 0,
              color: '#000000'
            }
          },
          opacity: {
            value: 0.3,
            random: false,
            anim: {
              enable: false,
              speed: 1,
              opacity_min: 0.1,
              sync: false
            }
          },
          size: {
            value: 2,
            random: true,
            anim: {
              enable: false,
              speed: 40,
              size_min: 0.1,
              sync: false
            }
          },
          line_linked: {
            enable: true,
            distance: 150,
            color: '#ffffff',
            opacity: 0.2,
            width: 1
          },
          move: {
            enable: true,
            speed: 3,
            direction: 'none',
            random: false,
            straight: false,
            out_mode: 'out',
            bounce: false,
            attract: {
              enable: false,
              rotateX: 600,
              rotateY: 1200
            }
          }
        },
        interactivity: {
          detect_on: 'canvas',
          events: {
            onhover: {
              enable: true,
              mode: 'repulse'
            },
            onclick: {
              enable: true,
              mode: 'push'
            },
            resize: true
          },
          modes: {
            grab: {
              distance: 400,
              line_linked: {
                opacity: 1
              }
            },
            bubble: {
              distance: 400,
              size: 40,
              duration: 2,
              opacity: 8,
              speed: 3
            },
            repulse: {
              distance: 100,
              duration: 0.4
            },
            push: {
              particles_nb: 4
            },
            remove: {
              particles_nb: 2
            }
          }
        },
        retina_detect: true
      });
    } else {
      console.error('Particles.js not available or container not found');
    }
  };

  return (
    <div 
      id="particles-js" 
      ref={particlesRef}
      className="absolute inset-0 z-0 pointer-events-none"
      style={{ 
        width: '100%', 
        height: '100%',
        background: 'transparent'
      }}
    />
  );
};

export default ParticlesBackground;
