import React, { SVGProps } from "react";

const SvgrMock = React.forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>((props, ref) => (
  <svg ref={ref} {...props} />
));
SvgrMock.displayName = "svg";

export default SvgrMock;

export const ReactComponent = SvgrMock;
