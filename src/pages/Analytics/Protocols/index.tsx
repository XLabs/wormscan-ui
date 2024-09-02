import { ArrowUpRightIcon, Rectangle3DIcon } from "src/icons/generic";
import { NavLink } from "src/components/atoms";
import { ProtocolsStats, ProtocolsActivity } from "src/components/molecules";
import "./styles.scss";

const Protocols = () => {
  return (
    <div className="protocols-page">
      <ProtocolsStats />

      <div className="protocols-page-tool">
        <Rectangle3DIcon />

        <h3 className="protocols-page-tool-title">Do you want to add Protocol Tool?</h3>

        <h4 className="protocols-page-tool-description">
          The Wormhole Governor gives access to users adding their own protocols.
        </h4>

        <NavLink className="protocols-page-tool-btn" to="/developers/submit">
          Submit your Protocol Tool <ArrowUpRightIcon />
        </NavLink>
      </div>

      <ProtocolsActivity />
    </div>
  );
};

export default Protocols;
