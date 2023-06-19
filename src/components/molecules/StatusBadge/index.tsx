import { CheckCircledIcon, ClockIcon, ExclamationTriangleIcon } from "@radix-ui/react-icons";
import Chip from "src/components/atoms/Chip";
import { colorStatus } from "src/consts";
import { TxStatus } from "src/types";
import "./styles.scss";

type Props = {
  status: TxStatus;
};

const StatusBadge = ({ status }: Props) => {
  const parsedStatus: string = String(status).toUpperCase();
  const icon =
    parsedStatus === "COMPLETED" ? (
      <CheckCircledIcon />
    ) : parsedStatus === "ONGOING" ? (
      <ClockIcon />
    ) : (
      <ExclamationTriangleIcon />
    );

  return (
    <Chip color={colorStatus[parsedStatus]} className="status-badge">
      {icon} {parsedStatus}
    </Chip>
  );
};

export default StatusBadge;
