import { CheckCircledIcon, CheckIcon, ClockIcon } from "@radix-ui/react-icons";
import { Chip, Tooltip } from "src/components/atoms";
import { IStatus } from "src/consts";
import "./styles.scss";

type Props = {
  STATUS: IStatus;
  small?: boolean;
};

const StatusBadge = ({ STATUS, small = false }: Props) => {
  return (
    <div className="status-badge">
      {small ? (
        <>
          {STATUS === "EXTERNAL_TX" && <StatusExternalTxSmall />}
          {STATUS === "COMPLETED" && <StatusCompletedSmall />}
          {STATUS === "IN_PROGRESS" && <StatusInProgressSmall />}
          {STATUS === "PENDING_REDEEM" && <StatusPendingRedeemSmall />}
          {STATUS === "VAA_EMITTED" && <StatusVaaEmittedSmall />}
        </>
      ) : (
        <>
          {STATUS === "EXTERNAL_TX" && <StatusExternalTx />}
          {STATUS === "COMPLETED" && <StatusCompleted />}
          {STATUS === "IN_PROGRESS" && <StatusInProgress />}
          {STATUS === "PENDING_REDEEM" && <StatusPendingRedeem />}
          {STATUS === "VAA_EMITTED" && <StatusVaaEmitted />}
        </>
      )}
    </div>
  );
};

export default StatusBadge;

// ------

const StatusInProgressSmall = () => (
  <Tooltip side="top" type="onlyContent" tooltip={<StatusInProgress />}>
    <div className="status-badge-small progress">
      <ClockIcon height={20} width={20} />
    </div>
  </Tooltip>
);
const StatusVaaEmittedSmall = () => (
  <Tooltip side="top" type="onlyContent" tooltip={<StatusVaaEmitted />}>
    <div className="status-badge-small emitted">
      <CheckIcon height={20} width={20} />
    </div>
  </Tooltip>
);
const StatusExternalTxSmall = () => (
  <Tooltip side="top" type="onlyContent" tooltip={<StatusExternalTx />}>
    <div className="status-badge-small emitted">
      <CheckIcon height={20} width={20} />
    </div>
  </Tooltip>
);
const StatusPendingRedeemSmall = () => (
  <Tooltip side="top" type="onlyContent" tooltip={<StatusPendingRedeem />}>
    <div className="status-badge-small progress">
      <ClockIcon height={20} width={20} />
    </div>
  </Tooltip>
);
const StatusCompletedSmall = () => (
  <Tooltip side="top" type="onlyContent" tooltip={<StatusCompleted />}>
    <div className="status-badge-small completed">
      <CheckCircledIcon height={20} width={20} />
    </div>
  </Tooltip>
);

// ------

const StatusInProgress = () => (
  <Chip className="status-badge-status" color="progress">
    <ClockIcon height={16} width={16} />
    IN PROGRESS
  </Chip>
);
const StatusVaaEmitted = () => (
  <Chip className="status-badge-status" color="emitted">
    <CheckIcon height={16} width={16} />
    VAA EMITTED
  </Chip>
);
const StatusExternalTx = () => (
  <Chip className="status-badge-status" color="emitted">
    <CheckIcon height={16} width={16} />
    EXTERNAL TX
  </Chip>
);
const StatusPendingRedeem = () => (
  <Tooltip
    side="right"
    tooltip={
      <div className="status-badge-tooltip">
        Your transaction has been completed on the blockchain, but has not yet been redeemed.
      </div>
    }
    type="info"
  >
    <div>
      <Chip className="status-badge-status" color="progress">
        <ClockIcon height={16} width={16} />
        PENDING REDEEM
      </Chip>
    </div>
  </Tooltip>
);
const StatusCompleted = () => (
  <Chip className="status-badge-status" color="completed">
    <CheckCircledIcon height={16} width={16} />
    COMPLETED
  </Chip>
);
