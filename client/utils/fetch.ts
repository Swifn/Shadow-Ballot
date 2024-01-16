import { Config } from "../config";

export const post = (url: string, body?: any) => req("POST", url, body);

export const get = (url: string, body?: any) => req("GET", url, body);

export const patch = (url: string, body?: any) => req("PATCH", url, body);

export const del = (url: string, body?: any) => req("DELETE", url, body);

const req = async (method: string, url: string, body?: any) => {
  const token = localStorage.getItem(Config.STORAGE.JWT_TOKEN_KEY);
  console.log(token);

  const headers = {};

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Set Content-Type to 'application/json' only if body is not FormData
  if (!(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(body);
  }

  console.log(`METHOD: ${method}\nURL: ${url}\nBODY: ${body}`);

  return await fetch(`http://localhost:8000/${url}`, {
    method,
    headers,
    body,
  });
};
