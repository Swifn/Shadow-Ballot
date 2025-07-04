import { Config } from "../config";

export const post = (url: string, body?: any) =>
  req("POST", url, body, undefined);

export const get = (url: string, body?: any) =>
  req("GET", url, body, undefined);
export const postFile = (url: string, file: any) =>
  req("POST", url, undefined, file);

export const patch = (url: string, body?: any) =>
  req("PATCH", url, body, undefined);

export const del = (url: string, body?: any) =>
  req("DELETE", url, body, undefined);

const req = async (method: string, url: string, body?: any, file?: any) => {
  const headers = !file
    ? {
        "Content-Type": "application/json",
      }
    : {};
  if (file) {
    body = new FormData();
    body.append("file", file);
    console.log(file);
  }

  return await fetch(`http://localhost:8000/${url}`, {
    method,
    //@ts-ignore
    headers,
    body: file ? body : JSON.stringify(body),
  });
};
