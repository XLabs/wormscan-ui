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

export async function fetchWithTimeout(url: string): Promise<Response | null> {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error("Timeout exceeded"));
    }, 5000); // 5 seconds
  });
  const fetchPromise = fetch(url);

  try {
    // Wait for the first promise to resolve or reject
    const response = await Promise.race([fetchPromise, timeoutPromise]);

    // If fetchPromise wins the race, return the response
    return response as Response;
  } catch (error: any) {
    // If timeoutPromise wins the race just return null
    console.log("request errored or timed out");
    return null;
  }
}
