import { CheckCircledIcon, CheckIcon, ClockIcon } from "@radix-ui/react-icons";
import { Chip, Tooltip } from "src/components/atoms";
import { IStatus } from "src/consts";
import "./styles.scss";

type Props = {
  STATUS: IStatus;
};

const StatusBadge = ({ STATUS }: Props) => {
  return (
    <div className="status-badge">
      {STATUS === "EXTERNAL_TX" && <StatusExternalTx />}
      {STATUS === "COMPLETED" && <StatusCompleted />}
      {STATUS === "IN_PROGRESS" && <StatusInProgress />}
      {STATUS === "PENDING_REDEEM" && <StatusPendingRedeem />}
      {STATUS === "VAA_EMITTED" && <StatusVaaEmitted />}
    </div>
  );
};

export default StatusBadge;

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
