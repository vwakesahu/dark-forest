import React, { useRef, useEffect } from "react";

const CanvasWrapper = ({ children }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) {
      children(canvasRef.current);
    }
  }, [children]);

  return <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight} />;
};

export default CanvasWrapper;
