import client from "@/lib/mongodb";

type SettingsDocument<T = unknown> = {
  _id: string;
  value: T;
  updatedAt?: Date;
};

const memoryStore = new Map<string, unknown>();

async function getSettingsCollection() {
  if (!client) {
    return null;
  }

  await client.connect();
  return client.db("one_core").collection<SettingsDocument>("settings");
}

export async function getSetting<T>(key: string): Promise<T | null> {
  const collection = await getSettingsCollection().catch(() => null);

  if (!collection) {
    return (memoryStore.get(key) as T | undefined) || null;
  }

  try {
    const document = await collection.findOne({ _id: key });
    return (document?.value as T | undefined) || null;
  } catch {
    return (memoryStore.get(key) as T | undefined) || null;
  }
}

export async function setSetting<T>(key: string, value: T): Promise<T> {
  memoryStore.set(key, value);
  const collection = await getSettingsCollection().catch(() => null);

  if (!collection) {
    return value;
  }

  try {
    await collection.updateOne(
      { _id: key },
      { $set: { value, updatedAt: new Date() } },
      { upsert: true },
    );
  } catch {
    return value;
  }

  return value;
}
