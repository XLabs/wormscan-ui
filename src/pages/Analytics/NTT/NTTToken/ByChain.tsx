import { GetActivityResult } from "src/api/native-token-transfer/types";
import { ArrowRightIcon, GlobeIcon } from "src/icons/generic";
import { chainIdToChain } from "@wormhole-foundation/sdk";
import { BlockchainIcon } from "src/components/atoms";
import { useEnvironment } from "src/context/EnvironmentContext";
import { formatNumber } from "src/utils/number";

type ByChainProps = {
  activityNotional: GetActivityResult;
  activityTx: GetActivityResult;
  isErrorActivityNotional: boolean;
  isErrorActivityTx: boolean;
  isLoadingActivityNotional: boolean;
  isLoadingActivityTx: boolean;
};

const LOADING_ARRAY = Array(10).fill(1);

export const ByChain = ({
  activityNotional,
  activityTx,
  isErrorActivityNotional,
  isErrorActivityTx,
  isLoadingActivityNotional,
  isLoadingActivityTx,
}: ByChainProps) => {
  const { environment } = useEnvironment();

  return (
    <div className="bychain">
      <div className="bychain-half">
        <div className="bychain-half-title">
          <GlobeIcon />
          <div>
            Transfers by Chain <span>(All Time)</span>
          </div>
        </div>
        <div className="bychain-half-table">
          <div className="bychain-half-table-head">
            <div className="bychain-half-table-head-row">SOURCE CHAIN</div>
            <div className="bychain-half-table-head-row">TARGET CHAIN</div>
            <div className="bychain-half-table-head-row">
              <span className="mobile">TXN COUNT</span>
              <span className="desktop">TRANSFER COUNT</span>
            </div>
          </div>

          {isErrorActivityTx ? (
            <div className="bychain-half-table-error">Failed to get top transfers</div>
          ) : isLoadingActivityTx ? (
            LOADING_ARRAY.map((item, idx) => (
              <div key={`itemTx-${idx}`} className="bychain-half-table-item">
                <div className="loading" />
              </div>
            ))
          ) : (
            activityTx &&
            activityTx?.map((item, idx) =>
              idx < 10 ? (
                <div key={`itemTx-${idx}`} className="bychain-half-table-item">
                  <div className="bychain-half-table-item-row">
                    <BlockchainIcon network={environment.network} chainId={item.emitterChain} />
                    {chainIdToChain(item.emitterChain)}
                    <div className="arrow">
                      <ArrowRightIcon />
                    </div>
                  </div>
                  <div className="bychain-half-table-item-row">
                    <BlockchainIcon network={environment.network} chainId={item.destinationChain} />
                    {chainIdToChain(item.destinationChain)}
                  </div>
                  <div className="bychain-half-table-item-row">{formatNumber(+item.value, 0)}</div>
                </div>
              ) : null,
            )
          )}
        </div>
      </div>

      <div className="bychain-half">
        <div className="bychain-half-title">
          <GlobeIcon />
          <div>
            Volume by Chain <span>(All Time)</span>
          </div>
        </div>
        <div className="bychain-half-table">
          <div className="bychain-half-table-head">
            <div className="bychain-half-table-head-row">SOURCE CHAIN</div>
            <div className="bychain-half-table-head-row">TARGET CHAIN</div>
            <div className="bychain-half-table-head-row">TOTAL VOLUME</div>
          </div>

          {isErrorActivityNotional ? (
            <div className="bychain-half-table-error">Failed to get top transfers</div>
          ) : isLoadingActivityNotional ? (
            LOADING_ARRAY.map((item, idx) => (
              <div key={`itemNot-${idx}`} className="bychain-half-table-item">
                <div className="loading" />
              </div>
            ))
          ) : (
            activityNotional &&
            activityNotional?.map((item, idx) =>
              idx < 10 ? (
                <div key={`itemNot-${idx}`} className="bychain-half-table-item">
                  <div className="bychain-half-table-item-row">
                    <BlockchainIcon network={environment.network} chainId={item.emitterChain} />
                    {chainIdToChain(item.emitterChain)}
                    <div className="arrow">
                      <ArrowRightIcon />
                    </div>
                  </div>
                  <div className="bychain-half-table-item-row">
                    <BlockchainIcon network={environment.network} chainId={item.destinationChain} />
                    {chainIdToChain(item.destinationChain)}
                  </div>
                  <div className="bychain-half-table-item-row">${formatNumber(+item.value)}</div>
                </div>
              ) : null,
            )
          )}
        </div>
      </div>
    </div>
  );
};
