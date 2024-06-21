import {
  CommitmentPolicy,
  KMS,
  KmsKeyringBrowser,
  buildClient,
  getClient,
} from "@aws-crypto/client-browser";
import { fromHex, toHex } from "@smithy/util-hex-encoding";
import { mapChunks } from "@/lib/util";

// Demo credentials
const KEYARN =
  "arn:aws:kms:ap-southeast-2:688148311063:key/2aa7a4ab-64e5-4ea9-9b1b-0555eb4f5475";
const accessKeyId = "AKIA2AOGV5QLTCBGKUGW";
const secretAccessKey = "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";

export type EncryptionCredentials = {
  accessKeyId: string;
  secretAccessKey: string;
}

const { encrypt, decrypt } = buildClient(
  CommitmentPolicy.REQUIRE_ENCRYPT_REQUIRE_DECRYPT,
);

type PlaintextRecord = {
  [key in string]: string;
};

export type Encrypted<T extends PlaintextRecord> = {
  [key in keyof T]: string;
};

// TODO: Handle non-string plaintexts
export async function encryptObject<T extends PlaintextRecord>(
  creds: EncryptionCredentials,
  data: T,
): Promise<Encrypted<T>> {
  let keyring = getKeyRing(creds);

  let utf8Encode = new TextEncoder();
  let promises = Object.entries(data).map(([field, value]) =>
    encrypt(keyring, utf8Encode.encode(value), {
      encryptionContext: { field },
    }).then(({ result }) => [field, toHex(result)]),
  );
  return Promise.all(promises).then(Object.fromEntries);
}

// TODO: Make these functions generic on the type
export async function decryptObject<T extends PlaintextRecord>(
  creds: EncryptionCredentials,
  data: Encrypted<T>,
): Promise<T> {
  let keyring = getKeyRing(creds);
  let utf8Decode = new TextDecoder();
  let promises = Object.entries(data).map(([field, value]) =>
    decrypt(keyring, fromHex(value)).then((result) => [
      field,
      utf8Decode.decode(result.plaintext),
    ]),
  );
  return Promise.all(promises).then(Object.fromEntries);
}

export async function decryptObjects<T extends PlaintextRecord>(
  creds: EncryptionCredentials,
  data: Encrypted<T>[],
): Promise<T[]> {
  let keyring = getKeyRing(creds);
  let utf8Decode = new TextDecoder();
  let promises = data.flatMap((data) =>
    Object.entries(data).map(([field, value]) =>
      decrypt(keyring, fromHex(value)).then(({ plaintext }) => [
        field,
        utf8Decode.decode(plaintext),
      ]),
    ),
  );
  return Promise.all(promises).then((x) => {
    return mapChunks(x, 3, Object.fromEntries);
  });
}

function getKeyRing({accessKeyId, secretAccessKey}: EncryptionCredentials): KmsKeyringBrowser {
  const clientProvider = getClient(KMS, {
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return new KmsKeyringBrowser({
    clientProvider,
    generatorKeyId: KEYARN,
    keyIds: [],
  });
}
