import React, { useState, useEffect } from "react";
import { Layer, Circle, Line, Text, Arc, Group } from "react-konva";
import { TweenLite } from "gsap";
import CanvasWrapper from "./canvas-wrapper";
import { initialPlanets as dummyPlanets } from "@/utils/data";

const Canvas = () => {
  const [planets, setPlanets] = useState([]);
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [capturedPlanets, setCapturedPlanets] = useState([]);
  const [timer, setTimer] = useState(2);
  const [homePlanet, setHomePlanet] = useState({
    x: 0,
    y: typeof window !== "undefined" ? window.innerHeight / 2 : 0,
    attackingPower: 100,
    baseEnergy: 100,
    defensePower: 100,
  });
  const [energy, setEnergy] = useState(1000);
  const [isAttacking, setIsAttacking] = useState(false);
  const [animationCircle, setAnimationCircle] = useState(null);
  const [selectedAttackingPlanet, setSelectedAttackingPlanet] = useState(null);

  useEffect(() => {
    setPlanets(dummyPlanets);
    setCapturedPlanets([homePlanet]);
    setSelectedAttackingPlanet(homePlanet);
    const interval = setInterval(() => {
      setTimer((prevTimer) => prevTimer - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (timer === 0) {
      // alert("Timer reached zero! Resetting timer and performing action.");
      setTimer(60);
    }
  }, [timer]);

  const handleClick = (planet) => {
    if (planet.captured) {
      setSelectedAttackingPlanet(planet);
    } else {
      setSelectedPlanet(planet);
    }
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
        fill: approximateEnergy <= energy ? "white" : "red",
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
    setEnergy(energy + 10000);
  };

  return (
    <div className="relative">
      <CanvasWrapper homePlanet={homePlanet}>
        <Layer>
          {/* Semi-circle on extreme right */}
          <Arc
            x={typeof window !== "undefined" ? window.innerWidth : 0}
            y={typeof window !== "undefined" ? window.innerHeight / 2 : 0}
            innerRadius={0}
            rotation={90}
            outerRadius={70}
            angle={180}
            fill="red"
            shadowColor="red"
            shadowBlur={150}
            shadowOpacity={0.5}
          />
          {capturedPlanets.map((planet, index) => (
            <React.Fragment key={index}>
              {index === 0 ? (
                <Arc
                  x={0}
                  y={typeof window !== "undefined" ? window.innerHeight / 2 : 0}
                  innerRadius={0}
                  outerRadius={70}
                  rotation={-90}
                  angle={180}
                  fill="yellow"
                  shadowColor="yellow"
                  shadowBlur={150}
                  shadowOpacity={0.5}
                  onClick={() => handleClick(planet)}
                />
              ) : (
                <Group>
                  <Circle
                    x={planet.x}
                    y={planet.y}
                    radius={10 + planet.defensePower / 10 + 8} // Outer ring radius
                    stroke={"yellow"} // Outer ring color
                    strokeWidth={2} // Outer ring thickness
                    fill={"transparent"} // Outer ring fill transparent
                    shadowColor="yellow"
                    shadowBlur={150}
                    opacity={0.2}
                    shadowOpacity={0.5}
                  />
                  <Circle
                    x={planet.x}
                    y={planet.y}
                    radius={10 + planet.defensePower / 10}
                    fill={"yellow"}
                    shadowColor="yellow"
                    shadowBlur={150}
                    shadowOpacity={0.5}
                  />
                </Group>
              )}
            </React.Fragment>
          ))}
          {planets.map((planet, index) => (
            <Group key={index}>
              <Circle
                x={planet.x}
                y={planet.y}
                radius={
                  (10 + planet.defensePower + planet.attackingPower) / 10 + 10
                } // Outer ring radius
                stroke={planet.captured ? "yellow" : "lightblue"} // Outer ring color
                strokeWidth={2} // Outer ring thickness
                fill={"transparent"} // Outer ring fill transparent
                shadowColor="white"
                shadowBlur={100}
                shadowOpacity={0.5}
                opacity={0.1}
              />
              <Circle
                x={planet.x}
                y={planet.y}
                radius={(10 + planet.defensePower + planet.attackingPower) / 10}
                fill={planet.captured ? "yellow" : "lightblue"}
                stroke={selectedPlanet === planet ? "blue" : "yellow"}
                strokeWidth={planet.captured ? 3 : 1}
                onClick={() => handleClick(planet)}
                shadowColor="white"
                shadowBlur={100}
                shadowOpacity={0.5}
              />
            </Group>
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
                stroke="lightblue"
                strokeWidth={4}
              />
              <Text
                x={(selectedAttackingPlanet.x + selectedPlanet.x) / 2}
                y={(selectedAttackingPlanet.y + selectedPlanet.y) / 2}
                text={`Distance: ${Math.sqrt(
                  Math.pow(selectedAttackingPlanet.x - selectedPlanet.x, 2) +
                    Math.pow(selectedAttackingPlanet.y - selectedPlanet.y, 2)
                ).toFixed(2)} 
                `}
                fontSize={15}
                fill="white"
              />
            </>
          )}
          {animationCircle && (
            <Text
              x={animationCircle.x}
              y={animationCircle.y}
              text={`🚀`}
              fontSize={32}
              fill="white"
            />
            // <Circle
            //   x={animationCircle.x}
            //   y={animationCircle.y}
            //   radius={animationCircle.radius}
            //   fill={animationCircle.fill}
            // />
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
        <h2>Timer: {timer} seconds</h2>
      </div>
    </div>
  );
};

export default Canvas;
