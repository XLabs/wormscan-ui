import {
  CCTP_APP_ID,
  CONNECT_APP_ID,
  ETH_BRIDGE_APP_ID,
  GATEWAY_APP_ID,
  GR_APP_ID,
  MAYAN_APP_ID,
  NTT_APP_ID,
  PORTAL_APP_ID,
  PORTAL_NFT_APP_ID,
} from "src/consts";

const ProtocolIcon = ({ protocolName, width = 28 }: { protocolName: string; width?: number }) => {
  const IconComponent = iconMap[protocolName];
  return IconComponent ? <IconComponent width={width} /> : null;
};

const PortalIcon = ({ width = 28 }: { width?: number }) => (
  <svg
    width={width}
    height={width}
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x={1} y={1} width={26} height={26} rx={13} fill="black" stroke="black" strokeWidth={2} />
    <g filter="url(#filter0_f_3556_27158)">
      <circle cx={14} cy={14} r={9} stroke="#C5A0ED" strokeWidth={2} />
      <circle cx={14} cy={14} r={7} stroke="#8D64BA" strokeWidth={2} />
      <circle cx={14} cy={14} r={5} stroke="#613D89" strokeWidth={2} />
      <circle cx={14} cy={14} r={3} fill="#301C46" />
    </g>
    <circle cx={14} cy={14} r={9} stroke="#C5A0ED" strokeWidth={2} />
    <defs>
      <filter
        id="filter0_f_3556_27158"
        x={0}
        y={0}
        width={28}
        height={28}
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
        <feGaussianBlur stdDeviation={2} result="effect1_foregroundBlur_3556_27158" />
      </filter>
    </defs>
  </svg>
);

const CCTPIcon = ({ width = 28 }: { width?: number }) => (
  <svg
    width={width}
    height={width}
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x={1} y={1} width={26} height={26} rx={13} fill="#000" stroke="#000" strokeWidth={2} />
    <path
      d="M23.124 8.812l-.453-.796a.466.466 0 00-.735-.097l-1.042 1.04a.469.469 0 00-.058.59 8.173 8.173 0 01-10.665 11.697l1.762-1.763a5.836 5.836 0 007.318-8 .468.468 0 00-.75-.128l-1.056 1.048a.467.467 0 00-.124.436l.091.379a3.5 3.5 0 01-5.142 3.84l-.465-.266a.465.465 0 00-.561.076L6.939 21.17a.467.467 0 00.046.7l.634.487a10.407 10.407 0 006.384 2.164 10.51 10.51 0 009.12-15.71z"
      fill="#9C9DF7"
    />
    <path
      d="M20.386 5.665A10.404 10.404 0 0014.002 3.5 10.51 10.51 0 004.88 19.215l.453.794a.468.468 0 00.736.099l1.04-1.04a.47.47 0 00.058-.589A8.173 8.173 0 0117.83 6.785l-1.763 1.763a5.834 5.834 0 00-7.902 5.457c0 .097.027.539.035.615.071.67.257 1.321.55 1.927a.468.468 0 00.752.128l1.054-1.056a.466.466 0 00.125-.435l-.09-.38a3.5 3.5 0 015.142-3.84l.464.266a.468.468 0 00.562-.075l4.304-4.303a.469.469 0 00-.045-.702l-.632-.485z"
      fill="#72E3DE"
    />
  </svg>
);

const ConnectIcon = ({ width = 28 }: { width?: number }) => (
  <svg
    width={width}
    height={width}
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x={1} y={1} width={26} height={26} rx={13} fill="#000" stroke="#000" strokeWidth={2} />
    <path
      d="M21.954 6.577l-1.06 1.06A9.003 9.003 0 1014.53 23v1.5a10.5 10.5 0 117.425-17.925v.002z"
      fill="#78E1FF"
    />
    <path
      d="M14.53 6.496a7.5 7.5 0 00-3.747 13.999l.749-1.299a6.003 6.003 0 01-1.768-8.853 6.002 6.002 0 019.008-.588l1.061-1.06a7.478 7.478 0 00-5.303-2.199z"
      fill="#78E1FF"
    />
    <path
      d="M19.834 19.307A7.503 7.503 0 1114.53 6.504v-1.5a9 9 0 106.365 15.364l-1.061-1.061z"
      fill="#205EFF"
    />
    <path
      d="M17.712 17.161a4.5 4.5 0 01-6.364-6.363c.278-.28.592-.52.933-.719l-.749-1.298a6 6 0 107.24 9.441l-1.06-1.06z"
      fill="#205EFF"
    />
  </svg>
);

const EthBridgeIcon = ({ width = 28 }: { width?: number }) => (
  <svg
    width={width}
    height={width}
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x={1} y={1} width={26} height={26} rx={13} fill="black" stroke="black" strokeWidth={2} />
    <g clipPath="url(#clip0_3556_27161)">
      <path
        d="M13.9984 4.40625L13.8696 4.84385V17.5391L13.9984 17.6678L19.8912 14.1846L13.9984 4.40625Z"
        fill="#7A92ED"
      />
      <path d="M13.9981 4.40625L8.10449 14.1846L13.9973 17.6678V4.40625H13.9981Z" fill="white" />
      <path
        d="M13.9981 18.7824L13.9253 18.8712V23.3936L13.9981 23.6048L19.8949 15.3008L13.9981 18.7824Z"
        fill="#7A92ED"
      />
      <path d="M13.9983 23.6048V18.7824L8.10547 15.3008L13.9983 23.6048Z" fill="white" />
      <path d="M13.9985 17.6577L19.8913 14.1745L13.9985 11.4961V17.6577Z" fill="#627EEA" />
      <path d="M8.10449 14.1753L13.9973 17.6585V11.4961L8.10449 14.1753Z" fill="#C0CCF7" />
    </g>
    <defs>
      <clipPath id="clip0_3556_27161">
        <rect width="19.2" height="19.2" fill="white" transform="translate(4.3999 4.40625)" />
      </clipPath>
    </defs>
  </svg>
);

