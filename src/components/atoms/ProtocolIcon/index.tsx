import {
  ALL_BRIDGE_APP_ID,
  C3_APP_ID,
  CCTP_APP_ID,
  CONNECT_APP_ID,
  ETH_BRIDGE_APP_ID,
  GATEWAY_APP_ID,
  GR_APP_ID,
  MAYAN_APP_ID,
  NTT_APP_ID,
  PORTAL_APP_ID,
  PORTAL_NFT_APP_ID,
  TBTC_APP_ID,
  USDT_TRANSFER_APP_ID,
} from "src/consts";

const ProtocolIcon = ({ protocol, width = 28 }: { protocol: string; width?: number }) => {
  const IconComponent = iconMap[protocol];
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
    <rect
      fill="transparent"
      height={width}
      rx={13}
      stroke="transparent"
      strokeWidth={2}
      width={width}
      x={1}
      y={1}
    />
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

const AllbridgeIcon = ({ width = 28 }: { width?: number }) => (
  <svg
    fill="none"
    height={width}
    viewBox="-6 -6 44 44"
    width={width}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7.76378 16.1729C7.76378 11.6006 11.4508 7.89398 15.9991 7.89398C20.5473 7.89398 24.2344 11.6006 24.2344 16.1729M7.76378 16.1729C7.76378 20.7453 11.4508 24.4519 15.9991 24.4519C20.5473 24.4519 24.2344 20.7453 24.2344 16.1729M7.76378 16.1729L7.76378 2.20539M24.2344 16.1729L24.2344 29.9995"
      stroke="#5B978E"
      strokeWidth="3.2"
      strokeLinecap="round"
    />
    <path
      d="M15.5885 29.9998L14.8003 29.9998C7.73101 29.9998 2.00025 24.269 2.00025 17.1998L2.00024 6.11743"
      stroke="#5B978E"
      strokeWidth="3.2"
      strokeLinecap="round"
    />
    <path
      d="M16.412 2.00011L17.2002 2.00011C24.2695 2.00011 30.0002 7.73087 30.0002 14.8001L30.0002 25.4707"
      stroke="#5B978E"
      strokeWidth="3.2"
      strokeLinecap="round"
    />
  </svg>
);

const C3Icon = ({ width = 40 }: { width?: number }) => (
  <svg
    width={width}
    height={width}
    viewBox="0 0 183 183"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="183" height="183" rx="91.5" fill="white" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M144.284 115.275H135.912H135.901C134.929 115.275 134.407 114.028 135.055 113.254C140.866 106.303 143.646 98.7677 143.646 90.7274C143.646 82.6872 141.065 74.995 135.212 68.0777C134.553 67.2916 135.076 66.0452 136.058 66.0452H144.43C144.995 66.0452 145.517 66.3371 145.841 66.8312C147.367 69.2231 148.642 71.7273 149.667 74.3212C151.767 79.644 152.729 85.3598 152.729 90.7162C152.729 96.0726 151.757 101.35 149.792 106.404C148.705 109.211 147.336 111.906 145.684 114.489C145.371 114.983 144.838 115.275 144.284 115.275ZM48.4533 115.579H40.0917C39.5377 115.579 39.0047 115.287 38.6911 114.793C37.0397 112.21 35.6705 109.515 34.5835 106.708C32.6185 101.654 31.6465 96.3879 31.6465 91.0202C31.6465 85.6525 32.6081 79.948 34.7089 74.6253C35.7332 72.0313 37.0083 69.5271 38.5343 67.1352C38.8479 66.6411 39.3809 66.3492 39.9349 66.3492H48.3069C49.2894 66.3492 49.812 67.5956 49.1535 68.3817C43.3004 75.299 40.7188 82.9912 40.7188 91.0314C40.7188 99.0717 43.499 106.607 49.3103 113.558C49.9583 114.332 49.4357 115.579 48.4637 115.579H48.4533ZM91.8751 85.0574C90.4432 74.8611 83.1477 68.5726 72.2254 68.5726C59.5262 68.5726 51.6977 78.0727 51.6977 90.6272C51.6977 103.182 59.5262 112.749 72.2254 112.749C83.1582 112.749 90.4432 106.449 91.8751 96.197C91.9274 95.8265 91.6556 95.5008 91.3107 95.5008H83.3568C83.085 95.5008 82.8551 95.7142 82.8028 95.9949C81.7367 101.34 77.6291 104.215 72.3404 104.215C65.3584 104.215 60.77 99.4648 60.77 90.6272C60.77 81.7897 65.3689 77.0958 72.3404 77.0958C77.6291 77.0958 81.7367 79.9144 82.8028 85.2596C82.8655 85.5403 83.085 85.7537 83.3568 85.7537H91.3107C91.6556 85.7537 91.9274 85.428 91.8751 85.0574ZM105.578 96.3541C105.567 96.0172 105.327 95.7477 105.013 95.7477L105.003 95.7702H97.0699C96.7459 95.7702 96.495 96.0622 96.495 96.399C96.7668 108.819 105.055 112.772 115.152 112.772C124.736 112.772 132.335 108.987 132.335 100.52C132.335 92.9067 127.402 91.9859 122.301 91.256V88.8192C127.402 87.9096 131.77 86.6856 131.77 80.2287C131.77 72.3681 125.217 68.595 115.152 68.595C105.087 68.595 97.3626 74.1423 97.0699 84.8215C97.0699 85.1696 97.3312 85.4503 97.6448 85.4503H105.578C105.881 85.4503 106.132 85.1921 106.142 84.8552C106.299 80.2399 108.358 77.1293 115.152 77.1293C120.994 77.1293 122.698 78.6566 122.698 81.4527C122.698 84.2488 121.172 85.776 117.765 85.776H112.769C112.455 85.776 112.204 86.0455 112.204 86.3824V93.6927C112.204 94.0296 112.455 94.2991 112.769 94.2991H117.765C121.162 94.2991 123.263 95.8263 123.263 99.2962C123.263 102.766 120.994 104.226 115.152 104.226C108.285 104.226 105.724 102.62 105.578 96.3541Z"
      fill="black"
    />
  </svg>
);

const CCTPIcon = ({ width = 28 }: { width?: number }) => (
  <svg
    fill="none"
    height={width}
    viewBox="0 0 28 28"
    width={width}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x={1}
      y={1}
      width={26}
      height={26}
      rx={13}
      fill="transparent"
      stroke="transparent"
      strokeWidth={2}
    />
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
    fill="none"
    height={width}
    viewBox="0 0 28 28"
    width={width}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x={1}
      y={1}
      width={26}
      height={26}
      rx={13}
      fill="transparent"
      stroke="transparent"
      strokeWidth={2}
    />
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
    fill="none"
    height={width}
    viewBox="0 0 28 28"
    width={width}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x={1}
      y={1}
      width={26}
      height={26}
      rx={13}
      fill="transparent"
      stroke="transparent"
      strokeWidth={2}
    />
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
    fill="none"
    height={width}
    viewBox="0 0 28 28"
    width={width}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x={1}
      y={1}
      width={26}
      height={26}
      rx={13}
      fill="transparent"
      stroke="transparent"
      strokeWidth={2}
    />
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
    fill="none"
    height={width}
    viewBox="0 0 28 28"
    width={width}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x={1}
      y={1}
      width={26}
      height={26}
      rx={13}
      fill="transparent"
      stroke="transparent"
      strokeWidth={2}
    />
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
    fill="none"
    height={width}
    viewBox="0 0 28 28"
    width={width}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x={1}
      y={1}
      width={26}
      height={26}
      rx={13}
      fill="transparent"
      stroke="transparent"
      strokeWidth={2}
    />
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
      stroke="transparent"
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
    fill="none"
    height={width}
    viewBox="0 0 28 28"
    width={width}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x={1}
      y={1}
      width={26}
      height={26}
      rx={13}
      fill="transparent"
      stroke="transparent"
      strokeWidth={2}
    />
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
    fill="none"
    height={width}
    viewBox="0 0 28 28"
    width={width}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x={1}
      y={1}
      width={26}
      height={26}
      rx={13}
      fill="#121212"
      stroke="transparent"
      strokeWidth={2}
    />
    <path
      d="M21.5426 6.46013C25.7082 10.6257 25.7082 17.3795 21.5426 21.5451C17.377 25.7107 10.6233 25.7107 6.45769 21.5451C2.2921 17.3795 2.2921 10.6257 6.45769 6.46013C10.6233 2.29454 17.377 2.29454 21.5426 6.46013Z"
      fill="transparent"
      stroke="#C1BBF7"
      strokeWidth="1.33333"
    />
    <path
      d="M17.6669 16.4521C17.2848 17.1167 16.578 17.5255 15.812 17.5255H14.5733V13.3483L12.7853 16.453C12.4033 17.1177 11.6965 17.5264 10.9305 17.5264H9.70034V11.362H12.175V15.5286L14.5733 11.3639V11.362H17.047V15.5458L19.6458 11.0306C19.7509 10.8472 19.749 10.62 19.6353 10.4414C18.4367 8.54859 16.3116 7.30042 13.8971 7.33671C10.2151 7.39401 7.31449 10.3573 7.33359 14.0388C7.35269 17.704 10.3307 20.6693 14.0002 20.6693C17.6697 20.6693 20.6668 17.6849 20.6668 14.0035C20.6668 13.4104 20.5885 12.8355 20.4424 12.2874C20.3984 12.1212 20.1769 12.0906 20.0909 12.2387L17.6659 16.4511L17.6669 16.4521Z"
      fill="white"
    />
  </svg>
);

const USDTTransferIcon = ({ width = 28 }: { width?: number }) => (
  <svg
    width={width}
    height={width}
    viewBox="-20 0 270 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clipPath="url(#clip0_313_9792)">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M42.0972 0.982283L0.176253 89.0373C0.0167314 89.3648 -0.0338199 89.7348 0.0319915 90.0931C0.0978028 90.4514 0.276524 90.7792 0.54202 91.0287L113.76 199.519C114.082 199.828 114.51 200 114.956 200C115.402 200 115.83 199.828 116.151 199.519L229.37 91.0355C229.635 90.786 229.814 90.4582 229.88 90.0998C229.946 89.7415 229.895 89.3716 229.736 89.0441L187.815 0.989056C187.679 0.69333 187.462 0.442813 187.188 0.267445C186.914 0.0920761 186.596 -0.00072543 186.27 0.000131083H43.6551C43.3283 -0.00393409 43.0074 0.086632 42.731 0.260904C42.4545 0.435177 42.2344 0.68571 42.0972 0.982283Z"
        fill="#50AF95"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M129.502 98.0801C128.689 98.1411 124.49 98.3917 115.122 98.3917C107.671 98.3917 102.381 98.1682 100.525 98.0801C71.7311 96.8135 50.2389 91.8011 50.2389 85.7998C50.2389 79.7985 71.7311 74.7929 100.525 73.506V93.0881C102.408 93.2235 107.8 93.5419 115.251 93.5419C124.192 93.5419 128.669 93.1693 129.475 93.0948V73.5195C158.208 74.7997 179.653 79.8121 179.653 85.7998C179.653 91.7876 158.215 96.7999 129.475 98.0733L129.502 98.0801ZM129.502 71.4943V53.9713H169.601V27.25H60.4262V53.9713H100.518V71.4875C67.9312 72.9844 43.4248 79.4395 43.4248 87.1748C43.4248 94.9101 67.9312 101.358 100.518 102.862V159.014H129.495V102.842C162.008 101.345 186.474 94.8966 186.474 87.1681C186.474 79.4395 162.028 72.9912 129.495 71.4875L129.502 71.4943Z"
        fill="white"
      />
    </g>
    <defs>
      <clipPath id="clip0_313_9792">
        <rect width="229.912" height={200} fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const TbtcIcon = ({ width = 28 }: { width?: number }) => (
  <svg
    fill="none"
    height={width}
    viewBox="0 0 144 144"
    width={width}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M59.5621 65.1122H47.531V77.1433H59.5621V65.1122Z" fill="white" />
    <path d="M47.5309 53.081H35.4997V65.1121L47.531 65.1122L47.5309 53.081Z" fill="white" />
    <path d="M35.4978 65.1122H23.4667V77.1433H35.4978V65.1122Z" fill="white" />
    <path d="M47.531 77.1433L35.4997 77.1427V89.1738H47.5309L47.531 77.1433Z" fill="white" />
    <path
      d="M115.922 55.6723C115.074 46.824 107.437 43.8538 97.791 43.0056V37.3377H90.3225V42.6822C88.3601 42.6822 86.3535 42.7198 84.3579 42.7575V37.3333H76.8938V42.9989C75.2769 43.0299 65.3433 43.0211 65.3433 43.0211L65.3211 49.6058L71.5538 49.6413V92.7977H65.3233L65.268 99.2895C67.0775 99.2895 75.1308 99.3249 76.8761 99.336V104.931H84.3401V99.4689C86.3867 99.5132 88.3712 99.5309 90.307 99.5287V104.933H97.7777V99.3626C110.338 98.6472 119.133 95.4866 120.225 83.6947C121.111 74.1974 116.646 69.9626 109.516 68.2394C113.849 66.0246 116.558 62.1463 115.926 55.6701L115.922 55.6723ZM105.457 82.2129C105.457 91.491 89.5739 90.4301 84.5063 90.4323V73.9847C89.5716 73.9847 105.448 72.5384 105.45 82.2129H105.457ZM101.99 59.0057C101.99 67.4465 88.7366 66.4565 84.5173 66.4565V51.5372C88.7433 51.5394 101.995 50.2016 101.99 59.0057Z"
      fill="white"
    />
  </svg>
);

const iconMap: Record<string, React.FC<{ width?: number }>> = {
  [ALL_BRIDGE_APP_ID]: AllbridgeIcon,
  [C3_APP_ID]: C3Icon,
  [CCTP_APP_ID]: CCTPIcon,
  [CONNECT_APP_ID]: ConnectIcon,
  [ETH_BRIDGE_APP_ID]: EthBridgeIcon,
  [GATEWAY_APP_ID]: WormholeGatewayIcon,
  [GR_APP_ID]: StandardRelayerIcon,
  [MAYAN_APP_ID]: MayanIcon,
  [NTT_APP_ID]: NTTIcon,
  [PORTAL_APP_ID]: PortalIcon,
  [PORTAL_NFT_APP_ID]: PortalNFTIcon,
  [TBTC_APP_ID]: TbtcIcon,
  [USDT_TRANSFER_APP_ID]: USDTTransferIcon,

  // In Featured Protocols it returns other names instead of the appId
  ["CCTP"]: CCTPIcon,
  ["ALLBRIDGE"]: AllbridgeIcon,
};

export default ProtocolIcon;
