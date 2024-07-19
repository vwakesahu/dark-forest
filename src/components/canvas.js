import React, { useState, useEffect } from "react";
import CanvasWrapper from "./canvas-wrapper";
import { initialPlanets as dummyPlanets } from "@/utils/data";
import { conquerCalculation } from "@/utils/calculations";

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
      setTimer(60);
    }
  }, [timer]);

  const handleClick = (event, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    let clickedPlanet = null;

    // Check if the home planet was clicked
    const homeDistance = Math.sqrt(
      Math.pow(homePlanet.x - x, 2) + Math.pow(homePlanet.y - y, 2)
    );
    if (homeDistance < 70) {
      clickedPlanet = homePlanet;
    }

    // Check other planets if home planet was not clicked
    if (!clickedPlanet) {
      planets.forEach((planet) => {
        const distance = Math.sqrt(
          Math.pow(planet.x - x, 2) + Math.pow(planet.y - y, 2)
        );
        if (
          distance <
          (10 + planet.defensePower + planet.attackingPower) / 10
        ) {
          clickedPlanet = planet;
        }
      });
    }

    if (clickedPlanet) {
      if (clickedPlanet.captured || clickedPlanet === homePlanet) {
        setSelectedAttackingPlanet(clickedPlanet);
      } else {
        setSelectedPlanet(clickedPlanet);
      }
    }
  };

  const handleConquer = () => {
    if (selectedPlanet && selectedAttackingPlanet && !isAttacking) {
      const { approximateEnergy, actualRequiredEnergy } = conquerCalculation(
        selectedAttackingPlanet,
        selectedPlanet
      );
      setIsAttacking(true);
      const animCircle = {
        x: selectedAttackingPlanet.x,
        y: selectedAttackingPlanet.y,
        radius: 5,
        fill: approximateEnergy <= energy ? "white" : "red",
      };
      setAnimationCircle(animCircle);

      // Simulate the animation
      const animationDuration = 2000; // 2 seconds
      const startTime = Date.now();

      const animate = () => {
        const currentTime = Date.now();
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / animationDuration, 1);

        animCircle.x =
          selectedAttackingPlanet.x +
          progress * (selectedPlanet.x - selectedAttackingPlanet.x);
        animCircle.y =
          selectedAttackingPlanet.y +
          progress * (selectedPlanet.y - selectedAttackingPlanet.y);

        setAnimationCircle({ ...animCircle });

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
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
        }
      };

      requestAnimationFrame(animate);
    }
  };

  const increaseEnergy = () => {
    setEnergy(energy + 10000000000);
  };

  const draw = (canvas, ctx) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the semi-circle on the extreme right
    ctx.beginPath();
    ctx.arc(
      canvas.width,
      canvas.height / 2,
      70,
      (Math.PI / 180) * 90,
      (Math.PI / 180) * 270,
      false
    );
    ctx.fillStyle = "red";
    ctx.shadowColor = "red";
    ctx.shadowBlur = 150;
    ctx.shadowOpacity = 0.5;
    ctx.fill();
    ctx.closePath();

    // Draw captured planets
    capturedPlanets.forEach((planet, index) => {
      if (planet === homePlanet) {
        ctx.beginPath();
        ctx.arc(
          0,
          canvas.height / 2,
          70,
          (Math.PI / 180) * 270,
          (Math.PI / 180) * 90,
          false
        );
        ctx.fillStyle = "yellow";
        ctx.shadowColor = "yellow";
        ctx.shadowBlur = 150;
        ctx.shadowOpacity = 0.5;
        ctx.fill();
        ctx.closePath();
      } else {
        ctx.beginPath();
        ctx.arc(
          planet.x,
          planet.y,
          10 + planet.defensePower / 10 + 8,
          0,
          Math.PI * 2,
          false
        );
        ctx.strokeStyle = "yellow";
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.2;
        ctx.shadowColor = "yellow";
        ctx.shadowBlur = 150;
        ctx.shadowOpacity = 0.5;
        ctx.stroke();
        ctx.closePath();

        ctx.beginPath();
        ctx.arc(
          planet.x,
          planet.y,
          10 + planet.defensePower / 10,
          0,
          Math.PI * 2,
          false
        );
        ctx.fillStyle = "yellow";
        ctx.shadowColor = "yellow";
        ctx.shadowBlur = 150;
        ctx.shadowOpacity = 0.5;
        ctx.globalAlpha = 1;
        ctx.fill();
        ctx.closePath();
      }
    });

    // Draw planets
    planets.forEach((planet) => {
      ctx.beginPath();
      ctx.arc(
        planet.x,
        planet.y,
        (10 + planet.defensePower + planet.attackingPower) / 10 + 10,
        0,
        Math.PI * 2,
        false
      );
      ctx.strokeStyle = planet.captured ? "yellow" : "lightblue";
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.1;
      ctx.shadowColor = "white";
      ctx.shadowBlur = 100;
      ctx.shadowOpacity = 0.5;
      ctx.stroke();
      ctx.closePath();

      ctx.beginPath();
      ctx.arc(
        planet.x,
        planet.y,
        (10 + planet.defensePower + planet.attackingPower) / 10,
        0,
        Math.PI * 2,
        false
      );
      ctx.fillStyle = planet.captured ? "yellow" : "lightblue";
      ctx.strokeStyle = selectedPlanet === planet ? "blue" : "yellow";
      ctx.lineWidth = planet.captured ? 3 : 1;
      ctx.globalAlpha = 1;
      ctx.fill();
      ctx.stroke();
      ctx.closePath();
    });

    // Draw animation circle
    if (animationCircle) {
      ctx.beginPath();
      ctx.arc(
        animationCircle.x,
        animationCircle.y,
        animationCircle.radius,
        0,
        Math.PI * 2,
        false
      );
      ctx.fillStyle = animationCircle.fill;
      ctx.fill();
      ctx.closePath();
    }

    // Draw line between selected planets
    if (selectedPlanet && selectedAttackingPlanet) {
      ctx.beginPath();
      ctx.moveTo(selectedAttackingPlanet.x, selectedAttackingPlanet.y);
      ctx.lineTo(selectedPlanet.x, selectedPlanet.y);
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.globalAlpha = 1;
      ctx.stroke();
      ctx.closePath();

      // Draw distance text
      ctx.fillStyle = "white";
      ctx.font = "14px Arial";
      ctx.fillText(
        `Distance: ${Math.sqrt(
          Math.pow(selectedAttackingPlanet.x - selectedPlanet.x, 2) +
            Math.pow(selectedAttackingPlanet.y - selectedPlanet.y, 2)
        ).toFixed(2)}`,
        (selectedAttackingPlanet.x + selectedPlanet.x) / 2,
        (selectedAttackingPlanet.y + selectedPlanet.y) / 2
      );
    }
  };

  const renderCanvas = (canvas) => {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Attach click event listener to the canvas
    canvas.addEventListener("click", (event) => handleClick(event, canvas));

    draw(canvas, ctx);
  };

  return (
    <div className="relative">
      <CanvasWrapper>{renderCanvas}</CanvasWrapper>
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
