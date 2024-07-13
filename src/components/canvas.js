import { Layer, Circle, Line, Text } from "react-konva";
import { useState, useEffect } from "react";
import { TweenLite } from "gsap";
import CanvasWrapper from "./canvas-wrapper";
import { initialPlanets as dummyPlanets } from "@/utils/data";

const Canvas = () => {
  const [planets, setPlanets] = useState([]);
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [capturedPlanets, setCapturedPlanets] = useState([]);
  const [homePlanet, setHomePlanet] = useState({
    x: 100,
    y: 100,
    attackingPower: 100,
    defensePower: 100,
  });
  const [energy, setEnergy] = useState(1000);
  const [isAttacking, setIsAttacking] = useState(false);
  const [animationCircle, setAnimationCircle] = useState(null);
  const [selectedAttackingPlanet, setSelectedAttackingPlanet] = useState(null);

  useEffect(() => {
    const initialPlanets = dummyPlanets;
    setPlanets(initialPlanets);
    setCapturedPlanets([homePlanet]);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCapturedPlanets((capturedPlanets) =>
        capturedPlanets.map((planet) => ({
          ...planet,
          energy:
            (planet.energy || 0) +
            (planet.attackingPower + planet.defensePower) / 100,
        }))
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleClick = (planet) => {
    setSelectedPlanet(planet);
  };

  const handleConquer = () => {
    if (selectedPlanet && selectedAttackingPlanet && !isAttacking) {
      const distance = Math.sqrt(
        Math.pow(selectedAttackingPlanet.x - selectedPlanet.x, 2) +
          Math.pow(selectedAttackingPlanet.y - selectedPlanet.y, 2)
      );

      const approximateEnergy = Math.ceil(
        (distance * selectedPlanet.baseEnergy) /
          selectedAttackingPlanet.attackingPower
      );

      const actualRequiredEnergy =
        (distance * selectedPlanet.baseEnergy * selectedPlanet.defensePower) /
        selectedAttackingPlanet.attackingPower;

      setIsAttacking(true);
      const animCircle = {
        x: selectedAttackingPlanet.x,
        y: selectedAttackingPlanet.y,
        radius: 5,
        fill: approximateEnergy <= energy ? "green" : "red",
      };
      setAnimationCircle(animCircle);

      TweenLite.to(animCircle, {
        x: selectedPlanet.x,
        y: selectedPlanet.y,
        duration: 2,
        onUpdate: () => {
          setAnimationCircle({ ...animCircle });
        },
        onComplete: () => {
          setAnimationCircle(null);
          if (actualRequiredEnergy <= energy) {
            setCapturedPlanets([
              ...capturedPlanets,
              { ...selectedPlanet, energy: 0 },
            ]);
            setPlanets(
              planets.map((p) =>
                p === selectedPlanet ? { ...p, captured: true } : p
              )
            );
            setEnergy(energy - actualRequiredEnergy);
          } else {
            alert("Not enough energy to capture this planet!");
          }
          setIsAttacking(false);
          setSelectedPlanet(null);
        },
      });
    }
  };

  const increaseEnergy = () => {
    setEnergy(energy + 50);
  };

  return (
    <div className="relative">
      <CanvasWrapper homePlanet={homePlanet}>
        <Layer>
          {capturedPlanets.map((planet, index) => (
            <Circle
              key={index}
              x={planet.x}
              y={planet.y}
              radius={20}
              fill={"yellow"}
            />
          ))}
          {planets.map((planet, index) => (
            <Circle
              key={index}
              x={planet.x}
              y={planet.y}
              radius={10 + planet.defensePower / 10}
              fill={planet.captured ? "blue" : "gray"}
              stroke={selectedPlanet === planet ? "yellow" : "white"}
              strokeWidth={planet.captured ? 3 : 1}
              onClick={() => handleClick(planet)}
            />
          ))}
          {selectedPlanet && selectedAttackingPlanet && (
            <>
              <Line
                points={[
                  selectedAttackingPlanet.x,
                  selectedAttackingPlanet.y,
                  selectedPlanet.x,
                  selectedPlanet.y,
                ]}
                stroke="red"
                strokeWidth={2}
              />
              <Text
                x={(selectedAttackingPlanet.x + selectedPlanet.x) / 2}
                y={(selectedAttackingPlanet.y + selectedPlanet.y) / 2}
                text={`Distance: ${Math.sqrt(
                  Math.pow(selectedAttackingPlanet.x - selectedPlanet.x, 2) +
                    Math.pow(selectedAttackingPlanet.y - selectedPlanet.y, 2)
                ).toFixed(2)} 
                Approx. Energy: ${Math.ceil(
                  (Math.sqrt(
                    Math.pow(selectedAttackingPlanet.x - selectedPlanet.x, 2) +
                      Math.pow(selectedAttackingPlanet.y - selectedPlanet.y, 2)
                  ) *
                    selectedPlanet.baseEnergy) /
                    selectedAttackingPlanet.attackingPower
                )}`}
                fontSize={15}
                fill="white"
              />
            </>
          )}
          {animationCircle && (
            <Circle
              x={animationCircle.x}
              y={animationCircle.y}
              radius={animationCircle.radius}
              fill={animationCircle.fill}
            />
          )}
        </Layer>
      </CanvasWrapper>
      {selectedPlanet && selectedAttackingPlanet && (
        <div className="absolute bottom-10 left-10 p-4 bg-gray-800 text-white rounded">
          <h2>Planet Info</h2>
          <p>
            Distance:{" "}
            {Math.sqrt(
              Math.pow(selectedAttackingPlanet.x - selectedPlanet.x, 2) +
                Math.pow(selectedAttackingPlanet.y - selectedPlanet.y, 2)
            ).toFixed(2)}
          </p>
          <p>Base Energy: {selectedPlanet.baseEnergy}</p>
          {selectedPlanet.captured && (
            <>
              <p>Defense Power: {selectedPlanet.defensePower}</p>
              <p>Attacking Power: {selectedPlanet.attackingPower}</p>
            </>
          )}
          <button
            className="mt-2 px-4 py-2 bg-green-500 rounded"
            onClick={handleConquer}
          >
            Conquer
          </button>
        </div>
      )}
      <div className="absolute top-10 right-10 p-4 bg-gray-800 text-white rounded">
        <h2>Player Energy: {energy}</h2>
        <button
          className="mt-2 px-4 py-2 bg-blue-500 rounded"
          onClick={increaseEnergy}
        >
          Increase Energy
        </button>
      </div>
      <div className="absolute top-10 left-10 p-4 bg-gray-800 text-white rounded">
        <h2>Select Attacking Planet</h2>
        {capturedPlanets.map((planet, index) => (
          <button
            key={index}
            className="mt-2 px-4 py-2 bg-blue-500 rounded"
            onClick={() => setSelectedAttackingPlanet(planet)}
          >
            Planet at ({planet.x}, {planet.y})
          </button>
        ))}
      </div>
    </div>
  );
};

export default Canvas;
