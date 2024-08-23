import React, { useState, useEffect, useRef } from "react";
import CanvasWrapper from "./canvas-wrapper";
import { initialPlanets, homePlanetImage } from "@/utils/data";
import { conquerCalculation } from "@/utils/calculations";
import {
  Rocket,
  Zap,
  Shield,
  Crosshair,
  Star,
  Globe,
  Clock,
  Award,
} from "lucide-react";

const Canvas = () => {
  const backgroundStars = useRef([]);
  const canvasRef = useRef(null);
  const colors = {
    background: "#0A0E29",
    stars: ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1"],
    homePlanet: "#FF5733",
    capturedPlanet: "#4CAF50",
    uncapturedPlanet: "#3498DB",
    selectedPlanet: "#FFC300",
    energyBar: "#2ECC71",
    text: "#FFFFFF",
  };
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
  const [rocketPosition, setRocketPosition] = useState(null);
  const [explosion, setExplosion] = useState(null);

  const animationFrameRef = useRef();
  const [frameCount, setFrameCount] = useState(0);
  const planetImages = useRef({});
  const rocketImage = useRef(null);
  const explosionImage = useRef(null);

  useEffect(() => {
    backgroundStars.current = Array(100)
      .fill()
      .map(() => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 0.5 + 0.1,
      }));

    const animate = () => {
      setFrameCount((prevCount) => (prevCount + 1) % 60);
      animateBackgroundStars();
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animate();
    rocketImage.current = new Image();
    rocketImage.current.src = "/images/rocket.png";
    explosionImage.current = new Image();
    explosionImage.current.src = "/images/explosion.gif";

    return () => cancelAnimationFrame(animationFrameRef.current);
  }, []);
  const animateBackgroundStars = () => {
    backgroundStars.current = backgroundStars.current.map((star) => ({
      ...star,
      y: (star.y + star.speed) % window.innerHeight,
    }));
  };
  const drawBackgroundStars = (ctx) => {
    backgroundStars.current.forEach((star) => {
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.5})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  useEffect(() => {
    setPlanets(initialPlanets);
    setCapturedPlanets([homePlanet]);
    setSelectedAttackingPlanet(homePlanet);

    // Preload planet images
    initialPlanets.forEach((planet) => {
      const img = new Image();
      img.src = planet.image;
      planetImages.current[planet.image] = img;
    });
    const homeImg = new Image();
    homeImg.src = homePlanetImage;
    planetImages.current[homePlanetImage] = homeImg;

    const interval = setInterval(() => {
      setTimer((prevTimer) => prevTimer - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (timer === 0) {
      // Game over logic
      alert("Game Over! Your final score: " + capturedPlanets.length);
      // Reset game state here
    }
  }, [timer]);
  console.log(initialPlanets);

  const drawPlanet = (ctx, planet, isSelected, isCaptured) => {
    const baseRadius = (20 + planet.defensePower + planet.attackingPower) / 8;
    const animatedRadius = baseRadius + Math.sin(frameCount * 0.035) * 2;

    ctx.globalAlpha = isCaptured ? 1 : 0.8;

    // Draw planet glow
    ctx.beginPath();
    ctx.arc(planet.x, planet.y, animatedRadius + 5, 0, Math.PI * 2);
    ctx.fillStyle = isCaptured
      ? colors.capturedPlanet
      : colors.uncapturedPlanet;
    ctx.filter = "blur(5px)";
    ctx.fill();
    ctx.filter = "none";

    // Draw the planet image
    const img = planetImages.current[planet.image];
    if (img) {
      ctx.drawImage(
        img,
        planet.x - animatedRadius,
        planet.y - animatedRadius,
        animatedRadius * 2,
        animatedRadius * 2
      );
    }

    // Draw selection indicator
    if (isSelected) {
      ctx.strokeStyle = colors.selectedPlanet;
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(
        planet.x - animatedRadius - 5,
        planet.y - animatedRadius - 5,
        (animatedRadius + 5) * 2,
        (animatedRadius + 5) * 2
      );
      ctx.setLineDash([]);
    }

    // Draw energy bar
    const energyPercentage = planet.energy / planet.baseEnergy;
    const barWidth = animatedRadius * 2;
    const barHeight = 6;
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(
      planet.x - animatedRadius,
      planet.y + animatedRadius + 8,
      barWidth,
      barHeight
    );
    ctx.fillStyle = colors.energyBar;
    ctx.fillRect(
      planet.x - animatedRadius,
      planet.y + animatedRadius + 8,
      barWidth * energyPercentage,
      barHeight
    );

    ctx.globalAlpha = 1;
  };

  const drawRocket = (ctx, x, y, angle) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle + Math.PI / 2); // Rotate an additional 90 degrees
    ctx.drawImage(rocketImage.current, -15, -15, 30, 30);
    ctx.restore();
  };

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
      setRocketPosition({
        x: selectedAttackingPlanet.x,
        y: selectedAttackingPlanet.y,
      });

      // Simulate the animation
      const animationDuration = 2000; // 2 seconds
      const startTime = Date.now();

      const animate = () => {
        const currentTime = Date.now();
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / animationDuration, 1);

        setRocketPosition({
          x:
            selectedAttackingPlanet.x +
            progress * (selectedPlanet.x - selectedAttackingPlanet.x),
          y:
            selectedAttackingPlanet.y +
            progress * (selectedPlanet.y - selectedAttackingPlanet.y),
        });

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setRocketPosition(null);
          if (actualRequiredEnergy <= energy) {
            setExplosion({ x: selectedPlanet.x, y: selectedPlanet.y });
            setTimeout(() => setExplosion(null), 1000); // Remove explosion after 1 second
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

    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#0A0E29");
    gradient.addColorStop(1, "#1A1B41");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw animated background stars
    drawBackgroundStars(ctx);

    // // Draw stars
    // for (let i = 0; i < 200; i++) {
    //   ctx.fillStyle = colors.stars[i % colors.stars.length];
    //   ctx.beginPath();
    //   ctx.arc(
    //     Math.random() * canvas.width,
    //     Math.random() * canvas.height,
    //     Math.random() * 2,
    //     0,
    //     Math.PI * 2
    //   );
    //   ctx.fill();
    // }

    // Draw the home base (semi-circle on the extreme right)
    ctx.beginPath();
    ctx.arc(
      canvas.width,
      canvas.height / 2,
      80,
      Math.PI / 2,
      (3 * Math.PI) / 2,
      false
    );
    ctx.fillStyle = colors.homePlanet;
    ctx.fill();

    // Draw planets
    planets.forEach((planet) => {
      drawPlanet(ctx, planet, planet === selectedPlanet, planet.captured);
    });

    // Draw home planet
    drawPlanet(ctx, homePlanet, homePlanet === selectedAttackingPlanet, true);

    if (rocketPosition && rocketImage.current) {
      const angle = Math.atan2(
        selectedPlanet.y - selectedAttackingPlanet.y,
        selectedPlanet.x - selectedAttackingPlanet.x
      );
      drawRocket(ctx, rocketPosition.x, rocketPosition.y, angle);
    }

    // Draw explosion
    if (explosion && explosionImage.current) {
      ctx.drawImage(
        explosionImage.current,
        explosion.x - 30,
        explosion.y - 30,
        60,
        60
      );
    }

    // Draw line between selected planets
    if (selectedPlanet && selectedAttackingPlanet) {
      ctx.beginPath();
      ctx.moveTo(selectedAttackingPlanet.x, selectedAttackingPlanet.y);
      ctx.lineTo(selectedPlanet.x, selectedPlanet.y);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw distance text
      ctx.fillStyle = colors.text;
      ctx.font = "14px 'Press Start 2P', cursive";
      const distance = Math.sqrt(
        Math.pow(selectedAttackingPlanet.x - selectedPlanet.x, 2) +
          Math.pow(selectedAttackingPlanet.y - selectedPlanet.y, 2)
      ).toFixed(0);
      ctx.fillText(
        `Distance: ${distance}`,
        (selectedAttackingPlanet.x + selectedPlanet.x) / 2,
        (selectedAttackingPlanet.y + selectedPlanet.y) / 2 - 10
      );
    }
  };

 const renderCanvas = (canvas) => {
    if (!canvas) return;
    canvasRef.current = canvas;
    const ctx = canvas.getContext("2d");
    canvas.addEventListener("click", (event) => handleClick(event, canvas));

    draw(canvas, ctx);
  };

  return (
    <div className="relative">
      <CanvasWrapper>{renderCanvas}</CanvasWrapper>
      {selectedPlanet && selectedAttackingPlanet && (
        <div className="absolute bottom-10 left-10 p-6 bg-indigo-900 bg-opacity-80 text-white rounded-lg shadow-lg border-2 border-blue-400">
          <h2 className="text-xl font-bold mb-3 text-yellow-400">
            Planet Intel
          </h2>
          <div className="flex items-center mb-2">
            <Crosshair className="mr-2 text-red-400" />
            <p>
              Distance:{" "}
              <span className="font-semibold text-green-400">
                {Math.sqrt(
                  Math.pow(selectedAttackingPlanet.x - selectedPlanet.x, 2) +
                    Math.pow(selectedAttackingPlanet.y - selectedPlanet.y, 2)
                ).toFixed(2)}
              </span>
            </p>
          </div>
          <div className="flex items-center mb-2">
            <Zap className="mr-2 text-yellow-400" />
            <p>
              Base Energy:{" "}
              <span className="font-semibold text-green-400">
                {selectedPlanet.baseEnergy}
              </span>
            </p>
          </div>
          {selectedPlanet.captured && (
            <>
              <div className="flex items-center mb-2">
                <Shield className="mr-2 text-blue-400" />
                <p>
                  Defense Power:{" "}
                  <span className="font-semibold text-green-400">
                    {selectedPlanet.defensePower}
                  </span>
                </p>
              </div>
              <div className="flex items-center mb-2">
                <Rocket className="mr-2 text-red-400" />
                <p>
                  Attacking Power:{" "}
                  <span className="font-semibold text-green-400">
                    {selectedPlanet.attackingPower}
                  </span>
                </p>
              </div>
            </>
          )}
          <button
            className="mt-4 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-full transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
            onClick={handleConquer}
          >
            <Rocket className="mr-2" /> Launch Attack
          </button>
        </div>
      )}
      <div className="absolute top-10 right-10 p-6 bg-indigo-900 bg-opacity-80 text-white rounded-lg shadow-lg border-2 border-green-400">
        <h2 className="text-xl font-bold mb-3 text-green-400">
          Command Center
        </h2>
        <div className="flex items-center mb-3">
          <Zap className="mr-2 text-yellow-400" />
          <p className="text-lg">
            Energy:{" "}
            <span className="font-semibold text-yellow-400">{energy}</span>
          </p>
        </div>
        <button
          className="mt-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-full transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
          onClick={increaseEnergy}
        >
          <Zap className="mr-2" /> Boost Energy
        </button>
      </div>
      <div className="absolute top-10 left-10 p-6 bg-indigo-900 bg-opacity-80 text-white rounded-lg shadow-lg border-2 border-red-400">
        <h2 className="text-xl font-bold text-red-400">Mission Timer</h2>
        <p className="text-3xl font-bold mt-2">
          {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, "0")}
        </p>
      </div>
      <div className="absolute bottom-10 right-10 p-4 bg-indigo-900 bg-opacity-80 text-white rounded-lg shadow-lg border-2 border-yellow-400">
        <h2 className="text-lg font-bold text-yellow-400 mb-2">Game Stats</h2>
        <p>Planets Captured: {capturedPlanets.length}</p>
        <p>Total Planets: {planets.length + 1}</p>
      </div>
    </div>
  );
};

export default Canvas;
