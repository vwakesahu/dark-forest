// utils/data.js
export const initialPlanets = Array.from({ length: 8 }, (_, index) => {
  const col = index + 1; // skip first and last columns
  const x = (col * window.innerWidth) / 10;
  const y = Math.random() * window.innerHeight;
  return {
    x,
    y,
    baseEnergy: Math.random() * 100 + 50,
    defensePower: Math.random() * 50 + 50,
    attackingPower: Math.random() * 50 + 50,
    image: `/planets/planet ${index + 1}.gif`,
  };
});

// Add an image for the home planet
export const homePlanetImage = "/planets/home_planet.png";
