export const conquerCalculation = (selectedAttackingPlanet, selectedPlanet) => {
  const distance = calculateDistance(selectedAttackingPlanet, selectedPlanet);

  const approximateEnergy = Math.ceil(
    (distance * selectedPlanet.baseEnergy) /
      selectedAttackingPlanet.attackingPower
  );

  const actualRequiredEnergy =
    (distance * selectedPlanet.baseEnergy * selectedPlanet.defensePower) /
    selectedAttackingPlanet.attackingPower;

  return {
    distance,
    approximateEnergy,
    actualRequiredEnergy,
  };
};

const calculateDistance = (planet1, planet2) => {
  return Math.sqrt(
    Math.pow(planet1.x - planet2.x, 2) + Math.pow(planet1.y - planet2.y, 2)
  );
};

