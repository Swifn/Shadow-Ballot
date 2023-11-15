import { atom } from "recoil";
import { Config } from "../config";
import { get } from "../utils/fetch";
import { User } from "./types";

export const userState = atom<User | null>({
  key: "USER",
  default: (async () => {
    const userId = localStorage.getItem(Config.STORAGE.USER_ID_KEY);
    if (!userId) return null;
    const response = await get(`users/${userId}`);
    if (!response.ok) return null;
    const payload = await response.json();
    return payload;
  })(),
});
