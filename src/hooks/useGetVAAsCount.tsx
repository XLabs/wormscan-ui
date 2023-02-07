import { useQuery } from "react-query";
import { wormScanClient } from "src/App";

const useGetVAAsCount = () => {
  return useQuery("vaaCount", () => wormScanClient.getVAAsCount());
};

export default useGetVAAsCount;
