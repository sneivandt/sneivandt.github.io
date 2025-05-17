document.addEventListener('DOMContentLoaded', function() {
  new Typed('#typed', {
    stringsElement: '#typed-strings',
    typeSpeed: 50,
    backSpeed: 30,
    backDelay: 2000,
    startDelay: 1000,
    loop: true,
    showCursor: true,
    cursorChar: '|'
  });

  particlesJS('particles-js', {
    particles: {
      number: { value: 50, density: { enable: true, value_area: 800 } },
      color: { value: '#E07A5F' },
      shape: { type: 'circle' },
      opacity: { value: 0.15, random: true },
      size: { value: 3, random: true },
      line_linked: {
        enable: true,
        distance: 150,
        color: '#E07A5F',
        opacity: 0.1,
        width: 1
      },
      move: {
        enable: true,
        speed: 1,
        direction: 'none',
        random: true,
        straight: false,
        out_mode: 'out',
        bounce: false
      }
    },
    interactivity: {
      detect_on: 'canvas',
      events: {
        onhover: { enable: true, mode: 'repulse' },
        onclick: { enable: true, mode: 'push' },
        resize: true
      }
    },
    retina_detect: true
  });
});