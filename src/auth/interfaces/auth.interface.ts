export interface JwtPayload {
  sub: string; // userId
  email: string;
  name: string;
}

export interface AuthenticatedUser {
  userId: string;
  email: string;
  name: string;
  companies: {
    companyId: string;
    companyName: string;
    companyCnpj: string;
    role: {
      id: string;
      name: string;
      description: string | null;
    };
    permissions: {
      id: string;
      name: string;
      resource: string;
      action: string;
    }[];
  }[];
}
