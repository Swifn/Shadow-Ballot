import { Request } from "express";

//TODO: Create an interface that makes sure that requests for authenticated routes are only responded to if
// the user is authenticated - society, election, and vote controllers will use this
export interface FileRequest extends Request {
  files: any;
  params?: Request.params;
  body?: Request.body;
}
