import { atom } from "recoil";
import { Config } from "../config";
import { get } from "../utils/fetch";
import { Voter } from "./types";

export const userState = atom<Voter | null>({
  key: "VOTER",
  default: (async () => {
    const voterId = localStorage.getItem(Config.STORAGE.USER_ID_KEY);
    if (!voterId) return null;
    const response = await get(`voter/${voterId}`);
    if (!response.ok) return null;
    const payload = await response.json();
    return payload;
  })(),
});
