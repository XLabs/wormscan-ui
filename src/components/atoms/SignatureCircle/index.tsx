import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { shortAddress } from "src/utils/crypto";
import { CopyToClipboard } from "src/components/molecules";
import { CopyIcon } from "@radix-ui/react-icons";
import "./styles.scss";
import { useEnvironment } from "src/context/EnvironmentContext";

interface IGuardian {
  index: number;
  name: string;
  signature: string;
}

type Props = {
  guardianSignatures: IGuardian[];
};

const success100 = getComputedStyle(document.documentElement).getPropertyValue(
  "--color-success-100",
);
const success60 = getComputedStyle(document.documentElement).getPropertyValue("--color-success-60");

const Circle = ({ guardianSignatures }: Props) => {
  const [hoveredSector, setHoveredSector] = useState(null);
  const [clicked, setClicked] = useState(false);
  const [touched, setTouched] = useState(false);
  const [showGuardian, setShowGuardian] = useState<IGuardian>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const SIZE = 184;

  return (
    <div className="signatureCircle">
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <g transform={`translate(${SIZE / 2},${SIZE / 2})`}>
          {guardianSignatures.map((guardian, idx) => {
            const startAngle = (360 / guardianSignatures.length) * idx;
            const endAngle = startAngle + 360 / guardianSignatures.length;
            const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
            // SVG generating a circle divided in 13 separated pieces (or 1 for testnet)
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

            const fillColor = hoveredSector === idx ? success60 : success100;

            return (
              <path
                key={idx}
                stroke="#151632"
                d={d}
                fill={fillColor}
                strokeWidth="6"
                className="signatureCircle-section"
                onTouchStart={() => setTouched(true)}
                onMouseEnter={ev => {
                  if (!clicked && !touched) {
                    setHoveredSector(idx);
                    setPos({ x: ev.pageX - 110, y: ev.pageY - 100 });
                    setShowGuardian(guardian);
                  }
                }}
                onMouseLeave={ev => {
                  if (!clicked && !touched) {
                    setHoveredSector(null);
                    setShowGuardian(null);
                  }
                }}
                onClick={ev => {
                  setClicked(true);
                  setHoveredSector(idx);
                  setPos({ x: ev.pageX - 110, y: ev.pageY - 100 });
                  setShowGuardian(guardian);
                }}
              />
            );
          })}
        </g>
      </svg>
      {showGuardian && (
        <GuardianInfo
          y={pos.y}
          x={pos.x}
          showGuardian={showGuardian}
          clear={() => {
            setHoveredSector(null);
            setClicked(false);
            setShowGuardian(null);
          }}
        />
      )}
    </div>
  );
};

const GuardianInfo = ({
  y,
  x,
  showGuardian,
  clear,
}: {
  y: number;
  x: number;
  showGuardian: IGuardian;
  clear: () => void;
}) => {
  const { environment } = useEnvironment();
  const currentNetwork = environment.network;

  const infoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (infoRef.current && !infoRef.current.contains(event.target as Node)) {
        clear();
      }
    }

    document.addEventListener("mouseup", handleClickOutside);
    return () => document.removeEventListener("mouseup", handleClickOutside);
  }, [clear]);

  const renderedInfo = (
    <div
      ref={infoRef}
      style={{
        top: y,
        left: x,
      }}
      className="guardianInfo"
    >
      {/* Testnet has only one guardian and it's from Jump Crypto, name is not on vaa */}
      <span className="guardianInfo-signature-name">
        {currentNetwork === "MAINNET" ? showGuardian.name : "Jump Crypto"}
      </span>
      <div className="guardianInfo-signature">
        <span className="guardianInfo-signature-text">Signature:</span>
        <span>{shortAddress(showGuardian.signature)}</span>
        <span>
          <CopyToClipboard toCopy={showGuardian.signature}>
            <CopyIcon />
          </CopyToClipboard>
        </span>
      </div>
    </div>
  );

  return createPortal(renderedInfo, document.body);
};

export default Circle;
