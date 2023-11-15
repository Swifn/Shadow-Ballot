import { Config } from "../config";

export const post = (url: string, body?: any) =>
  req("POST", url, body, undefined);

export const postFile = (url: string, file: any) =>
  req("POST", url, undefined, file);

export const get = (url: string, body?: any) =>
  req("GET", url, body, undefined);

export const patch = (url: string, body?: any) =>
  req("PATCH", url, body, undefined);

export const del = (url: string, body?: any) =>
  req("DELETE", url, body, undefined);

const req = async (method: string, url: string, body?: any, file?: any) => {
  const token = localStorage.getItem(Config.STORAGE.JWT_TOKEN_KEY);
  const headers = !file
    ? {
        "Content-Type": "application/json",
      }
    : {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  if (file) {
    // express-fileupload requires a form data.
    body = new FormData();
    body.append("file", file);
  }
  return await fetch(`/api/}/${url}`, {
    method,
    // @ts-ignore
    headers,
    body: file ? body : JSON.stringify(body),
  });
};
