export const getGuardianSet = (version: number) => {
  const v1 = [
    {
      pubkey: "0x58CC3AE5C097b213cE3c81979e1B9f9570746AA5",
      name: "Jump Crypto", // Certus One
    },
    {
      pubkey: "0xfF6CB952589BDE862c25Ef4392132fb9D4A42157",
      name: "Staked",
    },
    {
      pubkey: "0x114De8460193bdf3A2fCf81f86a09765F4762fD1",
      name: "Figment",
    },
    {
      pubkey: "0x107A0086b32d7A0977926A205131d8731D39cbEB",
      name: "ChainodeTech",
    },
    {
      pubkey: "0x8C82B2fd82FaeD2711d59AF0F2499D16e726f6b2",
      name: "Inotel",
    },
    {
      pubkey: "0x11b39756C042441BE6D8650b69b54EbE715E2343",
      name: "HashQuark",
    },
    {
      pubkey: "0x54Ce5B4D348fb74B958e8966e2ec3dBd4958a7cd",
      name: "Chainlayer",
    },
    {
      pubkey: "0xeB5F7389Fa26941519f0863349C223b73a6DDEE7",
      name: "DokiaCapital",
    },
    {
      pubkey: "0x74a3bf913953D695260D88BC1aA25A4eeE363ef0",
      name: "Forbole",
    },
    {
      pubkey: "0x000aC0076727b35FBea2dAc28fEE5cCB0fEA768e",
      name: "Staking Fund",
    },
    {
      pubkey: "0xAF45Ced136b9D9e24903464AE889F5C8a723FC14",
      name: "MoonletWallet",
    },
    {
      pubkey: "0xf93124b7c738843CBB89E864c862c38cddCccF95",
      name: "P2P.ORG Validator",
    },
    {
      pubkey: "0xD2CC37A4dc036a8D232b48f62cDD4731412f4890",
      name: "01Node",
    },
    {
      pubkey: "0xDA798F6896A3331F64b48c12D1D57Fd9cbe70811",
      name: "MCF",
    },
    {
      pubkey: "0x71AA1BE1D36CaFE3867910F99C09e347899C19C3",
      name: "Everstake",
    },
    {
      pubkey: "0x8192b6E7387CCd768277c17DAb1b7a5027c0b3Cf",
      name: "Chorus One",
    },
    {
      pubkey: "0x178e21ad2E77AE06711549CFBB1f9c7a9d8096e8",
      name: "Syncnode",
    },
    {
      pubkey: "0x5E1487F35515d02A92753504a8D75471b9f49EdB",
      name: "Triton",
    },
    {
      pubkey: "0x6FbEBc898F403E4773E95feB15E80C9A99c8348d",
      name: "Staking Facilities",
    },
  ];

  const v2 = [...v1];
  v2[7] = {
    pubkey: "0x66B9590e1c41e0B226937bf9217D1d67Fd4E91F5",
    name: "FTX",
  };

  const v3 = v2;
  v3[7] = {
    pubkey: "0x15e7cAF07C4e3DC8e7C469f92C8Cd88FB8005a20",
    name: "xLabs",
  };

  if (version === 1) {
    // https://raw.githubusercontent.com/wormhole-foundation/wormhole-networks/master/mainnetv2/guardianset/v1.prototxt
    return v1;
  }
  // https://raw.githubusercontent.com/wormhole-foundation/wormhole-networks/master/mainnetv2/guardianset/v2.prototxt
  if (version === 2) {
    return v2;
  }
  // https://raw.githubusercontent.com/wormhole-foundation/wormhole-networks/master/mainnetv2/guardianset/v3.prototxt
  if (version === 3) {
    return v3;
  }

  return [];
};

export const getExplorer = () => {
  // TODO: get explorer web by ChainId
};