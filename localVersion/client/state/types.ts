export interface Voter {
  voterId: string;
  email: string;
  society?: Society;

  admin: boolean;
}

export interface Vote {
  voteId: number;

  name: string;

  option1: string;

  option2: string;
  option3?: string;
  option5?: string;
  option6?: string;
  option7?: string;
  option8?: string;
  option9?: string;
  option10?: string;
}

export interface Society {
  socId: number;
  name: string;
}
