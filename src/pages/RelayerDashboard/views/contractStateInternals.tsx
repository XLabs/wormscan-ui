import LogViewer from "../components/logViewer";
import DeliveryStatus from "../components/DeliveryStatus";

export default function ContractStateView() {
  //TODO chain selector
  //TODO load button
  //TODO call contract state loader on button press
  //TODO display contract state
  //TODO dump contract state into persisted logger object

  return (
    <div style={{ padding: "10px", margin: "10px" }}>
      <div style={{ height: "10px" }} />
      <DeliveryStatus />
      <div style={{ height: "10px" }} />
      <LogViewer />
    </div>
  );
}
