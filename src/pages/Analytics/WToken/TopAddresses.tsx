import { GetTopAddressResult } from "src/api/native-token-transfer/types";
import { CopyIcon, UserIcon } from "src/icons/generic";
import { formatNumber } from "src/utils/number";
import { TruncateText } from "src/utils/string";
import { CopyToClipboard } from "src/components/molecules";

type TopAddressesProps = {
  topAddressesNotional: GetTopAddressResult;
  topAddressesTx: GetTopAddressResult;
};

const LOADING_ARRAY = Array(10).fill(1);

export const TopAddresses = ({ topAddressesNotional, topAddressesTx }: TopAddressesProps) => {
  return (
    <div className="top-addresses">
      <div className="top-addresses-half">
        <div className="top-addresses-half-title">
          <UserIcon />
          <div>Top Addresses by Transactions</div>
        </div>
        <div className="top-addresses-half-table">
          <div className="top-addresses-half-table-head">
            <div className="top-addresses-half-table-head-row">RANK</div>
            <div className="top-addresses-half-table-head-row">USER</div>
            <div className="top-addresses-half-table-head-row">TRANSFERS</div>
          </div>

          {topAddressesTx
            ? topAddressesTx?.map((item, idx) =>
                idx < 10 ? (
                  <div key={`itemTx-${idx}`} className="top-addresses-half-table-item">
                    <div className="top-addresses-half-table-item-row">{idx + 1}</div>
                    <div className="top-addresses-half-table-item-row">
                      <TruncateText containerWidth={250} text={item.fromAddress.toUpperCase()} />
                      <CopyToClipboard toCopy={item.fromAddress}>
                        <CopyIcon width={20} style={{ color: "grey" }} />
                      </CopyToClipboard>
                    </div>
                    <div className="top-addresses-half-table-item-row">
                      {formatNumber(+item.value, 0)}
                    </div>
                  </div>
                ) : null,
              )
            : LOADING_ARRAY.map((item, idx) => (
                <div key={`itemTx-${idx}`} className="top-addresses-half-table-item">
                  <div className="loading" />
                </div>
              ))}
        </div>
      </div>

      <div className="top-addresses-half">
        <div className="top-addresses-half-title">
          <UserIcon />
          <div>Top Addresses by Volume</div>
        </div>
        <div className="top-addresses-half-table">
          <div className="top-addresses-half-table-head">
            <div className="top-addresses-half-table-head-row">RANK</div>
            <div className="top-addresses-half-table-head-row">USER</div>
            <div className="top-addresses-half-table-head-row">VOLUME</div>
          </div>

          {topAddressesNotional
            ? topAddressesNotional?.map((item, idx) =>
                idx < 10 ? (
                  <div key={`itemNot-${idx}`} className="top-addresses-half-table-item">
                    <div className="top-addresses-half-table-item-row">{idx + 1}</div>

                    <div className="top-addresses-half-table-item-row">
                      <TruncateText containerWidth={250} text={item.fromAddress.toUpperCase()} />
                      <CopyToClipboard toCopy={item.fromAddress}>
                        <CopyIcon width={20} style={{ color: "grey" }} />
                      </CopyToClipboard>
                    </div>
                    <div className="top-addresses-half-table-item-row">
                      ${formatNumber(+item.value, 0)}
                    </div>
                  </div>
                ) : null,
              )
            : LOADING_ARRAY.map((item, idx) => (
                <div key={`itemNot-${idx}`} className="top-addresses-half-table-item">
                  <div className="loading" />
                </div>
              ))}
        </div>
      </div>
    </div>
  );
};
