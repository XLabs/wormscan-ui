import { Cross2Icon, ExternalLinkIcon } from "@radix-ui/react-icons";
import { BlockchainIcon, Tooltip } from "src/components/atoms";
import ArkhamIcon from "src/icons/arkham.svg";
import { useState } from "react";
import { ChainId } from "src/api";
import TwitterIcon from "src/icons/TwitterIcon";
import { ARKHAM_CHAIN_NAME, IArkhamInfoByChain, IArkhamResponse } from "src/utils/arkham";
import "./styles.scss";

type ChainInfoProps = {
  data: IArkhamInfoByChain;
  chainId: ChainId;
};

const ChainInfo = ({ data, chainId }: ChainInfoProps) => {
  return (
    <>
      {(data.arkhamEntity || data.arkhamLabel) && (
        <>
          <div className="address-chain-info">
            <BlockchainIcon chainId={chainId} network="Mainnet" size={22} />
            <span>{data.arkhamEntity?.name}</span>

            {(data.arkhamEntity?.website || data.arkhamEntity?.twitter) && (
              <div className="arkham-icons">
                {data.arkhamEntity.website && (
                  <a target="_blank" rel="noopener noreferrer" href={data.arkhamEntity.website}>
                    <ExternalLinkIcon width={16} height={16} />
                  </a>
                )}
                {data.arkhamEntity.twitter && (
                  <a target="_blank" rel="noopener noreferrer" href={data.arkhamEntity.twitter}>
                    <div className="arkham-icons-twitter">
                      <TwitterIcon />
                    </div>
                  </a>
                )}
              </div>
            )}
          </div>

          {data.arkhamLabel && (
            <div className="address-chain-info-label">{data.arkhamLabel.name}</div>
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
        </>
      )}

      <a
        target="_blank"
        rel="noopener noreferrer"
        className="address-chain-arkham"
        href={`https://platform.arkhamintelligence.com/explorer/address/${data.address}`}
      >
        <span>Open in Arkham</span>
        <img src={ArkhamIcon} width={24} height={24} />
      </a>
    </>
  );
};

type AddressInfoTooltipProps = {
  info: IArkhamResponse;
  chain: ChainId;
};

const AddressInfoTooltip = ({ info, chain }: AddressInfoTooltipProps) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!info?.[ARKHAM_CHAIN_NAME[chain]]) return null;

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

              <ChainInfo data={info[ARKHAM_CHAIN_NAME[chain]]} chainId={chain} />
            </div>
          </div>
        }
      >
        <img
          src={ArkhamIcon}
          alt="Arkham Address Info"
          height={24}
          width={24}
          className="info-tooltip-icon"
          onClick={() => setIsOpen(true)}
        />
      </Tooltip>
    </>
  );
};

export default AddressInfoTooltip;
