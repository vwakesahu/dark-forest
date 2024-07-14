import { useRef, useState, useEffect } from "react";
import { Stage } from "react-konva";

const CanvasWrapper = ({ children }) => {
  const stageRef = useRef(null);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      setStageSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [stageSize]);

  return (
    <Stage width={stageSize.width} height={stageSize.height} ref={stageRef}>
      {children}
    </Stage>
  );
};

export default CanvasWrapper;
