import { CheckCircle2, ClockIcon, VAAEmittedIcon } from "src/icons/generic";
import { Chip, Tooltip } from "src/components/atoms";
import { BREAKPOINTS, IStatus } from "src/consts";
import { useWindowSize } from "src/utils/hooks";
import "./styles.scss";

type Props = {
  className?: string;
  size?: "normal" | "small" | "responsive";
  STATUS: IStatus;
};

const StatusBadge = ({ STATUS, className, size = "normal" }: Props) => {
  const { width } = useWindowSize();
  const isDesktop = width >= BREAKPOINTS.desktop;

  return (
    <div className={`status-badge ${className ?? ""}`}>
      {size === "small" || (size === "responsive" && isDesktop) ? (
        <>
          {STATUS === "EXTERNAL_TX" && <StatusExternalTxSmall />}
          {STATUS === "COMPLETED" && <StatusCompletedSmall />}
          {STATUS === "IN_PROGRESS" && <StatusInProgressSmall />}
          {STATUS === "IN_GOVERNORS" && <StatusInGovernorsSmall />}
          {STATUS === "PENDING_REDEEM" && <StatusPendingRedeemSmall />}
          {STATUS === "VAA_EMITTED" && <StatusVaaEmittedSmall />}
        </>
      ) : (
        <>
          {STATUS === "EXTERNAL_TX" && <StatusExternalTx />}
          {STATUS === "COMPLETED" && <StatusCompleted />}
          {STATUS === "IN_PROGRESS" && <StatusInProgress />}
          {STATUS === "IN_GOVERNORS" && <StatusInGovernors />}
          {STATUS === "PENDING_REDEEM" && <StatusPendingRedeem />}
          {STATUS === "VAA_EMITTED" && <StatusVaaEmitted />}
        </>
      )}
    </div>
  );
};

export default StatusBadge;

// ------

const StatusInGovernorsSmall = () => (
  <Tooltip side="top" type="onlyContent" tooltip={<StatusInGovernors />}>
    <div className="status-badge-small progress">
      <ClockIcon width={24} />
    </div>
  </Tooltip>
);
const StatusInProgressSmall = () => (
  <Tooltip side="top" type="onlyContent" tooltip={<StatusInProgress />}>
    <div className="status-badge-small progress">
      <ClockIcon width={24} />
    </div>
  </Tooltip>
);
const StatusVaaEmittedSmall = () => (
  <Tooltip side="top" type="onlyContent" tooltip={<StatusVaaEmitted />}>
    <div className="status-badge-small emitted">
      <VAAEmittedIcon width={24} />
    </div>
  </Tooltip>
);
const StatusExternalTxSmall = () => (
  <Tooltip side="top" type="onlyContent" tooltip={<StatusExternalTx />}>
    <div className="status-badge-small emitted">
      <VAAEmittedIcon width={24} />
    </div>
  </Tooltip>
);
const StatusPendingRedeemSmall = () => (
  <Tooltip side="top" type="onlyContent" tooltip={<StatusPendingRedeem />}>
    <div className="status-badge-small progress">
      <ClockIcon width={24} />
    </div>
  </Tooltip>
);
const StatusCompletedSmall = () => (
  <Tooltip side="top" type="onlyContent" tooltip={<StatusCompleted />}>
    <div className="status-badge-small completed">
      <CheckCircle2 width={24} />
    </div>
  </Tooltip>
);

// ------

const StatusInGovernors = () => (
  <Chip className="status-badge-status" color="progress">
    <ClockIcon width={24} />
    <p>In governor</p>
  </Chip>
);
const StatusInProgress = () => (
  <Chip className="status-badge-status" color="progress">
    <ClockIcon width={24} />
    <p>In progress</p>
  </Chip>
);
const StatusVaaEmitted = () => (
  <Chip className="status-badge-status" color="emitted">
    <VAAEmittedIcon width={24} />
    <p>VAA emitted</p>
  </Chip>
);
const StatusExternalTx = () => (
  <Chip className="status-badge-status" color="emitted">
    <VAAEmittedIcon width={24} />
    <p>External Tx</p>
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
        <ClockIcon width={24} />
        <p>Pending redeem</p>
      </Chip>
    </div>
  </Tooltip>
);
const StatusCompleted = () => (
  <Chip className="status-badge-status" color="completed">
    <CheckCircle2 width={24} />
    <p>Completed</p>
  </Chip>
);