const MayanIcon = ({ width = 28 }: { width?: number }) => (
  <svg
    width={width}
    height={width}
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x={1} y={1} width={26} height={26} rx={13} fill="black" stroke="black" strokeWidth={2} />
    <path
      d="M6.88184 17.8782V9.69638L11.7909 13.5146L20.5182 8.60547V20.6055"
      stroke="white"
      strokeWidth="2.66667"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const StandardRelayerIcon = ({ width = 28 }: { width?: number }) => (
  <svg
    width={width}
    height={width}
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x={1} y={1} width={26} height={26} rx={13} fill="black" stroke="black" strokeWidth={2} />
    <path
      d="M21 13.5703V18.6387L14 22.4037L7 18.6387V13.5703"
      stroke="#4D4D4D"
      strokeWidth="1.73782"
    />
    <path
      d="M21 8.92188L21 13.9902L14 17.7553L7 13.9902V8.92188"
      stroke="#999999"
      strokeWidth="1.73782"
    />
    <path
      d="M14 12.8381L7 9.36271V9.07309L14 5.59766L21 9.07309L21 9.36271L14 12.8381Z"
      fill="white"
      stroke="white"
      strokeWidth="1.73782"
    />
  </svg>
);

const NTTIcon = ({ width = 28 }: { width?: number }) => (
  <svg
    width={width}
    height={width}
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x={1} y={1} width={26} height={26} rx={13} fill="black" stroke="black" strokeWidth={2} />
    <ellipse
      cx="13.9999"
      cy="14.0087"
      rx="8.55556"
      ry="8.55555"
      stroke="white"
      strokeWidth="1.375"
    />
    <path
      d="M3 14.0156H25"
      stroke="black"
      strokeWidth="5.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4.22217 14.0156H23.7777"
      stroke="white"
      strokeWidth="1.375"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="14.0001" cy="14.0109" r="2.44444" fill="white" />
  </svg>
);

const PortalNFTIcon = ({ width = 28 }: { width?: number }) => (
  <svg
    width={width}
    height={width}
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x={1} y={1} width={26} height={26} rx={13} fill="black" stroke="black" strokeWidth={2} />
    <g filter="url(#filter0_f_3556_27165)">
      <circle cx={14} cy={14} r={9} stroke="#FF9744" strokeWidth={2} />
      <circle cx={14} cy={14} r={7} stroke="#FE801B" strokeWidth={2} />
      <circle cx={14} cy={14} r={5} stroke="#DE6200" strokeWidth={2} />
      <circle cx={14} cy={14} r={3} fill="#6D140A" />
    </g>
    <circle cx={14} cy={14} r={9} stroke="#FF9744" strokeWidth={2} />
    <defs>
      <filter
        id="filter0_f_3556_27165"
        x={0}
        y={0}
        width={28}
        height={28}
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
        <feGaussianBlur stdDeviation={2} result="effect1_foregroundBlur_3556_27165" />
      </filter>
    </defs>
  </svg>
);

const WormholeGatewayIcon = ({ width = 28 }: { width?: number }) => (
  <svg
    width={width}
    height={width}
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x={1}
      y={1}
      width={26}
      height={26}
      rx={13}
      fill="#121212"
      stroke="black"
      strokeWidth={2}
    />
    <path
      d="M21.5426 6.46013C25.7082 10.6257 25.7082 17.3795 21.5426 21.5451C17.377 25.7107 10.6233 25.7107 6.45769 21.5451C2.2921 17.3795 2.2921 10.6257 6.45769 6.46013C10.6233 2.29454 17.377 2.29454 21.5426 6.46013Z"
      fill="black"
      stroke="#C1BBF7"
      strokeWidth="1.33333"
    />
    <path
      d="M17.6669 16.4521C17.2848 17.1167 16.578 17.5255 15.812 17.5255H14.5733V13.3483L12.7853 16.453C12.4033 17.1177 11.6965 17.5264 10.9305 17.5264H9.70034V11.362H12.175V15.5286L14.5733 11.3639V11.362H17.047V15.5458L19.6458 11.0306C19.7509 10.8472 19.749 10.62 19.6353 10.4414C18.4367 8.54859 16.3116 7.30042 13.8971 7.33671C10.2151 7.39401 7.31449 10.3573 7.33359 14.0388C7.35269 17.704 10.3307 20.6693 14.0002 20.6693C17.6697 20.6693 20.6668 17.6849 20.6668 14.0035C20.6668 13.4104 20.5885 12.8355 20.4424 12.2874C20.3984 12.1212 20.1769 12.0906 20.0909 12.2387L17.6659 16.4511L17.6669 16.4521Z"
      fill="white"
    />
  </svg>
);

const iconMap: Record<string, React.FC<{ width?: number }>> = {
  [PORTAL_APP_ID]: PortalIcon,
  [CCTP_APP_ID]: CCTPIcon,
  [CONNECT_APP_ID]: ConnectIcon,
  [ETH_BRIDGE_APP_ID]: EthBridgeIcon,
  [MAYAN_APP_ID]: MayanIcon,
  [GR_APP_ID]: StandardRelayerIcon,
  [NTT_APP_ID]: NTTIcon,
  [PORTAL_NFT_APP_ID]: PortalNFTIcon,
  [GATEWAY_APP_ID]: WormholeGatewayIcon,
};

export default ProtocolIcon;
