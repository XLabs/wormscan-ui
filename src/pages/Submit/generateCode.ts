import { chainIdToChain } from "@wormhole-foundation/sdk";
import { deepCloneWithBigInt, stringifyWithStringBigInt } from "src/utils/object";

export const generateCode = (
  finishedParsings: any,
  parsedStandardizedProperties: any,
  lastMoreInfo: any,
  addedVAAs: any,
  selectedIdentifiers: any[],
  stdProperties: any,
  input: string,
  propertyName: string,
) => {
  const APPNAME = parsedStandardizedProperties.appIds[0];
  const USER_LAYOUT = JSON.stringify(finishedParsings[0].userLayout);

  const parsedPayloadCopy = deepCloneWithBigInt(finishedParsings[0].parsedPayload);
  if (parsedPayloadCopy?.callerAppId) delete parsedPayloadCopy.callerAppId;
  const PARSED_PAYLOAD = stringifyWithStringBigInt(parsedPayloadCopy);

  const MAINNET_IDENTIFIERS = selectedIdentifiers.filter(a => a.network === "Mainnet");
  const TESTNET_IDENTIFIERS = selectedIdentifiers.filter(a => a.network === "Testnet");

  const MAINNET_EMITTERS: any = {};
  const TESTNET_EMITTERS: any = {};

  for (const identifier of MAINNET_IDENTIFIERS) {
    const chainName = chainIdToChain(identifier.chain);

    if (!MAINNET_EMITTERS[chainName]) {
      MAINNET_EMITTERS[chainName] = [identifier.address];
    } else {
      MAINNET_EMITTERS[chainName].push(identifier.address);
    }
  }

  for (const identifier of TESTNET_IDENTIFIERS) {
    const chainName = chainIdToChain(identifier.chain);

    if (!TESTNET_EMITTERS[chainName]) {
      TESTNET_EMITTERS[chainName] = [identifier.address];
    } else {
      TESTNET_EMITTERS[chainName].push(identifier.address);
    }
  }

  console.log({ PARSED_PAYLOAD, USER_LAYOUT });

  const isPortalWithPayload =
    finishedParsings?.length === 1 &&
    USER_LAYOUT.startsWith(
      `[{"inputName":"payloadId","selected":"payloadId","id":"3"},{"inputName":"amount","selected":"amount"},{"inputName":"tokenAddress","selected":"address"},{"inputName":"tokenChain","selected":"chain"},{"inputName":"toAddress","selected":"address"},{"inputName":"toChain","selected":"chain"},{"inputName":"fromAddress","selected":"address"},`,
    );

  if (isPortalWithPayload) {
    const PORTAL_USER_LAYOUT = JSON.stringify([...finishedParsings[0].userLayout].slice(7));

    const protocolFileName = `src/parser/portal/protocols/${APPNAME}.ts`;
    const parserFileName = "src/parser/portal/parser.ts";
    const appIdFileName = "src/parser/portal/types.ts";
    const indexFileName = "src/parser/protocols/index.ts";
    const testFileName = "test/parser/portal/parser.spec.ts";

    return {
      [indexFileName]: `export * from "./${APPNAME}";`,
      [protocolFileName]: `
      import {
        chainToChainId,
        deserializeLayout,
        TokenBridge,
        VAA,
      } from "@wormhole-foundation/sdk";
      import { AppId, NestedParserResult } from "../types";
      import { Network } from "../../../utils";
      import { readableLayoutToLayout, parseStandardProperties, processResult } from "@payload-parser/utils/parseSubmit";

      const ${APPNAME}_USER_LAYOUT = readableLayoutToLayout(${PORTAL_USER_LAYOUT});

      export const ${APPNAME}_ADDRESSES = {
        [Network.MAINNET]: ${JSON.stringify(MAINNET_EMITTERS)},
        [Network.TESTNET]: ${JSON.stringify(TESTNET_EMITTERS)},
      };

      export const ${APPNAME}PayloadParser = (
        transfer: TokenBridge.TransferPayload<"TransferWithPayload">,
        vaa: VAA<"Uint8Array">,
      ): NestedParserResult => {
        const resultUnparsed = deserializeLayout(${APPNAME}_USER_LAYOUT, transfer.payload);
        const parsed = processResult(resultUnparsed);

        const stdProperties = ${JSON.stringify(stdProperties)};

        const standardizedProperties = parseStandardProperties(
          stdProperties,
          parsed,
          chainToChainId(vaa.emitterChain),
          "${APPNAME}",
        );

        if (standardizedProperties.appIds) delete standardizedProperties.appIds;

        return {
          appId: AppId["${APPNAME}"],
          parsed,
          standardizedProperties,
        };
      };

      `,
      [parserFileName]: `
        // add to imports "./protocols"
        ${APPNAME}PayloadParser,
        ${APPNAME}_ADDRESSES,

        // in PROTOCOL_ADDRESSES
        [AppId["${APPNAME}"]]: ${APPNAME}_ADDRESSES[Network.MAINNET],

        [AppId["${APPNAME}"]]: ${APPNAME}_ADDRESSES[Network.TESTNET],

        // in nestedParsers
        [AppId["${APPNAME}"]]: ${APPNAME}PayloadParser,

        // in buildAddressMap
        PROTOCOL_ADDRESSES[network][AppId["${APPNAME}"]]?.[chain]?.forEach((address) =>
          registerIfExists(address, AppId["${APPNAME}"]),
        );
      `,
      [appIdFileName]: `${APPNAME} = "${APPNAME}",`,
      [testFileName]: `
      const ${APPNAME}_VAA = Buffer.from("${input}", "base64");

      describe("${APPNAME} Transfer", () => {
        const parser = new PortalParser();

        it("parses a ${APPNAME} transaction", async () => {
          const vaa = deserialize("Uint8Array", ${APPNAME}_VAA);

          const result = await parser.parse(Network.MAINNET, vaa);

          // this needs manual modifications because nested payloads
          //    go trough some changes after parsing
          expect(result.result?.parsedPayload).toMatchObject(${PARSED_PAYLOAD});
          expect(result.standardizedProperties).toMatchObject({});
          // ----
        });
      });
      `,
    };
  }

  const isCCTP =
    finishedParsings?.length > 1 &&
    USER_LAYOUT ===
      `[{"inputName":"payloadId","selected":"payloadId","id":"1"},{"inputName":"tokenAddress","selected":"address"},{"inputName":"amount","selected":"amount"},{"inputName":"sourceDomain","selected":"custom","size":"4","binarySelected":"uint","endianness":"default"},{"inputName":"targetDomain","selected":"custom","size":"4","binarySelected":"uint","endianness":"default"},{"inputName":"nonce","selected":"custom","size":"8","binarySelected":"uint","endianness":"default"},{"inputName":"caller","selected":"address"},{"inputName":"mintRecipient","selected":"address"},{"inputName":"parsedPayload","selected":"custom","lengthSize":"2","binarySelected":"bytes","endianness":"default"}]`;

  if (isCCTP) {
    const APPNAME = parsedStandardizedProperties.appIds[1];
    const USER_LAYOUT = JSON.stringify(finishedParsings[1].userLayout);

    const parsedPayloadCopy = deepCloneWithBigInt(finishedParsings[1].parsedPayload);
    if (parsedPayloadCopy?.callerAppId) delete parsedPayloadCopy.callerAppId;
    const PARSED_PAYLOAD = stringifyWithStringBigInt(parsedPayloadCopy);

    const parserFileName = "src/parser/cctp/parser.ts";
    const protocolFileName = `src/parser/cctp/protocols/${APPNAME}.ts`;
    const appIdFileName = "src/parser/cctp/types.ts";
    const testFileName = "test/parser/cctp/parser.spec.ts";

    return {
      [parserFileName]: `
        import { ${APPNAME}PayloadParser, ${APPNAME}_EMITTERS } from "./protocols/${APPNAME}";

        // ... this code goes inside "nestedParsers":
        [AppId["${APPNAME}"]]: (transfer, network) =>
          ${APPNAME}PayloadParser(transfer, network),

        // ... following code inside for (const chain of chains) {
        for (const address of ${APPNAME}_EMITTERS[network][chain] || []) {
          registerIfExists(address, AppId["${APPNAME}"]);
        }
      `,
      [protocolFileName]: `
    import {
      AutomaticCircleBridge,
      circle,
      chainToChainId,
      deserializeLayout,
      UniversalAddress,
    } from "@wormhole-foundation/sdk";
    import { AppId, NestedParserResult } from "../types";
    import { Network } from "../../../utils";
    import { logger } from "@payload-parser/logger";
    import { readableLayoutToLayout, parseStandardProperties, processResult } from "@payload-parser/utils/parseSubmit";

    export const ${APPNAME}_EMITTERS = {
      [Network.MAINNET]: ${JSON.stringify(MAINNET_EMITTERS)},
      [Network.TESTNET]: ${JSON.stringify(TESTNET_EMITTERS)},
    };

    const ${APPNAME}_USER_LAYOUT = readableLayoutToLayout(${USER_LAYOUT});

    const stdProperties = ${JSON.stringify(stdProperties).replaceAll(propertyName + ".", "")};

    export const ${APPNAME}PayloadParser = (
      transfer: AutomaticCircleBridge.Payload<"DepositWithPayload">,
      network: Network,
    ): NestedParserResult => {
      try {
        const resultUnparsed = deserializeLayout(${APPNAME}_USER_LAYOUT, transfer.payload);
        const parsed = processResult(resultUnparsed);

        const standardizedProperties = parseStandardProperties(
          stdProperties,
          parsed,
          chainToChainId(circle.toCircleChain(network, transfer.sourceDomain)),
          "${APPNAME}",
        );

        if (standardizedProperties.appIds) delete standardizedProperties.appIds;

        return {
          appId: AppId["${APPNAME}"],
          parsed,
          standardizedProperties,
        };
      } catch (e) {
        logger.info("Wasnt able to parse ${APPNAME} payload", e);
        return { appId: AppId.UNKNOWN, parsed: null, standardizedProperties: {} };
      }
    };
      `,
      [appIdFileName]: `${APPNAME} = "${APPNAME}",`,
      [testFileName]: `
        const ${APPNAME}_VAA = Buffer.from("${input}", "base64");

        // inside describe:

        it("Decode CCTP + ${APPNAME} VAA", async () => {
          const vaa = deserialize("Uint8Array", ${APPNAME}_VAA);

          const result = await parser.parse(Network.MAINNET, vaa);

          expect(result.result?.parsedPayload).toMatchObject(${PARSED_PAYLOAD});

          expect(result.standardizedProperties).toMatchObject(${stringifyWithStringBigInt(
            parsedStandardizedProperties,
          )});
        });
      `,
    };
  }

  const isStandardRelayer =
    finishedParsings?.length > 1 &&
    USER_LAYOUT ===
      `[{"inputName":"payloadId","selected":"payloadId","id":"1","omit":true},{"inputName":"targetChainId","selected":"chain"},{"inputName":"targetAddress","selected":"address"},{"inputName":"payload","selected":"custom","lengthSize":"4","binarySelected":"bytes","endianness":"default"},{"inputName":"requestedReceiverValue","selected":"amount"},{"inputName":"extraReceiverValue","selected":"amount"},{"inputName":"executionInfo","selected":"custom","binarySelected":"bytes","endianness":"default","layout":[{"inputName":"size","selected":"custom","size":"4","binarySelected":"uint","endianness":"default","omit":true},{"inputName":"waste","selected":"custom","size":"31","binarySelected":"uint","endianness":"default","omit":true},{"inputName":"version","selected":"custom","size":"1","binarySelected":"uint","endianness":"default","omit":true},{"inputName":"gasLimit","selected":"amount"},{"inputName":"targetChainRefundPerGasUnused","selected":"amount"}]},{"inputName":"refundChainId","selected":"chain"},{"inputName":"refundAddress","selected":"address"},{"inputName":"refundDeliveryProvider","selected":"address"},{"inputName":"sourceDeliveryProvider","selected":"address"},{"inputName":"senderAddress","selected":"address"},{"inputName":"messageKeys","selected":"custom","lengthSize":"1","binarySelected":"array","endianness":"default","layout":[{"inputName":"keyType","selected":"custom","size":"1","binarySelected":"switch","endianness":"default","layouts":[[[1,"VAA"],[{"inputName":"chain","selected":"chain"},{"inputName":"emitter","selected":"address"},{"inputName":"sequence","selected":"custom","size":"8","binarySelected":"uint","endianness":"default"}]],[[2,"CCTP"],[{"inputName":"size","selected":"custom","size":"4","binarySelected":"uint","endianness":"default","omit":true},{"inputName":"domain","selected":"custom","size":"4","binarySelected":"uint","endianness":"default"},{"inputName":"nonce","selected":"custom","size":"8","binarySelected":"uint","endianness":"default"}]]]}]}]`;

  if (isStandardRelayer) {
    const APPNAME = parsedStandardizedProperties.appIds[1];
    const USER_LAYOUT = JSON.stringify(finishedParsings[1].userLayout);

    const parserFileName = "src/parser/generic-relayer/parser.ts";
    const protocolFileName = `src/parser/generic-relayer/protocols/${APPNAME}.ts`;
    // const testFileName = "test/parser/generic-relayer/parser.spec.ts";

    return {
      [parserFileName]: `
      import { ${APPNAME}Parser } from "./protocols/${APPNAME}";

      // add to DEFAULT_PARSERS:
      new ${APPNAME}Parser();
      `,
      [protocolFileName]: `
      import { IParser, ParserResponse } from "@payload-parser/parser/parser";
      import { Network } from "@payload-parser/utils";
      import {
        VAA,
        deserializeLayout,
        chainToChainId,
      } from "@wormhole-foundation/sdk";
      import { readableLayoutToLayout, parseStandardProperties, processResult } from "@payload-parser/utils/parseSubmit";

      export const ${APPNAME}_EMITTERS = {
        [Network.MAINNET]: ${JSON.stringify(MAINNET_EMITTERS)},
        [Network.TESTNET]: ${JSON.stringify(TESTNET_EMITTERS)},
      };

      const ${APPNAME}_USER_LAYOUT = readableLayoutToLayout(${USER_LAYOUT});

      const stdProperties = ${JSON.stringify(stdProperties).replaceAll(propertyName + ".", "")};

      export class ${APPNAME}Parser implements IParser {
        appId: string = "${APPNAME}";

        async parse(
          networks: Network,
          vaa: VAA<"Uint8Array">,
        ): Promise<ParserResponse | undefined> {
          try {
            const innerParse = await this.innerParse(networks, vaa);
            return innerParse;
          } catch (e) {
            // this protocol is not in this txn.
            return undefined;
          }
        }

        async innerParse(
          networks: Network,
          vaa: VAA<"Uint8Array">,
        ): Promise<ParserResponse | undefined> {
          const resultUnparsed = deserializeLayout(${APPNAME}_USER_LAYOUT, vaa.payload);
          const result = processResult(resultUnparsed);

          const standardizedProperties = parseStandardProperties(
            stdProperties,
            result,
            chainToChainId(vaa.emitterChain),
            "${APPNAME}",
          );

          return {
            result,
            standardizedProperties,
          };
        }
      }

      `,
    };
  }

  const parserFileName = `src/parser/${APPNAME}/parser.ts`;
  const testFileName = `test/parser/${APPNAME}/parser.spec.ts`;
  return {
    [parserFileName]: `

    /*
    Used VAA while parsing:
  
    ${input}
  
    ---
  
    Additional Info:
  
    ${lastMoreInfo}
  
    ---
  
    Additional VAAs or txHashes to parse:
  
    ${JSON.stringify(addedVAAs)}
  */
  
    import { Network } from "@payload-parser/utils";
    import {
      VAA,
      deserializeLayout,
      chainToChainId,
    } from "@wormhole-foundation/sdk";
    import { IParser, ParserResponse } from "../parser";
    import { processResult, readableLayoutToLayout, parseStandardProperties } from '../../utils/parseSubmit';
  
    export const ${APPNAME}_EMITTERS = {
      [Network.MAINNET]: ${JSON.stringify(MAINNET_EMITTERS)},
      [Network.TESTNET]: ${JSON.stringify(TESTNET_EMITTERS)},
    };
  
    const ${APPNAME}_USER_LAYOUT = readableLayoutToLayout(${USER_LAYOUT});
  
    const stdProperties = ${JSON.stringify(stdProperties)};
  
    export class ${APPNAME}Parser implements IParser {
      appId = "${APPNAME}";
  
      constructor() {}
  
      async parse(
        network: Network,
        vaa: VAA<"Uint8Array">,
      ): Promise<ParserResponse> {
        const resultUnparsed = deserializeLayout(${APPNAME}_USER_LAYOUT, vaa.payload);
  
        const result = processResult(resultUnparsed);
  
        const standardizedProperties = parseStandardProperties(
          stdProperties,
          result,
          chainToChainId(vaa.emitterChain),
          this.appId,
        );
  
        return {
          result,
          standardizedProperties,
        };
      }
    }
  
    `,
    [testFileName]: `
  import { ${APPNAME}Parser } from "@payload-parser/parser/${APPNAME}/parser";
  import { describe } from "@jest/globals";
  import { Network } from "../../../src/utils";
  import { deserialize } from "@wormhole-foundation/sdk";
  
  const ${APPNAME}VAA = Buffer.from(
    "${input}",
    "base64",
  );
  
  describe("${APPNAME}Parser", () => {
    const parser = new ${APPNAME}Parser();
  
    it("Decode ${APPNAME} VAA", async () => {
      const vaa = deserialize("Uint8Array", ${APPNAME}VAA);
  
      const result = await parser.parse(Network.MAINNET, vaa);
  
      expect(result.result).toMatchObject(${PARSED_PAYLOAD});
  
      expect(result.standardizedProperties).toMatchObject(${stringifyWithStringBigInt(
        parsedStandardizedProperties,
      )});
    });
  });
  `,
  };
};
