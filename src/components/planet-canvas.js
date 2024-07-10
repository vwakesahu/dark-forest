// src/PlanetCanvas.js
import React, { useState, useEffect } from 'react';
import { Stage, Layer, Circle, Line } from 'react-konva';

const PlanetCanvas = () => {
  const [planets, setPlanets] = useState([
    { id: 1, x: 100, y: 100, radius: 20, conquered: false },
    { id: 2, x: 300, y: 200, radius: 30, conquered: false },
    { id: 3, x: 500, y: 400, radius: 25, conquered: false },
  ]);
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [conqueredPaths, setConqueredPaths] = useState([]);
  const [movingDot, setMovingDot] = useState(null);

  const handlePlanetClick = (planet) => {
    setSelectedPlanet(planet);
  };

  const handleConquer = () => {
    if (selectedPlanet) {
      const myPlanet = planets[0]; // Assuming the first planet is 'my planet'
      setMovingDot({ from: myPlanet, to: selectedPlanet, progress: 0 });
    }
  };

  useEffect(() => {
    if (movingDot) {
      const interval = setInterval(() => {
        setMovingDot(prev => {
          const newProgress = prev.progress + 0.01;
          if (newProgress >= 1) {
            clearInterval(interval);
            setConqueredPaths([...conqueredPaths, { from: prev.from, to: prev.to }]);
            setPlanets(planets.map(p => p.id === prev.to.id ? { ...p, conquered: true } : p));
            return null;
          }
          return { ...prev, progress: newProgress };
        });
      }, 16);
      return () => clearInterval(interval);
    }
  }, [movingDot, conqueredPaths, planets]);

  const calculateDotPosition = (from, to, progress) => {
    const x = from.x + (to.x - from.x) * progress;
    const y = from.y + (to.y - from.y) * progress;
    return { x, y };
  };

  return (
    <div className="relative">
      <Stage width={window.innerWidth} height={window.innerHeight} className="bg-black">
        <Layer>
          {planets.map(planet => (
            <Circle
              key={planet.id}
              x={planet.x}
              y={planet.y}
              radius={planet.radius}
              fill={planet.conquered ? 'yellow' : (planet === selectedPlanet ? 'blue' : 'white')}
              stroke={planet.id === 1 ? 'yellow' : 'none'}
              strokeWidth={planet.id === 1 ? 4 : 0}
              onClick={() => handlePlanetClick(planet)}
            />
          ))}
          {conqueredPaths.map((path, index) => (
            <Line
              key={index}
              points={[path.from.x, path.from.y, path.to.x, path.to.y]}
              stroke="white"
              strokeWidth={2}
              dash={[10, 10]}
            />
          ))}
          {movingDot && (
            <Circle
              x={calculateDotPosition(movingDot.from, movingDot.to, movingDot.progress).x}
              y={calculateDotPosition(movingDot.from, movingDot.to, movingDot.progress).y}
              radius={5}
              fill="yellow"
            />
          )}
        </Layer>
      </Stage>
      {selectedPlanet && (
        <button 
          onClick={handleConquer} 
          className="absolute top-4 left-4 px-4 py-2 bg-green-500 text-white rounded-lg shadow-lg hover:bg-green-600"
        >
          Conquer
        </button>
      )}
    </div>
  );
};

export default PlanetCanvas;
