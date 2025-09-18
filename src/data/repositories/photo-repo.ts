import { kv } from "../storage/async";
import { Photo } from "../../domain/photo/types";

const KEY = "photos:v1";

export async function listPhotos(): Promise<Photo[]> {
  const raw = await kv.getString(KEY);
  return raw ? JSON.parse(raw) : [];
}
export async function saveAllPhotos(list: Photo[]) {
  await kv.setString(KEY, JSON.stringify(list));
}
