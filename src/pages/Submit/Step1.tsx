import { ChainId, chainIdToChain, Network } from "@wormhole-foundation/sdk";
import { BlockchainIcon, Select, Tooltip } from "src/components/atoms";
import { useEnvironment } from "src/context/EnvironmentContext";
import { ChainFilterMainnet, ChainFilterTestnet } from "src/utils/filterUtils";
import { getChainName } from "src/utils/wormhole";
import { IIdentifier, NETWORK_LIST } from ".";
import { toast } from "react-toastify";
import { CheckIcon, CrossIcon, EditIcon, TrashIcon } from "src/icons/generic";
import { Fragment, useState } from "react";

interface Step1Props {
  selectedAddress: string;
  selectedChain: any;
  selectedIdentifiers: IIdentifier[];
  selectedNetwork: { label: Network; value: Network };
  setSelectedAddress: any;
  setSelectedChain: (val: any) => void;
  setSelectedIdentifiers: any;
  setSelectedNetwork: any;
  setStep: (n: number) => void;
}

const orderedChains = {
  Mainnet: ChainFilterMainnet as ChainId[],
  Testnet: ChainFilterTestnet as ChainId[],
  Devnet: [] as ChainId[],
};

export const Step1 = ({
  selectedAddress,
  selectedChain,
  selectedIdentifiers,
  selectedNetwork,
  setSelectedAddress,
  setSelectedChain,
  setSelectedIdentifiers,
  setSelectedNetwork,
  setStep,
}: Step1Props) => {
  const { environment } = useEnvironment();

  const CHAIN_LIST = (network: Network) =>
    orderedChains[network].map(chainId => ({
      icon: (
        <BlockchainIcon
          background="var(--color-white-10)"
          chainId={chainId}
          colorless
          lazy={false}
          network={environment.network}
          size={24}
        />
      ),
      label: getChainName({ network: environment.network, chainId }),
      value: String(chainId),
    }));

  const [editing, setEditing] = useState(0);

  const Adding = ({ isEditing = false, idx }: { isEditing?: boolean; idx?: number }) => {
    const [newIdentifiers, setNewIdentifiers] = useState(
      isEditing
        ? {
            selectedNetwork: selectedIdentifiers[idx].network,
            selectedChain: selectedIdentifiers[idx].chain,
            selectedAddress: selectedIdentifiers[idx].address,
          }
        : null,
    );

    return (
      <Fragment key={idx}>
        <div className="parse-submit-step1">
          <div className="parse-submit-step1-option1">
            {!isEditing && <div className="parse-submit-label">Select Network</div>}
            <Select
              ariaLabel="Select Network"
              items={NETWORK_LIST}
              isMulti={false}
              name="submitNetwork"
              onValueChange={value => {
                if (isEditing) {
                  setNewIdentifiers({
                    selectedAddress: newIdentifiers.selectedAddress,
                    selectedChain: null,
                    selectedNetwork: value.value,
                  });
                } else {
                  setSelectedChain(null);
                  setSelectedNetwork(value);
                }
              }}
              placeholder="Network"
              optionStyles={{ padding: 16 }}
              text={
                <div className="filters-container-select-text">
                  {selectedNetwork?.label || "Network"}
                </div>
              }
              value={
                isEditing
                  ? {
                      label: newIdentifiers.selectedNetwork,
                      value: newIdentifiers.selectedNetwork,
                    }
                  : selectedNetwork
              }
              closeOnSelect
              controlStyles={{ width: "100%" }}
              className="select"
            />
          </div>

          <div className="parse-submit-step1-option2">
            {!isEditing && <div className="parse-submit-label">Select Chain</div>}

            <Select
              ariaLabel="Select Chain"
              items={CHAIN_LIST(isEditing ? newIdentifiers.selectedNetwork : selectedNetwork.value)}
              isMulti={false}
              name="submitEmitterOrTarget"
              onValueChange={(value: any) => {
                if (isEditing) {
                  setNewIdentifiers({
                    selectedAddress: newIdentifiers.selectedAddress,
                    selectedChain: value.value,
                    selectedNetwork: newIdentifiers.selectedNetwork,
                  });
                } else {
                  setSelectedChain(value);
                }
              }}
              optionStyles={{ padding: 16 }}
              text={
                <div className="filters-container-select-text">
                  {isEditing ? (
                    <>
                      {newIdentifiers.selectedChain ? (
                        <>
                          <BlockchainIcon
                            background="var(--color-white-10)"
                            chainId={newIdentifiers.selectedChain}
                            colorless
                            lazy={false}
                            network={newIdentifiers.selectedNetwork}
                            size={24}
                          />
                          {chainIdToChain(newIdentifiers.selectedChain)}
                        </>
                      ) : (
                        "Chain"
                      )}
                    </>
                  ) : (
                    <>
                      {selectedChain && selectedChain?.icon}
                      {selectedChain ? selectedChain?.label : "Chain"}
                    </>
                  )}
                </div>
              }
              type="searchable"
              value={isEditing ? newIdentifiers.selectedChain : selectedChain}
              closeOnSelect
              buttonStyles={{
                width: "100%",
              }}
              className="select"
            />
          </div>

          <div className="parse-submit-step1-option3">
            {!isEditing && <div className="parse-submit-label">Enter the contract address</div>}
            <input
              className="parse-submit-input"
              placeholder="Address"
              value={isEditing ? newIdentifiers.selectedAddress : selectedAddress}
              onChange={e => {
                if (isEditing) {
                  setNewIdentifiers({
                    selectedAddress: e.target.value,
                    selectedChain: newIdentifiers.selectedChain,
                    selectedNetwork: newIdentifiers.selectedNetwork,
                  });
                } else {
                  setSelectedAddress(e.target.value);
                }
              }}
            />
          </div>

          <div className="parse-submit-step1-option4">
            {isEditing ? (
              <div className="parse-submit-step1-editing">
                <Tooltip tooltip={<div>Cancel</div>} maxWidth={false} type="info">
                  <div
                    className="parse-submit-identifiers-4-icon"
                    onClick={() => {
                      setEditing(0);
                    }}
                  >
                    <CrossIcon />
                  </div>
                </Tooltip>
                <Tooltip tooltip={<div>Save</div>} maxWidth={false} type="info">
                  <div
                    className="parse-submit-identifiers-4-icon green"
                    onClick={() => {
                      if (
                        newIdentifiers.selectedAddress &&
                        newIdentifiers.selectedChain &&
                        newIdentifiers.selectedNetwork
                      ) {
                        setSelectedIdentifiers([
                          ...selectedIdentifiers.slice(0, idx),
                          {
                            network: newIdentifiers.selectedNetwork,
                            chain: newIdentifiers.selectedChain,
                            address: newIdentifiers.selectedAddress,
                          },
                          ...selectedIdentifiers.slice(idx + 1),
                        ]);
                        setEditing(0);
                      } else {
                        toast("Missing some info", {
                          type: "error",
                          theme: "dark",
                        });
                      }
                    }}
                  >
                    <CheckIcon />
                  </div>
                </Tooltip>
              </div>
            ) : (
              <div
                className="parse-submit-step1-option4-btn"
                onClick={() => {
                  if (selectedAddress && selectedChain && selectedNetwork) {
                    setSelectedIdentifiers([
                      ...selectedIdentifiers,
                      {
                        network: selectedNetwork.value,
                        chain: selectedChain.value,
                        address: selectedAddress,
                      },
                    ]);

                    setSelectedChain(null);
                    setSelectedAddress("");
                  } else {
                    toast("Missing some info", {
                      type: "error",
                      theme: "dark",
                    });
                  }
                }}
              >
                Add
              </div>
            )}
          </div>
        </div>

        {isEditing && <div className="parse-submit-line" />}
      </Fragment>
    );
  };

  return (
    <>
      <div className="parse-submit">
        <div className="parse-submit-progress">
          <div className={"parse-submit-progress-line active"} />
          <div className={"parse-submit-progress-line"} />
          <div className={"parse-submit-progress-line"} />
          <div className={"parse-submit-progress-line"} />
        </div>

        <div className="parse-submit-step">STEP 01</div>
        <div className="parse-submit-title">How can we identify your protocol?</div>

        <Adding />

        {selectedIdentifiers.map((identifier, idx) => {
          if (idx + 1 === editing)
            return (
              <Fragment key={idx}>
                {idx === 0 && <div className="parse-submit-protocols">Protocols</div>}

                <Adding isEditing={!!editing} idx={idx} />
              </Fragment>
            );

          return (
            <Fragment key={idx}>
              {idx === 0 && <div className="parse-submit-protocols">Protocols</div>}

              <div className="parse-submit-identifiers">
                <div className="parse-submit-identifiers-1">{identifier.network}</div>

                <div className="parse-submit-identifiers-2">
                  <BlockchainIcon chainId={identifier.chain} network={identifier.network} />
                  {chainIdToChain(identifier.chain)}
                </div>

                <div className="parse-submit-identifiers-3">{identifier.address}</div>

                <div className="parse-submit-identifiers-4">
                  <Tooltip tooltip={<div>Edit</div>} maxWidth={false} type="info">
                    <div
                      className="parse-submit-identifiers-4-icon"
                      onClick={() => setEditing(idx + 1)}
                    >
                      <EditIcon width={20} />
                    </div>
                  </Tooltip>

                  <Tooltip tooltip={<div>Delete</div>} maxWidth={false} type="info">
                    <div
                      className="parse-submit-identifiers-4-icon red"
                      onClick={() => {
                        const newIdentifiers = [...selectedIdentifiers];
                        newIdentifiers.splice(idx, 1);

                        setSelectedIdentifiers(newIdentifiers);
                      }}
                    >
                      <TrashIcon width={20} />
                    </div>
                  </Tooltip>
                </div>
              </div>
            </Fragment>
          );
        })}

        {!selectedIdentifiers.length && <div className="parse-submit-line margin" />}

        <div className="parse-submit-next">
          <div
            onClick={() => {
              if (!!selectedIdentifiers.length) {
                setStep(2);
                window.scrollTo(0, 0);
              }
            }}
            className={`parse-submit-btn ${!selectedIdentifiers.length ? "disabled" : ""}`}
          >
            Next step
          </div>
        </div>
      </div>
    </>
  );
};
