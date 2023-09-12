type SpecificVAACriteria =
  | {
      sequence: number;
      signer?: string;
      hash?: string;
    }
  | {
      sequence: number;
      signer: string;
      hash: string;
    };

export type VAASearchCriteria =
  | {
      chainId: number;
      emmiter?: string;
      specific?: SpecificVAACriteria;
    }
  | {
      chainId: number;
      emmiter: string;
      specific?: SpecificVAACriteria;
    }
  | {
      chainId: number;
      emmiter: string;
      specific: SpecificVAACriteria;
    };
