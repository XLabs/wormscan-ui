export async function callWithTimeout<T>(
  timeoutMs: number,
  endpointPromise: Promise<T>,
  timeoutResponse: T,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    let timeout: NodeJS.Timeout | null = null;

    const onEndpointResolve = (result: T) => {
      if (timeout !== null) {
        clearTimeout(timeout);
        timeout = null;
      }
      resolve(result);
    };

    const onTimeout = () => {
      timeout = null;
      resolve(timeoutResponse);
    };

    endpointPromise.then(onEndpointResolve).catch(reject);

    timeout = setTimeout(onTimeout, timeoutMs);
  });
}

export const wait = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
