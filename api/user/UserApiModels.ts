export interface GetUserQuery {
  id: number;
}

export interface GetUserValidation1Query {
  id: number;
}

export interface CreateUserRequest {
  username: string;
  email: string;
}

export interface CreateUserValidation1Request {
  username: string;
}

export interface UpdateUserRequest {
  username: string;
  email: string;
}

export interface UpdateUserQuery {
  id: number;
}

export interface UpdateUserValidation1Request {
  username: string;
  email: string;
}

export interface UpdateUserValidation1Query {
  id: number;
}

export interface DeleteUserQuery {
  id: number;
}

export interface DeleteUserValidation1Query {
  id: number;
}