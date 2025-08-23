export interface GetUserQuery {
  id?: number | null;
}

export interface GetUserValidation1Query {
  id?: number | null;
}

export interface CreateUserRequest {
  username?: string | null;
  email?: string | null;
}

export interface CreateUserValidation1Request {
  username?: string | null;
  email?: any | null | null;
}

export interface UpdateUserRequest {
  username?: string | null;
  email?: string | null;
}

export interface UpdateUserQuery {
  id?: number | null;
}

export interface UpdateUserValidation1Query {
  id?: number | null;
}

export interface DeleteUserQuery {
  id?: number | null;
}

export interface DeleteUserValidation1Query {
  id?: number | null;
}