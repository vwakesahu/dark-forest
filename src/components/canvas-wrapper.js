const { useState, useRef, useEffect } = require("react");

const CanvasWrapper = ({ children }) => {
  const canvasRef = useRef(null);
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
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={stageSize.width}
      height={stageSize.height}
      style={{ display: "block" }}
    >
      {children(canvasRef.current)}
    </canvas>
  );
};
export default CanvasWrapper;