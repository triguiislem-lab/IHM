import React, { useRef, useEffect } from "react";
import CountUp from "react-countup";

const NumberCounter = () => {
  const countUpRef1 = useRef(null);
  const countUpRef2 = useRef(null);
  const countUpRef3 = useRef(null);
  const countUpRef4 = useRef(null);

  // Initialiser CountUp.js manuellement pour éviter les erreurs
  useEffect(() => {
    // Désactiver les avertissements de CountUp dans la console
    console.warn = (function (originalWarn) {
      return function (msg, ...args) {
        if (msg && msg.includes("[CountUp]")) return;
        originalWarn.apply(console, [msg, ...args]);
      };
    })(console.warn);
  }, []);

  return (
    <div className="bg-secondary text-white py-12">
      <div className="container grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="flex flex-col items-center justify-center">
          <p className="text-3xl font-semibold" ref={countUpRef1}>
            <CountUp
              start={0}
              end={898}
              duration={3}
              redraw={true}
              useEasing={true}
            />
          </p>
          <p>Formateurs experts</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <p className="text-3xl font-semibold" ref={countUpRef2}>
            <CountUp
              end={20000}
              separator=","
              suffix="+"
              duration={3}
              redraw={true}
              useEasing={true}
            />
          </p>
          <p>Heures de contenu</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <p className="text-3xl font-semibold" ref={countUpRef3}>
            <CountUp end={298} duration={3} redraw={true} useEasing={true} />
          </p>
          <p>Sujets et cours</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <p className="text-3xl font-semibold" ref={countUpRef4}>
            <CountUp
              end={72878}
              separator=","
              suffix="+"
              duration={3}
              redraw={true}
              useEasing={true}
            />
          </p>
          <p>Étudiants actifs</p>
        </div>
      </div>
    </div>
  );
};

export default NumberCounter;
