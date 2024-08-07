// export const initialPlanets = [
//   {
//     x: 200,
//     y: 200,
//     baseEnergy: 10,
//     captured: false,
//     attackingPower: 100,
//     defensePower: 10,
//   },
//   {
//     x: 300,
//     y: 400,
//     baseEnergy: 20,
//     captured: false,
//     attackingPower: 100,
//     defensePower: 100,
//   },
//   {
//     x: 400,
//     y: 100,
//     baseEnergy: 15,
//     captured: false,
//     attackingPower: 150,
//     defensePower: 150,
//   },
//   {
//     x: 150,
//     y: 300,
//     baseEnergy: 30,
//     captured: false,
//     attackingPower: 200,
//     defensePower: 200,
//   },
//   {
//     x: 500,
//     y: 350,
//     baseEnergy: 25,
//     captured: false,
//     attackingPower: 120,
//     defensePower: 140,
//   },
//   {
//     x: 600,
//     y: 450,
//     baseEnergy: 40,
//     captured: false,
//     attackingPower: 180,
//     defensePower: 30,
//   },
//   {
//     x: 700,
//     y: 150,
//     baseEnergy: 35,
//     captured: false,
//     attackingPower: 160,
//     defensePower: 350,
//   },
//   {
//     x: 800,
//     y: 250,
//     baseEnergy: 45,
//     captured: false,
//     attackingPower: 190,
//     defensePower: 450,
//   },
//   {
//     x: 250,
//     y: 500,
//     baseEnergy: 50,
//     captured: false,
//     attackingPower: 210,
//     defensePower: 470,
//   },
// ];

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
  };
});
