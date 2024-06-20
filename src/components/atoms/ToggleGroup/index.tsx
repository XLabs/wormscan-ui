import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import "./styles.scss";

type Props = {
  items: {
    label: string;
    value: string;
    ariaLabel?: string;
  }[];
  value: string;
  onValueChange: (value: any) => void;
  ariaLabel: string;
  separatedOptions?: boolean;
  className?: string;
};

const ToggleGroup = ({ value, onValueChange, items, ariaLabel, className = "" }: Props) => (
  <div className={`toggle-group ${className}`}>
    <ToggleGroupPrimitive.Root
      type="single"
      className="toggle-group-root"
      value={value}
      onValueChange={value => value && onValueChange(value)}
      aria-label={ariaLabel}
    >
      {items.map(({ label, value, ariaLabel = "" }) => (
        <ToggleGroupPrimitive.Item
          key={value}
          className="toggle-group-item"
          value={value}
          aria-label={ariaLabel}
        >
          {label}
        </ToggleGroupPrimitive.Item>
      ))}
    </ToggleGroupPrimitive.Root>
  </div>
);

export default ToggleGroup;

series = [
  {
    name: "All Chains",
    data: [
      {
        x: "2023-07-01T00:00:00.000Z",
        y: 32060,
        volume: 20581740387273172,
        count: 32060,
        emitter_chain: "allChains",
        details: [
          {
            emitter_chain: "22",
            volume: 185777138508000,
            count: 5403,
          },
          {
            emitter_chain: "4",
            volume: 1032905371565903,
            count: 4651,
          },
          {
            emitter_chain: "5",
            volume: 541041388369051,
            count: 4520,
          },
          {
            emitter_chain: "1",
            volume: 2665089370334707,
            count: 4016,
          },
          {
            emitter_chain: "2",
            volume: 11416011878044068,
            count: 3099,
          },
          {
            emitter_chain: "6",
            volume: 233510839794522,
            count: 2543,
          },
          {
            emitter_chain: "23",
            volume: 1105820626607822,
            count: 2318,
          },
          {
            emitter_chain: "21",
            volume: 391714522897775,
            count: 2184,
          },
          {
            emitter_chain: "10",
            volume: 39946800319788,
            count: 958,
          },
          {
            emitter_chain: "14",
            volume: 214314128776605,
            count: 874,
          },
          {
            emitter_chain: "16",
            volume: 881630526656026,
            count: 413,
          },
          {
            emitter_chain: "13",
            volume: 87449816718215,
            count: 266,
          },
          {
            emitter_chain: "24",
            volume: 15621008864157,
            count: 209,
          },
          {
            emitter_chain: "12",
            volume: 204543604878942,
            count: 207,
          },
          {
            emitter_chain: "8",
            volume: 1420524239219844,
            count: 183,
          },
          {
            emitter_chain: "19",
            volume: 12772441189802,
            count: 60,
          },
          {
            emitter_chain: "7",
            volume: 19127018613742,
            count: 53,
          },
          {
            emitter_chain: "3",
            volume: 6908703246198,
            count: 45,
          },
          {
            emitter_chain: "11",
            volume: 106936839983835,
            count: 43,
          },
          {
            emitter_chain: "32",
            volume: 56019279113,
            count: 7,
          },
          {
            emitter_chain: "18",
            volume: 37659998152,
            count: 6,
          },
          {
            emitter_chain: "30",
            volume: 443406900,
            count: 2,
          },
        ],
        color: "#7abfff",
      },
      {
        x: "2023-08-01T00:00:00.000Z",
        y: 80527,
        volume: 40792193862048070,
        count: 80527,
        emitter_chain: "allChains",
        details: [
          {
            emitter_chain: "32",
            volume: 3650990539251830,
            count: 14291,
          },
          {
            emitter_chain: "4",
            volume: 1976743360139937,
            count: 11679,
          },
          {
            emitter_chain: "5",
            volume: 1308791190945111,
            count: 11272,
          },
          {
            emitter_chain: "1",
            volume: 12569007370300328,
            count: 8225,
          },
          {
            emitter_chain: "23",
            volume: 3541884787705790,
            count: 7838,
          },
          {
            emitter_chain: "22",
            volume: 335333184563051,
            count: 7686,
          },
          {
            emitter_chain: "2",
            volume: 11706125770359660,
            count: 6120,
          },
          {
            emitter_chain: "24",
            volume: 699917021901552,
            count: 4258,
          },
          {
            emitter_chain: "21",
            volume: 1187428927151860,
            count: 3831,
          },
          {
            emitter_chain: "6",
            volume: 189922493714178,
            count: 1459,
          },
          {
            emitter_chain: "14",
            volume: 517771318937945,
            count: 1220,
          },
          {
            emitter_chain: "16",
            volume: 1280692800934137,
            count: 734,
          },
          {
            emitter_chain: "12",
            volume: 359305470155069,
            count: 509,
          },
          {
            emitter_chain: "30",
            volume: 623383222158907,
            count: 450,
          },
          {
            emitter_chain: "10",
            volume: 6993439531135,
            count: 440,
          },
          {
            emitter_chain: "13",
            volume: 140707453569152,
            count: 198,
          },
          {
            emitter_chain: "8",
            volume: 673690017947085,
            count: 95,
          },
          {
            emitter_chain: "7",
            volume: 12849726300647,
            count: 72,
          },
          {
            emitter_chain: "19",
            volume: 8014928092590,
            count: 68,
          },
          {
            emitter_chain: "3104",
            volume: 662474337,
            count: 38,
          },
          {
            emitter_chain: "3",
            volume: 1236716265536,
            count: 23,
          },
          {
            emitter_chain: "11",
            volume: 1371456152076,
            count: 17,
          },
          {
            emitter_chain: "18",
            volume: 32003496160,
            count: 4,
          },
        ],
        color: "#7abfff",
      },
    ],
    color: "#7abfff",
  },
];

