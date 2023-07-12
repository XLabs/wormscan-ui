import { useState } from "react";
import "./styles.scss";

const sectors = Array.from({ length: 13 }, (_, i) => i);

const Circle = () => {
  const [hoveredSector, setHoveredSector] = useState(null);
  const SIZE = 184;

  return (
    <div className="signatureCircle">
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <g transform={`translate(${SIZE / 2},${SIZE / 2})`}>
          {sectors.map((sector, index) => {
            const startAngle = (360 / sectors.length) * index;
            const endAngle = startAngle + 360 / sectors.length;
            const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
            const d = [
              "M",
              0,
              0,
              "L",
              (SIZE / 2.5) * Math.cos((Math.PI * startAngle) / 180),
              (SIZE / 2.5) * Math.sin((Math.PI * startAngle) / 180),
              "A",
              SIZE / 2.5,
              SIZE / 2.5,
              0,
              largeArcFlag,
              1,
              (SIZE / 2.5) * Math.cos((Math.PI * endAngle) / 180),
              (SIZE / 2.5) * Math.sin((Math.PI * endAngle) / 180),
              "L",
              0,
              0,
            ].join(" ");
            const fillColor =
              hoveredSector === index
                ? "blue"
                : getComputedStyle(document.documentElement).getPropertyValue(
                    "--color-success-100",
                  );

            return (
              <path
                key={index}
                d={d}
                fill={fillColor}
                stroke="#151632" // This is to create a small space between the pieces
                strokeWidth="6"
                onMouseEnter={() => setHoveredSector(index)}
                onMouseLeave={() => setHoveredSector(null)}
                onClick={() => alert(`You clicked on the piece number ${index + 1}`)}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
};

export default Circle;
