import React, { useRef } from "react";
import CountUp from "react-countup";

const NumberCounter = () => {
  const countUpRef = useRef(null);

  return (
    <div className="bg-secondary text-white py-12">
      <div className="container grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="flex flex-col items-center justify-center">
          <p className="text-3xl font-semibold" ref={countUpRef}>
            <CountUp
              start={0}
              end={898}
              duration={3}
              enableScrollSpy
              scrollSpyDelay={200}
            />
          </p>
          <p>Expert tutors</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <p className="text-3xl font-semibold">
            <CountUp
              end={20000}
              separator=","
              suffix="+"
              duration={3}
              enableScrollSpy
              scrollSpyDelay={200}
            />
          </p>
          <p>Hours content</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <p className="text-3xl font-semibold">
            <CountUp
              end={298}
              duration={3}
              enableScrollSpy
              scrollSpyDelay={200}
            />
          </p>
          <p>Subject and courses</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <p className="text-3xl font-semibold">
            <CountUp
              end={72878}
              separator=","
              suffix="+"
              duration={3}
              enableScrollSpy
              scrollSpyDelay={200}
            />
          </p>
          <p>Active students</p>
        </div>
      </div>
    </div>
  );
};

export default NumberCounter;
