import { GetTopHolderResult } from "src/api/native-token-transfer/types";
import { CopyIcon, UserIcon, LinkIcon } from "src/icons/generic";
import { formatNumber } from "src/utils/number";
import { TruncateText } from "src/utils/string";
import { CopyToClipboard } from "src/components/molecules";
import { BlockchainIcon } from "src/components/atoms";
import { useEnvironment } from "src/context/EnvironmentContext";
import { chainIdToChain } from "@wormhole-foundation/sdk";
import { getExplorerLink } from "src/utils/wormhole";
import { useWindowSize } from "src/utils/hooks";

type TopHoldersProps = {
  isError: boolean;
  isLoading: boolean;
  topHolders: GetTopHolderResult;
};

const LOADING_ARRAY = Array(10).fill(1);

export const TopHolders = ({ isError, isLoading, topHolders }: TopHoldersProps) => {
  const { environment } = useEnvironment();
  const { width } = useWindowSize();

  const isDesktopDesign = width >= 1280;

  return (
    <div className="top-holders">
      <div className="top-holders-title">
        <UserIcon />
        <div>
          Top Holders by Volume <span>(All Time)</span>
        </div>
      </div>

      {isDesktopDesign && (
        <div className="top-holders-table">
          <div className="top-holders-table-head">
            <div className="top-holders-table-head-row">RANK</div>
            <div className="top-holders-table-head-row">USER</div>
            <div className="top-holders-table-head-row">CHAIN</div>
            <div className="top-holders-table-head-row">AMOUNT</div>
            <div className="top-holders-table-head-row"></div>
          </div>

          {isError ? (
            <div className="top-holders-table-error">Failed to get top holders</div>
          ) : isLoading ? (
            LOADING_ARRAY.map((_, idx) => (
              <div key={`loading-${idx}`} className="top-holders-table-item">
                <div className="loading" />
              </div>
            ))
          ) : topHolders ? (
            topHolders.map((item, idx) => (
              <div key={`item-${idx}`} className="top-holders-table-item">
                <div className="top-holders-table-item-row">{idx + 1}</div>

                <div className="top-holders-table-item-row">
                  <TruncateText containerWidth={150} text={item.address.toUpperCase()} />
                  <CopyToClipboard toCopy={item.address}>
                    <CopyIcon style={{ color: "grey" }} />
                  </CopyToClipboard>
                </div>

                <div className="top-holders-table-item-row">
                  <BlockchainIcon chainId={item.chain} network={environment.network} />
                  <div>{chainIdToChain(item.chain)}</div>
                </div>

                <div className="top-holders-table-item-row">${formatNumber(+item.volume, 0)}</div>

                <a
                  className="top-holders-table-item-row"
                  href={getExplorerLink({
                    network: environment.network,
                    chainId: item.chain,
                    value: item.address,
                    base: "address",
                    isNativeAddress: true,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on Explorer <LinkIcon />
                </a>
              </div>
            ))
          ) : (
            <div className="top-addresses-half-table-error">Holders not found</div>
          )}
        </div>
      )}

      {!isDesktopDesign && (
        <div className="top-holders-mobile">
          {isError ? (
            <div className="top-holders-table-error">Failed to get top holders</div>
          ) : isLoading ? (
            LOADING_ARRAY.map((_, idx) => (
              <div key={`loading-${idx}`} className="top-holders-table-item">
                <div className="loading" />
              </div>
            ))
          ) : topHolders ? (
            topHolders.map((item, idx) => (
              <div key={`item-${idx}`} className="top-holders-mobile-container">
                <div className="top-holders-mobile-container-item">
                  <div className="title">USER</div>
                  <div className="content user">
                    <TruncateText containerWidth={150} text={item.address.toUpperCase()} />
                    <CopyToClipboard toCopy={item.address}>
                      <CopyIcon style={{ color: "grey" }} />
                    </CopyToClipboard>
                  </div>
                </div>

                <div className="top-holders-mobile-container-item">
                  <div className="title">AMOUNT</div>
                  <div className="content number">${formatNumber(+item.volume, 0)}</div>
                </div>

                <div className="top-holders-mobile-container-item">
                  <div className="title">CHAIN</div>
                  <div className="content chain">
                    <BlockchainIcon chainId={item.chain} network={environment.network} />
                    <div>{chainIdToChain(item.chain)}</div>
                  </div>
                </div>

                <div className="top-holders-mobile-container-item">
                  <div className="title">HYPERLINK</div>
                  <a
                    className="content url"
                    href={getExplorerLink({
                      network: environment.network,
                      chainId: item.chain,
                      value: item.address,
                      base: "address",
                      isNativeAddress: true,
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on Explorer <LinkIcon />
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div className="top-addresses-half-table-error">Holders not found</div>
          )}
        </div>
      )}
    </div>
  );
};
