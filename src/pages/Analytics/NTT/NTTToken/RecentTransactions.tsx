import { GetOperationsOutput } from "src/api/guardian-network/types";
import { SwapVerticalIcon, CopyIcon } from "src/icons/generic";
import { CopyToClipboard, StatusBadge } from "src/components/molecules";
import { timeAgo } from "src/utils/date";
import { useEnvironment } from "src/context/EnvironmentContext";
import { getExplorerLink } from "src/utils/wormhole";
import { useNavigateCustom, useWindowSize } from "src/utils/hooks";
import { BlockchainIcon, Tooltip, NavLink } from "src/components/atoms";
import { shortAddress, parseTx } from "src/utils/crypto";
import { ChainId, chainIdToChain } from "@wormhole-foundation/sdk";
import { formatNumber } from "src/utils/number";
import { BREAKPOINTS, NTT_APP_ID } from "src/consts";

interface IRecentTransactionsProps {
  isError: boolean;
  isLoading: boolean;
  recentTransactions: GetOperationsOutput[];
  tokenIcon: string;
}

const LOADING_ARRAY = Array(7).fill(1);

export const RecentTransactions = ({
  isError,
  isLoading,
  recentTransactions,
  tokenIcon,
}: IRecentTransactionsProps) => {
  const navigate = useNavigateCustom();
  const { environment } = useEnvironment();
  const { width } = useWindowSize();
  const isDesktopDesign = width >= BREAKPOINTS.desktop;

  const stopPropagation = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation();
  };

  const renderAddress = (data: GetOperationsOutput, isFrom: boolean) => {
    const chainId = isFrom
      ? data.sourceChain?.chainId
      : data.content?.standarizedProperties?.toChain;
    const address = isFrom
      ? data.sourceChain?.from
      : data.content?.standarizedProperties?.toAddress;

    if (!chainId || !address) return null;

    return (
      <div className="link-container">
        <Tooltip tooltip={<div>{chainIdToChain(chainId)}</div>} maxWidth={false} type="info">
          <div>
            <BlockchainIcon chainId={chainId} network={environment.network} />
          </div>
        </Tooltip>
        <a
          href={getExplorerLink({
            network: environment.network,
            chainId,
            value: address,
            base: "address",
            isNativeAddress: true,
          })}
          target="_blank"
          rel="noopener noreferrer"
          onClick={stopPropagation}
        >
          {shortAddress(address).toUpperCase()}
        </a>
        <CopyToClipboard toCopy={address}>
          <CopyIcon />
        </CopyToClipboard>
      </div>
    );
  };

  if (isError) return null;

  return (
    <div className="recent-transactions">
      <div className="recent-transactions-title">
        <SwapVerticalIcon />
        <div>Recent Transactions</div>
        <a href={`#/txs?appId=${NTT_APP_ID}`}>View All</a>
      </div>

      {isDesktopDesign ? (
        <div className="recent-transactions-table">
          <div className="recent-transactions-table-head">
            <div className="recent-transactions-table-head-row">STATUS</div>
            <div className="recent-transactions-table-head-row">TX HASH</div>
            <div className="recent-transactions-table-head-row">FROM</div>
            <div className="recent-transactions-table-head-row">TO</div>
            <div className="recent-transactions-table-head-row">AMOUNT</div>
            <div className="recent-transactions-table-head-row">TIME</div>
          </div>

          {isLoading ? (
            <div className="recent-transactions-table-loading">
              {LOADING_ARRAY.map((_, index) => (
                <div key={index} className="loading" />
              ))}
            </div>
          ) : recentTransactions?.length === 0 ? (
            <div className="recent-transactions-table-empty">No transactions found</div>
          ) : (
            recentTransactions?.map(data => (
              <div
                key={data.id}
                className="recent-transactions-table-item"
                onClick={() =>
                  data?.sourceChain?.transaction?.txHash
                    ? navigate(
                        `/tx/${parseTx({
                          value: data.sourceChain.transaction.txHash,
                          chainId: data.sourceChain?.chainId as ChainId,
                        })}`,
                      )
                    : null
                }
              >
                <div className="recent-transactions-table-item-row">
                  <StatusBadge size="responsive" status={data.status} />
                </div>
                <div className="recent-transactions-table-item-row">
                  <div className="link-container">
                    {data?.sourceChain?.transaction?.txHash && (
                      <>
                        <NavLink
                          to={`/tx/${parseTx({
                            value: data.sourceChain.transaction.txHash,
                            chainId: data.sourceChain?.chainId as ChainId,
                          })}`}
                          onClick={stopPropagation}
                        >
                          {shortAddress(data.sourceChain.transaction.txHash).toUpperCase()}
                        </NavLink>
                        <CopyToClipboard toCopy={data.sourceChain.transaction.txHash}>
                          <CopyIcon />
                        </CopyToClipboard>
                      </>
                    )}
                  </div>
                </div>
                <div className="recent-transactions-table-item-row">
                  {renderAddress(data, true)}
                </div>
                <div className="recent-transactions-table-item-row">
                  {renderAddress(data, false)}
                </div>
                <div className="recent-transactions-table-item-row">
                  <div className="token-row">
                    <span>
                      {formatNumber(
                        data?.data?.tokenAmount
                          ? +data?.data?.tokenAmount
                          : +data?.content?.payload?.parsedPayload?.nttMessage?.trimmedAmount
                              ?.amount / 1000000 ||
                              +data?.content?.payload?.nttMessage?.trimmedAmount?.amount / 1000000,
                      )}
                    </span>
                    <img
                      src={tokenIcon}
                      alt={`${data?.data?.symbol} Token`}
                      width="16"
                      height="16"
                    />
                    {data?.data?.usdAmount && (
                      <span className="usd">(${formatNumber(+data?.data?.usdAmount, 2)})</span>
                    )}
                  </div>
                </div>
                <div className="recent-transactions-table-item-row">
                  {data?.sourceChain?.timestamp && timeAgo(new Date(data?.sourceChain?.timestamp))}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="recent-transactions-mobile">
          {isLoading ? (
            <div className="recent-transactions-table-loading">
              {LOADING_ARRAY.map((_, index) => (
                <div key={index} className="loading" />
              ))}
            </div>
          ) : recentTransactions?.length === 0 ? (
            <div className="recent-transactions-table-empty">No transactions found</div>
          ) : (
            recentTransactions?.map(data => (
              <div key={data.id} className="recent-transactions-mobile-container">
                <div className="recent-transactions-mobile-item">
                  <div className="title">
                    <StatusBadge size="responsive" status={data.status} />
                  </div>
                  <div className="content">
                    <div className="time">
                      {data?.sourceChain?.timestamp &&
                        timeAgo(new Date(data?.sourceChain?.timestamp))}
                    </div>
                  </div>
                </div>
                <div className="recent-transactions-mobile-item">
                  <div className="title">TX HASH</div>
                  <div className="content">
                    <div className="link-container">
                      {data?.sourceChain?.transaction?.txHash && (
                        <>
                          <NavLink
                            to={`/tx/${parseTx({
                              value: data.sourceChain.transaction.txHash,
                              chainId: data.sourceChain?.chainId as ChainId,
                            })}`}
                            onClick={stopPropagation}
                          >
                            {shortAddress(data.sourceChain.transaction.txHash).toUpperCase()}
                          </NavLink>
                          <CopyToClipboard toCopy={data.sourceChain.transaction.txHash}>
                            <CopyIcon />
                          </CopyToClipboard>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="recent-transactions-mobile-item">
                  <div className="title">FROM</div>
                  <div className="content">{renderAddress(data, true)}</div>
                </div>
                <div className="recent-transactions-mobile-item">
                  <div className="title">TO</div>
                  <div className="content">{renderAddress(data, false)}</div>
                </div>
                <div className="recent-transactions-mobile-item">
                  <div className="title">AMOUNT</div>
                  <div className="content">
                    <div className="token-row">
                      <span>
                        {formatNumber(
                          data?.data?.tokenAmount
                            ? +data?.data?.tokenAmount
                            : +data?.content?.payload?.parsedPayload?.nttMessage?.trimmedAmount
                                ?.amount / 1000000 ||
                                +data?.content?.payload?.nttMessage?.trimmedAmount?.amount /
                                  1000000,
                        )}
                      </span>
                      <img
                        src={tokenIcon}
                        alt={`${data?.data?.symbol} Token`}
                        width="16"
                        height="16"
                      />
                      {data?.data?.usdAmount && (
                        <span className="usd">(${formatNumber(+data?.data?.usdAmount, 2)})</span>
                      )}
                    </div>
                  </div>
                </div>
                {data?.sourceChain?.transaction?.txHash && (
                  <div className="recent-transactions-mobile-item">
                    <NavLink
                      className="recent-transactions-mobile-item-btn"
                      to={`/tx/${parseTx({
                        value: data.sourceChain.transaction.txHash,
                        chainId: data.sourceChain?.chainId as ChainId,
                      })}`}
                      onClick={stopPropagation}
                    >
                      View details
                    </NavLink>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
