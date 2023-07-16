import { ChainId, parseVaa, tryNativeToHexString } from "@certusone/wormhole-sdk";
import { getChainInfo } from "src/pages/RelayerDashboard/utils/environment";
import { useCallback, useEffect, useState } from "react";
import { Alert, Button, CircularProgress, Divider, TextField, Typography } from "@mui/material";
import {
  DeliveryInstruction,
  DeliveryTargetInfo,
  RedeliveryInstruction,
} from "@certusone/wormhole-sdk/lib/cjs/relayer";
import {
  DeliveryLifecycleRecord,
  getDeliveryStatusByVaa,
  getGenericRelayerVaasFromTransaction,
  getVaa,
  isRedelivery,
  manualDeliver,
  parseGenericRelayerVaa,
  populateDeliveryLifeCycleRecordsByTxHash,
  populateDeliveryLifecycleRecordByEmitterSequence,
  populateDeliveryLifecycleRecordByVaa,
} from "src/pages/RelayerDashboard/utils/VaaUtils";
import { useEnvironment } from "src/pages/RelayerDashboard/context/EnvironmentContext";
import { useEthereumProvider } from "src/pages/RelayerDashboard/context/EthereumProviderContext";
import { getDeliveryProviderStatusBySourceTransaction } from "src/pages/RelayerDashboard/utils/deliveryProviderStatusApi";
import { BlockSection } from "src/pages/Tx/Information/RawData";
import { Loader } from "src/components/atoms";
import "./styles.scss";
import { Tabs } from "src/components/organisms";
import { Information } from "../Information";

//test tx hash 0xcf66519f71be66c7ab5582e864a37d686c6164a32b3df22c89b32119ecfcfc5e
//test sequence 1
//test VAA
// 010000000001005867d34b56b4433ad913e6ce2573e09d24c9f1db4317a37cdd55efe7540e1bd461641020a9d916f0eaab764fac84d4a2cb678d34f5704661ed94554e9a7e403e00000002f300000000000600000000000000000000000053855d4b64e9a3cf59a84bc768ada716b5536bc50000000000000001c80100040000000000000000000000000eb0dd3aa41bd15c706bc09bc03c002b7b85aeac00000011000000000849443a2035363537000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001e84800000000000000000000000000000000000000000000000000000004285e6049200040000000000000000000000000eb0dd3aa41bd15c706bc09bc03c002b7b85aeac0000000000000000000000001ef9e15c3bbf0555860b5009b51722027134d53a0000000000000000000000001ef9e15c3bbf0555860b5009b51722027134d53a0000000000000000000000000eb0dd3aa41bd15c706bc09bc03c002b7b85aeac00
//redelivery vaa:
// 01000000000200d92d417b5f6a20e998652d952f3af3926572f7fd143bb7ad393355f8d1bef64e65ed3f4cff4024fec68fb5f47bf557cb435801dd3896b4a9893a3b4cb3603250000147243d7b7b0e4360b3d918b1cf8a9f0cbbd95e42bf14989ecd4319a57726fab4361ab4da00534875ede2cc2e3ac13cb25a43dd583eaa2d654bbc254080a64b710100000263000000000002000000000000000000000000e66c1bc1b369ef4f376b84373e3aa004e8f4c0830000000000000008c802010002000000000000000000000000e66c1bc1b369ef4f376b84373e3aa004e8f4c083000000000000000700040000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000007a1200000000000000000000000000000000000000000000000000000004285e604920000000000000000000000001ef9e15c3bbf0555860b5009b51722027134d53a00000000000000000000000090f8bf6a479f320ead074411a4b0e7944ea8c9c1
// moonbeam mainnet example 0x6a2c36673e8cbbef29cc3bad4eabfb8edb0851c0d27defba300f80561ccecec6
// moonbeam testnet example 0x9e6e57b40afc622f66c7f29613e71da25e0137e45a3582043058527c13501c86
// celo mainnet failed example (SEQUENCE= 58)

