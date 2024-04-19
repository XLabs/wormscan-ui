import {
  Cross2Icon,
  ExternalLinkIcon,
  InfoCircledIcon,
  TwitterLogoIcon,
} from "@radix-ui/react-icons";
import { BlockchainIcon, Tooltip } from "src/components/atoms";
import { useEffect, useRef, useState } from "react";
import "./styles.scss";
import { IArkhamInfoByChain, IArkhamResponse } from "src/utils/cryptoToolkit";
import {
  CHAIN_ID_ARBITRUM,
  CHAIN_ID_AVAX,
  CHAIN_ID_BASE,
  CHAIN_ID_BSC,
  CHAIN_ID_BTC,
  CHAIN_ID_ETH,
  CHAIN_ID_OPTIMISM,
  CHAIN_ID_POLYGON,
} from "@certusone/wormhole-sdk";
import { ChainId } from "src/api";
import TwitterIcon from "src/icons/TwitterIcon";

type ChainInfoProps = {
  data: IArkhamInfoByChain;
  chainId: ChainId;
};

const ChainInfo = ({ data, chainId }: ChainInfoProps) => {
  return (
    <div className="address-chain-info">
      <BlockchainIcon chainId={chainId} network="MAINNET" size={22} />

      {data.arkhamEntity && (
        <div className="address-chain-info-entity">
          {data.arkhamEntity.name && (
            <div className="address-chain-info-entity-data">
              <span>Entity</span>
              <span className="address-chain-info-entity-data-name">{data.arkhamEntity.name}</span>
            </div>
          )}

          {/* {data.arkhamEntity.type && (
            <div className="address-chain-info-entity-data">
              <span>Type</span>
              <span className="address-chain-info-entity-data-name">{data.arkhamEntity.type}</span>
            </div>
          )} */}

          {data.arkhamEntity.website && (
            <div>
              <a target="_blank" rel="noopener noreferrer" href={data.arkhamEntity.website}>
                <ExternalLinkIcon width={16} height={16} />
              </a>
            </div>
          )}
          {data.arkhamEntity.twitter && (
            <div>
              <a target="_blank" rel="noopener noreferrer" href={data.arkhamEntity.twitter}>
                <TwitterLogoIcon width={16} height={16} />
              </a>
            </div>
          )}
        </div>
      )}

      {data.populatedTags && (
        <div className="address-chain-info-tags">
          {data.populatedTags.map((tag, i) => (
            <div key={tag.id + i} className="address-chain-info-tags-tag">
              {tag.label ? tag.label : tag.id}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

type AddressInfoTooltipProps = {
  info: IArkhamResponse;
};

const AddressInfoTooltip = ({ info }: AddressInfoTooltipProps) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Tooltip
        controlled
        side="bottom"
        maxWidth={false}
        open={isOpen}
        onClickOutside={() => setIsOpen(false)}
        tooltip={
          <div className="address-tooltip">
            <div className="address-tooltip-content">
              <div className="address-tooltip-closeIcon">
                <Cross2Icon onClick={() => setIsOpen(false)} width={22} height={22} />
              </div>

              {info.arbitrum_one && (
                <ChainInfo data={info.arbitrum_one} chainId={CHAIN_ID_ARBITRUM} />
              )}
              {info.avalanche && <ChainInfo data={info.avalanche} chainId={CHAIN_ID_AVAX} />}
              {info.base && <ChainInfo data={info.base} chainId={CHAIN_ID_BASE} />}
              {info.bitcoin && <ChainInfo data={info.bitcoin} chainId={CHAIN_ID_BTC} />}
              {info.bsc && <ChainInfo data={info.bsc} chainId={CHAIN_ID_BSC} />}
              {info.ethereum && <ChainInfo data={info.ethereum} chainId={CHAIN_ID_ETH} />}
              {/* {info.flare && <ChainInfo data={info.flare} chainId={CHAIN_ID_FLARE}/>} */}
              {info.optimism && <ChainInfo data={info.optimism} chainId={CHAIN_ID_OPTIMISM} />}
              {info.polygon && <ChainInfo data={info.polygon} chainId={CHAIN_ID_POLYGON} />}
              {/* {info.tron && <ChainInfo data={info.tron} chainId={CHAIN_ID_TRON}/>} */}
            </div>
          </div>
        }
      >
        <InfoCircledIcon
          className="info-tooltip-icon"
          onClick={() => setIsOpen(true)}
          height={20}
          width={20}
        />
      </Tooltip>
    </>
  );
};

export default AddressInfoTooltip;
