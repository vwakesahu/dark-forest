import { Layer, Circle, Line } from "react-konva";
import { useState, useEffect } from "react";
import { TweenLite } from "gsap";
import CanvasWrapper from "./canvas-wrapper";

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
  const [energy, setEnergy] = useState(141 + 10);
  const [isAttacking, setIsAttacking] = useState(false);
  const [animationCircle, setAnimationCircle] = useState(null);

  useEffect(() => {
    const initialPlanets = [
      {
        x: 200,
        y: 200,
        baseEnergy: 10,
        captured: false,
        attackingPower: 100,
        defensePower: 100,
      },
      {
        x: 300,
        y: 400,
        baseEnergy: 20,
        captured: false,
        attackingPower: 100,
        defensePower: 100,
      },
    ];
    setPlanets(initialPlanets);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCapturedPlanets((capturedPlanets) =>
        capturedPlanets.map((planet) => ({
          ...planet,
          energy:
            planet.energy + (planet.attackingPower + planet.defensePower) / 100,
        }))
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleClick = (planet) => {
    setSelectedPlanet(planet);
  };

  const handleConquer = () => {
    if (selectedPlanet && !isAttacking) {
      const distance = Math.sqrt(
        Math.pow(homePlanet.x - selectedPlanet.x, 2) +
          Math.pow(homePlanet.y - selectedPlanet.y, 2)
      );

      if (
        (distance * selectedPlanet.baseEnergy) / homePlanet.attackingPower <=
        energy
      ) {
        setIsAttacking(true);
        const animCircle = {
          x: homePlanet.x,
          y: homePlanet.y,
          radius: 5,
          fill: "red",
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
            const requiredEnergy =
              (distance *
                selectedPlanet.baseEnergy *
                selectedPlanet.defensePower) /
              homePlanet.attackingPower;
            if (requiredEnergy <= energy) {
              setCapturedPlanets([
                ...capturedPlanets,
                { ...selectedPlanet, energy: 0 },
              ]);
              setPlanets(
                planets.map((p) =>
                  p === selectedPlanet ? { ...p, captured: true } : p
                )
              );
              setEnergy(energy - requiredEnergy);
            } else {
              alert("Not enough energy to capture this planet!");
            }
            setIsAttacking(false);
            setSelectedPlanet(null);
          },
        });
      } else {
        alert("Not enough energy to start the attack!");
      }
    }
  };

  const increaseEnergy = () => {
    setEnergy(energy + 50);
  };

  return (
    <div className="relative">
      <CanvasWrapper>
        <Layer>
          <Circle
            x={homePlanet.x}
            y={homePlanet.y}
            radius={20}
            fill={"yellow"}
          />
          {planets.map((planet, index) => (
            <Circle
              key={index}
              x={planet.x}
              y={planet.y}
              radius={20}
              fill={planet.captured ? "blue" : "gray"}
              stroke={selectedPlanet === planet ? "yellow" : "white"}
              strokeWidth={planet.captured ? 3 : 1}
              onClick={() => handleClick(planet)}
            />
          ))}
          {selectedPlanet && (
            <Line
              points={[
                homePlanet.x,
                homePlanet.y,
                selectedPlanet.x,
                selectedPlanet.y,
              ]}
              stroke="red"
              strokeWidth={2}
            />
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
      {selectedPlanet && (
        <div className="absolute bottom-10 left-10 p-4 bg-gray-800 text-white rounded">
          <h2>Planet Info</h2>
          <p>
            Distance:{" "}
            {Math.sqrt(
              Math.pow(homePlanet.x - selectedPlanet.x, 2) +
                Math.pow(homePlanet.y - selectedPlanet.y, 2)
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
    </div>
  );
};

export default Canvas;