//  testnet test data
// source transaction moonbeam 0x9e6e57b40afc622f66c7f29613e71da25e0137e45a3582043058527c13501c86
//  target transaction polygon 0x299e9b3c7993aac77261c2defa6fb01c68c8b90d50767cd4dfe6e319158c18b9
// rawVAA (base64 moonbeam)   AQAAAAABAB006dIl/plMlZj+cU6i0g8kYN1CZKDxfgik/1PK7t1FLu/bDq/f7083j3lPox1q6kK8zGfw6IKDRmr1T+FhG+8BZLChHAAAAAAAEAAAAAAAAAAAAAAAAAWRwl69BYDg1PJ6gvwuJOdInLXgAAAAAAAAAEHIAQAOAAAAAAAAAAAAAAAAfx2OgJq7P23JuQ8BMcPoMIBG4ZAAAAARAAAAAAhJRDogMjU3MQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAehIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGpv1m2wAOAAAAAAAAAAAAAAAAfx2OgJq7P23JuQ8BMcPoMIBG4ZAAAAAAAAAAAAAAAABgqGuXp1luv9Jft2kFOJTtDZqDZgAAAAAAAAAAAAAAAGCoa5enWW6/0l+3aQU4lO0NmoNmAAAAAAAAAAAAAAAAO/DEPYhUG7z5K+UI7EHlQPvyjFYA
// rawVaa (hex moonbeam)     010000000001001d34e9d225fe994c9598fe714ea2d20f2460dd4264a0f17e08a4ff53caeedd452eefdb0eafdfef4f378f794fa31d6aea42bccc67f0e88283466af54fe1611bef0164b0a11c0000000000100000000000000000000000000591c25ebd0580e0d4f27a82fc2e24e7489cb5e00000000000000041c801000e0000000000000000000000007f1d8e809abb3f6dc9b90f0131c3e8308046e19000000011000000000849443a2032353731000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001e848000000000000000000000000000000000000000000000000000000006a6fd66db000e0000000000000000000000007f1d8e809abb3f6dc9b90f0131c3e8308046e19000000000000000000000000060a86b97a7596ebfd25fb769053894ed0d9a836600000000000000000000000060a86b97a7596ebfd25fb769053894ed0d9a83660000000000000000000000003bf0c43d88541bbcf92be508ec41e540fbf28c5600
// redelivery vaa

export default function DeliveryStatus() {
  const { environment, userInput, chain } = useEnvironment();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [didSearch, setDidSearch] = useState("");

  const targetContract = environment.chainInfos.find(
    c => c.chainId === chain,
  )?.relayerContractAddress;

  const emitter = targetContract
    ? tryNativeToHexString(targetContract, "ethereum")
    : "Error, unconfigured";

  const [lifecycleRecords, setLifecycleRecords] = useState<DeliveryLifecycleRecord[]>([]);

  const handleSearch = useCallback(() => {
    setError("");
    setLoading(true);
    setDidSearch(userInput + chain);
    setLifecycleRecords([]);

    let queryType;

    if (userInput.startsWith("0x") && userInput.length === 66) {
      queryType = "txHash";
    } else if (!isNaN(+userInput)) {
      const maxUint64 = BigInt("18446744073709551615");
      const inputNumber = BigInt(userInput);
      if (inputNumber > 0 && inputNumber < maxUint64) {
        queryType = "EmitterSeq";
      }
    } else {
      queryType = "VAA";
    }

    console.log("User input query type:", queryType);

    if (queryType === "txHash") {
      // populateDeliveryLifeCycleRecordsByTxHash(environment, txHash)
      populateDeliveryLifeCycleRecordsByTxHash(environment, userInput)
        .then((results: DeliveryLifecycleRecord[]) => {
          setLoading(false);
          setLifecycleRecords(results);
        })
        .catch((e: any) => {
          setLoading(false);
          setError(e.message || "An error occurred.");
        });
    } else if (queryType === "EmitterSeq") {
      populateDeliveryLifecycleRecordByEmitterSequence(
        environment,
        getChainInfo(environment, chain),
        emitter,
        parseInt(userInput),
        // parseInt(sequence),
      )
        .then((results: DeliveryLifecycleRecord) => {
          setLoading(false);
          setLifecycleRecords([results]);
        })
        .catch((e: any) => {
          setLoading(false);
          setError(e.message || "An error occurred.");
        });
    } else if (queryType === "VAA") {
      // populateDeliveryLifecycleRecordByVaa(environment, vaaRaw)
      populateDeliveryLifecycleRecordByVaa(environment, userInput)
        .then((results: DeliveryLifecycleRecord) => {
          setLoading(false);
          setLifecycleRecords([results]);
        })
        .catch((e: any) => {
          setLoading(false);
          setError(e.message || "An error occurred.");
        });
    } else {
      setError("Invalid query type");
      setLoading(false);
    }
  }, [chain, emitter, environment, userInput]);

  useEffect(() => {
    console.log("user_data", { userInput, chain });
    if (didSearch !== userInput + chain) {
      setDidSearch("");
    }
    if (userInput) {
      handleSearch();
    }
  }, [handleSearch, userInput, chain, didSearch]);

  console.log({ lifecycleRecords });

  return (
    <div className="relayer-delivery-status">
      {error && <div className="relayer-errored">{error}</div>}
      {loading && (
        <div>
          <Loader />
        </div>
      )}

      {didSearch &&
        !loading &&
        (lifecycleRecords.length > 0 ? (
          <Information lifecycleRecords={lifecycleRecords} />
        ) : (
          <div className="relayer-errored">No relay status was found for this input</div>
        ))}

      {/* {vaaReaders && vaaReaders} */}
      {/* {lifecycleRecordDisplays ? lifecycleRecordDisplays : null} */}
    </div>
  );
}
