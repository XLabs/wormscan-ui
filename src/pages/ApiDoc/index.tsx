import { useEffect, useState } from "react";
import SwaggerUI from "swagger-ui-react";
import { useEnvironment } from "src/context/EnvironmentContext";
import { BaseLayout } from "src/layouts/BaseLayout";
import { Loader } from "src/components/atoms";
import "./styles.scss";

const ApiDoc = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { environment } = useEnvironment();
  const currentNetwork = environment.network;
  const isMainnet = currentNetwork === "Mainnet";

  const url = isMainnet
    ? `${process.env.WORMSCAN_API_BASE_URL_ROOT}/swagger.json`
    : `${process.env.WORMSCAN_TESTNET_API_BASE_URL_ROOT}/swagger.json`;

  useEffect(() => {
    setIsLoading(true);
  }, [isMainnet]);

  return (
    <BaseLayout secondaryHeader>
      <div className="api-doc">
        {isLoading ? (
          <Loader />
        ) : (
          <div className="api-doc-top">
            <div className="api-doc-top-header">
              <div className="api-doc-top-header-title">
                Wormholescan API <span className="version">1.0</span>
              </div>
              <div className="api-doc-top-header-links">
                <a href={url} target="_blank" rel="noreferrer">
                  {url}
                </a>

                <a href="https://wormhole.com/" target="_blank" rel="noreferrer">
                  Terms of service
                </a>

                <a
                  href="http://www.apache.org/licenses/LICENSE-2.0.html"
                  target="_blank"
                  rel="noreferrer"
                >
                  Apache 2.0
                </a>

                <a
                  href="https://discord.com/invite/wormholecrypto"
                  target="_blank"
                  rel="noreferrer"
                >
                  API Support - Website
                </a>

                <a href="mailto:info@wormhole.com" target="_blank" rel="noreferrer">
                  Send email to API Support
                </a>
              </div>
            </div>

            <div className="api-doc-top-description">
              <p>
                Wormhole Guardian API. This is the API for the Wormhole Guardian and Explorer. The
                API has two namespaces: wormholescan and Guardian.
              </p>

              <ul>
                <li>
                  wormholescan is the namespace for the explorer and the new endpoints. The prefix
                  is /api/v1.
                </li>
                <li>
                  Guardian is the legacy namespace backguard compatible with guardian node API. The
                  prefix is /v1.
                </li>
              </ul>

              <p>
                This API is public and does not require authentication although some endpoints are
                rate limited. Check each endpoint documentation for more information.
              </p>
            </div>
          </div>
        )}

        <SwaggerUI
          key={url}
          url={url}
          onComplete={() => {
            setIsLoading(false);
          }}
        />
      </div>
    </BaseLayout>
  );
};

export default ApiDoc;
