import { chainIdToChain } from "@wormhole-foundation/sdk";
import {
  deepCloneWithBigInt,
  stringifyWithBigInt,
  stringifyWithStringBigInt,
} from "src/utils/object";

export const generateCode = (
  finishedParsings: any,
  parsedStandardizedProperties: any,
  lastMoreInfo: any,
  addedVAAs: any,
  selectedIdentifiers: any[],
  stdProperties: any,
  input: string,
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

  const parserCodeGenerated = `
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
  import { processResult, readableLayoutToLayout, parseStandardProperties } from '../../utils/layouting';

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
`;

  const testCodeGenerated = `
import { ${APPNAME}Parser } from "@payload-parser/parser/YOUR_PARSER";
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

`;

  return { parserCodeGenerated, testCodeGenerated };
};