detailsPerDay = [
  {
    details: [
      {
        emitter_chain: "1",
        volume: 9660495137907,
        count: 39,
        color: "#815AF0",
      },
      {
        emitter_chain: "2",
        volume: 14415795562234,
        count: 16,
        color: "#627EEA",
      },
      {
        emitter_chain: "4",
        volume: 1163202120299,
        count: 16,
        color: "#F0B90B",
      },
      {
        emitter_chain: "21",
        volume: 1660010375416,
        count: 10,
        color: "#2A4362",
      },
      {
        emitter_chain: "22",
        volume: 1388030811228,
        count: 8,
        color: "#FFFFFF",
      },
      {
        emitter_chain: "30",
        volume: 2019283028711,
        count: 8,
        color: "#0052FF",
      },
      {
        emitter_chain: "23",
        volume: 321993528000,
        count: 7,
        color: "#405870",
      },
      {
        emitter_chain: "3104",
        volume: 500535501250,
        count: 7,
        color: "#00E6FD",
      },
      {
        emitter_chain: "5",
        volume: 485209569932,
        count: 7,
        color: "#8247E5",
      },
      {
        emitter_chain: "16",
        volume: 1813200788560,
        count: 5,
        color: "#53CBC8",
      },
      {
        emitter_chain: "24",
        volume: 13411388815514,
        count: 5,
        color: "#FF0420",
      },
      {
        emitter_chain: "10",
        volume: 61566408600,
        count: 3,
        color: "#1969FF",
      },
      {
        emitter_chain: "6",
        volume: 128942319019,
        count: 3,
        color: "#E84142",
      },
    ],
    x: "2024-06-18T21:00:00.000Z",
  },
  {
    details: [
      {
        emitter_chain: "1",
        volume: 6537840872786,
        count: 37,
        color: "#815AF0",
      },
      {
        emitter_chain: "4",
        volume: 2355874331891,
        count: 21,
        color: "#F0B90B",
      },
      {
        emitter_chain: "2",
        volume: 10292016371865,
        count: 19,
        color: "#627EEA",
      },
      {
        emitter_chain: "21",
        volume: 6455164609443,
        count: 13,
        color: "#2A4362",
      },
      {
        emitter_chain: "5",
        volume: 724878693466,
        count: 12,
        color: "#8247E5",
      },
      {
        emitter_chain: "3104",
        volume: 613445504114,
        count: 8,
        color: "#00E6FD",
      },
      {
        emitter_chain: "23",
        volume: 503810100594,
        count: 7,
        color: "#405870",
      },
      {
        emitter_chain: "30",
        volume: 1468928326362,
        count: 4,
        color: "#0052FF",
      },
      {
        emitter_chain: "16",
        volume: 4211569416984,
        count: 2,
        color: "#53CBC8",
      },
      {
        emitter_chain: "22",
        volume: 60953519400,
        count: 2,
        color: "#FFFFFF",
      },
      {
        emitter_chain: "24",
        volume: 363122164967,
        count: 1,
        color: "#FF0420",
      },
      {
        emitter_chain: "32",
        volume: 2304381252,
        count: 1,
        color: "#A60B13",
      },
      {
        emitter_chain: "6",
        volume: 133269222,
        count: 1,
        color: "#E84142",
      },
    ],
    x: "2024-06-18T22:00:00.000Z",
  },
];
