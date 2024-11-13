import { useState, useRef, useEffect } from "react";

function Game() {
  const [numPoints, setNumPoints] = useState(5);
  const [points, setPoints] = useState([]);
  const [clickedOrder, setClickedOrder] = useState([]);
  const [timer, setTimer] = useState(0);
  const [next, setNext] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const timerRef = useRef(null);
  const [trigger, setTrigger] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [play, setPlay] = useState(false);
  const timerPointRef = useRef(
    Array.from({ length: numPoints }, (_, i) => ({ id: i, value: 3 }))
  );

  const generatePoints = () => {
    const generatedPoints = Array.from({ length: numPoints }, (_, i) => ({
      id: i + 1,
      x: Math.floor(Math.random() * 560),
      y: Math.floor(Math.random() * 560),
    }));
    setPoints(generatedPoints);
  };

  const handlePlay = () => {
    stopTimer();
    generatePoints();
    setPlay(true);
    setAutoPlay(false);
    setTimer(0);
    setGameOver(false);
    setWin(false);
    setClickedOrder([]);
    setTrigger(true);
    clearInterval(timerRef.current);
    timerPointRef.current = Array.from({ length: numPoints }, (_, i) => ({
      id: i,
      value: 3,
    }));
    timerPointRef.current.map((timer) => clearInterval(timer.id));
  };

  const startTimerPoint = (index) => {
    clearInterval(timerPointRef.current[index]);
    timerPointRef.current[index].id = setInterval(() => {
      if (timerPointRef.current[index]?.value < 0.1) {
        clearInterval(timerPointRef.current[index]?.id);
        timerPointRef.current[index].value = 0;
      } else {
        timerPointRef.current[index].value =
          timerPointRef.current[index]?.value - 0.1;
      }
    }, 100);
  };

  const stopTimerPoint = () => {
    clearInterval(timerRef.current);
    timerPointRef.current.map((timer) => clearInterval(timer.id));
  };
  const stopTimer = () => {
    timerPointRef.current.map((timer) => clearInterval(timer.id));
  };

  const handlePointClick = (id) => {
    let time;
    clearTimeout(time);
    if (clickedOrder.length + 1 === id) {
      setClickedOrder((prev) => [...prev, id]);
      startTimerPoint(id - 1);
      setNext(id + 1);

      if (clickedOrder.length + 1 === numPoints) {
        clearInterval(timerRef.current);
        time = setTimeout(() => {
          setWin(true);
        }, 3000);
      }
    } else {
      setClickedOrder((prev) => [...prev, id]);
      startTimerPoint(id - 1);
      setNext(id + 1);

      setGameOver(true);
      setTrigger(false);
    }
  };

  const handleInputChange = (e) => {
    setTrigger(false);
    setNumPoints(Number(e.target.value));
  };

  useEffect(() => {
    let interval;

    if (trigger) {
      interval = setInterval(() => {
        setTimer((prevTime) => prevTime + 0.1);
      }, 100);
    }
    if (gameOver || win) {
      clearInterval(interval);
    }
    if (gameOver) {
      stopTimerPoint();
    }
    return () => clearInterval(interval);
  }, [trigger, gameOver, win, numPoints, points]);

  useEffect(() => {
    let index = clickedOrder.length;
    let timeInterval;
    clearInterval(timeInterval);

    if (autoPlay) {
      timeInterval = setInterval(() => {
        if (index === numPoints) {
          clearInterval(timeInterval);
        } else {
          setClickedOrder((prev) => [...prev, index]);
          setNext(index + 1 + 1);
          startTimerPoint(index);
          index = index + 1;
        }
      }, 2000);
    }
    if (!autoPlay) {
      clearInterval(timeInterval);
    }
    return () => clearInterval(timeInterval);
  }, [autoPlay]);

  useEffect(() => {
    let time;
    if (clickedOrder.length === numPoints) {
      clearInterval(timerRef.current);
      time = setTimeout(() => {
        setWin(true);
      }, 3000);
    }
    return () => clearTimeout(time);
  }, [clickedOrder]);

  useEffect(() => {
    timerPointRef.current = Array.from({ length: numPoints }, (_, i) => ({
      id: i,
      value: 3,
    }));
  }, [numPoints]);

  return (
    <div className="border p-5 max-w-[640px] mx-auto min-h-screen">
      <p className={win ? "text-green-400 font-semibold" : ""}>
        {win ? "ALL CLEARED" : ""}
      </p>
      <p className="text-red-400 font-semibold">
        {gameOver ? "GAME OVER" : ""}
      </p>
      <h1 className="font-bold mb-3">LET&apos;S PLAY</h1>

      <div className="flex items-center mb-3">
        <p className="w-[200px]">Points:</p>
        <input
          type="number"
          value={numPoints || ""}
          placeholder="Nhập số điểm"
          onChange={handleInputChange}
          className="border p-1"
        />
      </div>
      <div className="flex items-center mb-3">
        <p className="w-[200px]">Time:</p>
        <p>{timer.toFixed(1)}s</p>
      </div>
      <div className="flex gap-2 items-center">
        <button
          onClick={handlePlay}
          className="border p-1 px-10 bg-gray-50 mb-3"
        >
          {!play ? "Play" : "Restart"}
        </button>
        {play && (
          <button
            onClick={() => setAutoPlay((prev) => !prev)}
            className="border p-1 px-10 bg-gray-50 mb-3"
          >
            Auto Play {!autoPlay ? "ON" : "OFF"}
          </button>
        )}
      </div>

      <div className="w-[600px] h-[600px] border relative">
        {points.map((point, index) => (
          <div
            key={point.id}
            onClick={() => handlePointClick(point.id)}
            className={`absolute w-10 h-10 flex justify-center flex-col items-center border border-orange-400 rounded-full cursor-pointer ${
              clickedOrder.includes(point.id)
                ? "bg-orange-400"
                : "bg-transparent"
            }`}
            style={{
              left: point.x,
              top: point.y,
              opacity: timerPointRef.current[index]?.value / 3 || 0,
              pointerEvents: win || gameOver ? "none" : "auto",
            }}
          >
            <p className="text-sm text-gray-500">{point.id}</p>
            {clickedOrder.includes(point.id) && (
              <p className="text-xs text-white">
                {timerPointRef.current[index]?.value.toFixed(1)}s
              </p>
            )}
          </div>
        ))}
      </div>
      {clickedOrder.length > 0 && clickedOrder.length < numPoints && (
        <p>Next: {next}</p>
      )}
    </div>
  );
}

export default Game;
