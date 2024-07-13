import { useRef, useState } from "react";
import { Stage } from "react-konva";

const CanvasWrapper = ({ children }) => {
  const [isDragging, setIsDragging] = useState(false);
  const stageRef = useRef(null);

  const handleWheel = (e) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newScale = e.evt.deltaY > 0 ? oldScale / 1.1 : oldScale * 1.1;
    stage.scale({ x: newScale, y: newScale });

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    stage.position(newPos);
    stage.batchDraw();
  };

  const handleMouseDown = (e) => {
    if (e.target === stageRef.current) {
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const stage = stageRef.current;
      const newPos = {
        x: stage.x() + e.evt.movementX,
        y: stage.y() + e.evt.movementY,
      };
      stage.position(newPos);
      stage.batchDraw();
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <Stage
      width={window.innerWidth}
      height={window.innerHeight}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      ref={stageRef}
    >
      {children}
    </Stage>
  );
};

export default CanvasWrapper;
