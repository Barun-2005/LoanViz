import { useEffect, useRef } from 'react';

/**
 * ConfettiEffect component for creating celebratory confetti animations
 * @param {Object} props - Component props
 * @param {boolean} props.active - Whether the confetti effect is active
 * @param {number} props.duration - Duration of the effect in milliseconds
 * @param {number} props.particleCount - Number of confetti particles
 * @param {Array<string>} props.colors - Array of colors for confetti particles
 * @param {string} props.type - Type of confetti ('default', 'fireworks', 'snow', 'stars')
 * @returns {JSX.Element} Confetti effect component
 */
const ConfettiEffect = ({
  active = false,
  duration = 3000,
  particleCount = 100,
  colors = ['#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B'],
  type = 'default'
}) => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);

  // Create a particle
  const createParticle = (canvas) => {
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = Math.random() * 10 + 5;
    const speedX = Math.random() * 6 - 3;
    const speedY = Math.random() * -15 - 5;
    const rotation = Math.random() * 360;
    const rotationSpeed = Math.random() * 10 - 5;
    
    // Different starting positions based on type
    let x, y;
    
    switch (type) {
      case 'fireworks':
        // Start from bottom center
        x = canvas.width / 2 + (Math.random() * 100 - 50);
        y = canvas.height;
        break;
      case 'snow':
        // Start from top, across the width
        x = Math.random() * canvas.width;
        y = -size;
        break;
      case 'stars':
        // Start from random positions
        x = Math.random() * canvas.width;
        y = Math.random() * canvas.height;
        break;
      default:
        // Default confetti - start from top center
        x = canvas.width / 2;
        y = canvas.height / 3;
        break;
    }
    
    return {
      x,
      y,
      size,
      color,
      speedX,
      speedY,
      rotation,
      rotationSpeed,
      gravity: 0.1,
      opacity: 1,
      shape: Math.random() > 0.5 ? 'circle' : 'rect',
      wobble: Math.random() * 10
    };
  };

  // Update particle positions
  const updateParticles = (canvas, ctx, deltaTime) => {
    particlesRef.current.forEach((particle, index) => {
      // Apply gravity and movement
      particle.x += particle.speedX;
      particle.y += particle.speedY;
      particle.speedY += particle.gravity;
      particle.rotation += particle.rotationSpeed;
      
      // Add some wobble for more natural movement
      particle.x += Math.sin(particle.y / 30) * particle.wobble / 10;
      
      // Fade out particles over time
      if (startTimeRef.current && Date.now() - startTimeRef.current > duration / 2) {
        particle.opacity -= 0.01;
      }
      
      // Remove particles that are off-screen or fully transparent
      if (
        particle.y > canvas.height ||
        particle.x < -particle.size ||
        particle.x > canvas.width + particle.size ||
        particle.opacity <= 0
      ) {
        particlesRef.current.splice(index, 1);
      }
    });
  };

  // Draw particles on canvas
  const drawParticles = (ctx) => {
    particlesRef.current.forEach(particle => {
      ctx.save();
      ctx.globalAlpha = particle.opacity;
      ctx.translate(particle.x, particle.y);
      ctx.rotate((particle.rotation * Math.PI) / 180);
      
      if (particle.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
      } else {
        ctx.fillStyle = particle.color;
        ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
      }
      
      ctx.restore();
    });
  };

  // Animation loop
  const animate = (timestamp) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const deltaTime = timestamp - startTimeRef.current;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Add new particles if still within duration
    if (deltaTime < duration && particlesRef.current.length < particleCount) {
      const particlesToAdd = Math.min(
        5,
        particleCount - particlesRef.current.length
      );
      
      for (let i = 0; i < particlesToAdd; i++) {
        particlesRef.current.push(createParticle(canvas));
      }
    }
    
    // Update and draw particles
    updateParticles(canvas, ctx, deltaTime);
    drawParticles(ctx);
    
    // Continue animation if there are particles or we're still within duration
    if (particlesRef.current.length > 0 || deltaTime < duration) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      // Reset when done
      startTimeRef.current = null;
    }
  };

  // Set up and clean up the animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Start animation when active
    if (active) {
      particlesRef.current = [];
      startTimeRef.current = null;
      animationRef.current = requestAnimationFrame(animate);
    }
    
    // Clean up
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [active, duration, particleCount, colors, type]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-50"
      style={{ width: '100%', height: '100%' }}
    />
  );
};

export default ConfettiEffect;
