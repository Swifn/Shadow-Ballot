export interface Voter {
  userId: string;
  email: string;
  Society?: Society;
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

export interface User extends Voter {
  admin: boolean;
}

export interface Society {
  socId: number;
  name: string;
}
