import React, { useEffect, useState } from 'react';

const Timer = ({ initialMinutes = 1, initialSeconds = 0, onTimeUp }) => {
  const [minutes, setMinutes] = useState(initialMinutes);
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prevSeconds) => {
        if (prevSeconds === 0) {
          if (minutes === 0) {
            clearInterval(timer);
            onTimeUp();
            return 0;
          } else {
            setMinutes((prevMinutes) => prevMinutes - 1);
            return 59;
          }
        } else {
          return prevSeconds - 1;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [minutes, onTimeUp]);

  return (
    <div>
      <h5 style={{ color: minutes > 0 ? 'black' : 'red' }}>
        Time Remaining: {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
      </h5>
    </div>
  );
};

export default Timer;
