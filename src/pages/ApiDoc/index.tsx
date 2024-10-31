import { useEffect, useState } from "react";
import SwaggerUI from "swagger-ui-react";
import { useEnvironment } from "src/context/EnvironmentContext";
import { BaseLayout } from "src/layouts/BaseLayout";
import { Loader } from "src/components/atoms";
import "./styles.scss";

const replacePathParams = (data: { paths: { [key: string]: any } }) => {
  const newPaths: { [key: string]: any } = {};
  for (const path in data.paths) {
    // Replace ':param' with '{param}'
    const updatedPath = path.replace(/:([a-zA-Z_]+)/g, "{$1}");
    newPaths[updatedPath] = data.paths[path];
  }
  data.paths = newPaths;
  return data;
};

const ApiDoc = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [swaggerSpec, setSwaggerSpec] = useState(null);
  const { environment } = useEnvironment();
  const currentNetwork = environment.network;
  const isMainnet = currentNetwork === "Mainnet";

  const url = isMainnet
    ? `${process.env.WORMSCAN_API_BASE_URL_ROOT}/swagger.json`
    : `${process.env.WORMSCAN_TESTNET_API_BASE_URL_ROOT}/swagger.json`;

  // TODO: when the endpoint works fine, remove the following code
  const host = isMainnet
    ? process.env.WORMSCAN_API_BASE_URL_ROOT?.replace(/^https?:\/\//, "")
    : process.env.WORMSCAN_TESTNET_API_BASE_URL_ROOT?.replace(/^https?:\/\//, "");

  useEffect(() => {
    const fetchSwaggerSpec = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(url);
        let data = await response.json();

        data = replacePathParams(data);

        data = {
          ...data,
          host: host,
          schemes: ["https"],
          paths: {
            ...data.paths,
            "/api/v1/tokens-symbol-volume": {
              get: {
                description: "Get symbols with the highest volumes of all time.",
                tags: ["wormholescan"],
                operationId: "tokens-symbol-volume",
                parameters: [
                  {
                    type: "number",
                    description: "Limit, default is 10.",
                    name: "limit",
                    in: "query",
                    required: false,
                  },
                ],
                responses: {
                  "200": {
                    description: "OK",
                  },
                  "400": {
                    description: "Bad Request",
                  },
                  "500": {
                    description: "Internal Server Error",
                  },
                },
              },
            },
            "/api/v1/tokens-symbol-activity": {
              get: {
                description: "Get token activity.",
                tags: ["wormholescan"],
                operationId: "tokens-symbol-activity",
                parameters: [
                  {
                    type: "string",
                    description:
                      "From date, supported in ISO 8601 format. Examples: UTC Time 2024-01-01T15:04:05Z / Local Time 2006-01-01T15:04:05-07:00",
                    name: "from",
                    in: "query",
                    required: true,
                  },
                  {
                    type: "string",
                    description:
                      "To date, supported in ISO 8601 format. Examples: UTC Time 2024-01-01T15:04:05Z / Local Time 2006-01-01T15:04:05-07:00",
                    name: "to",
                    in: "query",
                    required: true,
                  },
                  {
                    type: "string",
                    description: "Token symbols. Example: USDT,USDC",
                    name: "symbol",
                    in: "query",
                    required: false,
                  },
                  {
                    enum: ["1d", "1h"],
                    type: "string",
                    description: "Time span",
                    name: "timespan",
                    in: "query",
                    required: true,
                  },
                  {
                    type: "number",
                    description: "Source chain",
                    name: "sourceChain",
                    in: "query",
                    required: false,
                  },
                  {
                    type: "number",
                    description: "Target chain",
                    name: "targetChain",
                    in: "query",
                    required: false,
                  },
                ],
                responses: {
                  "200": {
                    description: "OK",
                  },
                  "400": {
                    description: "Bad Request",
                  },
                  "500": {
                    description: "Internal Server Error",
                  },
                },
              },
            },
          },
        };

        const pathsToDeprecate = [
          "/api/v1/address/{address}",
          "/api/v1/global-tx/{chain_id}/{emitter}/{seq}",
          "/api/v1/token/{chain_id}/{token_address}",
          "/api/v1/transactions/",
          "/api/v1/transactions/{chain_id}/{emitter}/{seq}",
          "/api/v1/vaas/vaa-counts",
        ];

        pathsToDeprecate.forEach(path => {
          if (data.paths[path] && data.paths[path].get) {
            data.paths[path].get = {
              ...data.paths[path].get,
              deprecated: true,
            };
          }
        });

        const pathsToModify = [
          "/api/v1/application-activity",
          "/api/v1/native-token-transfer/transfer-by-time",
          "/api/v1/x-chain-activity/tops",
        ];

        pathsToModify.forEach(path => {
          if (data.paths[path] && data.paths[path].get) {
            data.paths[path].get.parameters = data.paths[path].get.parameters.map((param: any) => {
              if (param.name === "timespan") {
                return {
                  ...param,
                  description: "Time span, supported values: 1h, 1d, 1mo and 1y",
                };
              }
              if (param.name === "from") {
                return {
                  ...param,
                  description:
                    "From date, supported in ISO 8601 format. Examples: UTC Time 2024-01-01T15:04:05Z / Local Time 2006-01-01T15:04:05-07:00",
                };
              }
              if (param.name === "to") {
                return {
                  ...param,
                  description:
                    "To date, supported in ISO 8601 format. Examples: UTC Time 2024-01-01T15:04:05Z / Local Time 2006-01-01T15:04:05-07:00",
                };
              }
              return param;
            });
          }
        });

        setSwaggerSpec(data);
      } catch (error) {
        console.error("Error fetching Swagger spec:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSwaggerSpec();
  }, [host, url]);
  // ---

  const customRequestInterceptor = (request: any) => {
    // the governor/config response is extremely big, so we limit the page size to 1
    if (request.url.endsWith("/api/v1/governor/config")) {
      request.url = `${request.url}?pageSize=1`;
    }

    return request;
  };

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
          spec={swaggerSpec}
          onComplete={() => {
            setIsLoading(false);
          }}
          requestInterceptor={customRequestInterceptor}
        />
      </div>
    </BaseLayout>
  );
};

export default ApiDoc;
