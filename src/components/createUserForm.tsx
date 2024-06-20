"use client"
import { CommitmentPolicy, KMS, KmsKeyringBrowser, buildClient, getClient } from '@aws-crypto/client-browser'
import { PhotoIcon, UserCircleIcon } from '@heroicons/react/24/solid'
//import { useState } from 'react'
import { useForm, SubmitHandler, Form, FieldValues, FormSubmitHandler } from "react-hook-form"
import { create } from '@/app/actions/user'
import { fromHex, toHex } from '@smithy/util-hex-encoding'
import { useRouter } from 'next/navigation'
import { getAccessToken } from '@auth0/nextjs-auth0'

// TODO: Move all of this to an encryption module
const KEYARN = "arn:aws:kms:ap-southeast-2:688148311063:key/2aa7a4ab-64e5-4ea9-9b1b-0555eb4f5475"
const accessKeyId = "AKIA2AOGV5QLTCBGKUGW"
const secretAccessKey = "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"

const clientProvider = getClient(KMS, {
  credentials: {
    accessKeyId,
    secretAccessKey
  }
})

const { encrypt, decrypt } = buildClient(
  CommitmentPolicy.REQUIRE_ENCRYPT_REQUIRE_DECRYPT
)

const keyring = new KmsKeyringBrowser({ clientProvider, generatorKeyId: KEYARN, keyIds: [] })

// TODO: Rename to User
export type UserFields = {
  firstName: string
  lastName: string
  email: string
}

export type EncryptedUser = {
  [key in keyof UserFields]: string;
}

// TODO: Handle non-string plaintexts
async function encryptObject(data: UserFields): Promise<EncryptedUser> {
  let utf8Encode = new TextEncoder();
  let promises = Object.entries(data).map(([field, value]) => 
    encrypt(keyring, utf8Encode.encode(value), { encryptionContext: { field } })
      .then(({result}) => [field, toHex(result)])
  )
  return Promise.all(promises).then(Object.fromEntries)
}

export async function decryptObjects(data: EncryptedUser[]): Promise<UserFields[]> {
  let utf8Decode = new TextDecoder();
  let promises = data.flatMap((data) => 
    Object.entries(data).map(([field, value]) =>
      decrypt(keyring, fromHex(value))
        .then(({plaintext}) => [field, utf8Decode.decode(plaintext)])
    )
  )
  return Promise.all(promises).then((x) => {console.log("X", x); return mapChunks(x, 3, Object.fromEntries)})
}

function mapChunks<T, U>(array: T[], chunkSize: number, callback: (chunk: T[]) => U): U[] {
  return array.reduce<U[]>((acc, _, index, originalArray) => {
    if (index % chunkSize === 0) {
      const chunk = originalArray.slice(index, index + chunkSize);
      acc.push(callback(chunk));
    }
    return acc;
  }, []);
}

// TODO: Make these functions generic on the type
export async function decryptObject(data: EncryptedUser): Promise<UserFields> {
  let utf8Decode = new TextDecoder();
  let promises = Object.entries(data).map(([field, value]) => 
    decrypt(keyring, fromHex(value))
      .then((result) => [field, utf8Decode.decode(result.plaintext)])
  )
  return Promise.all(promises).then(Object.fromEntries)
}

export default function CreateUserForm() {

  

  const router = useRouter()
  const {
    register,
    control,
    formState: { errors },
  } = useForm<UserFields>()

  return (
    <Form<UserFields>
      control={control}
      onSubmit={async ({ data }) => {
        let encrypted = await encryptObject(data)
        await create(encrypted)
        router.push("/users")
      }}
      className='w-full'
    >
      <div className="">
        <div className="border-b border-gray-900/10 pb-12">
         
          <h2 className="text-base font-semibold leading-7 text-gray-900">Personal Information</h2>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="first-name" className="block text-sm font-medium leading-6 text-gray-900">
                First name
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  id="first-name"
                  autoComplete="given-name"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  {...register("firstName", { required: true })}
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="last-name" className="block text-sm font-medium leading-6 text-gray-900">
                Last name
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  id="last-name"
                  autoComplete="family-name"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  {...register("lastName", { required: true })}
                />
              </div>
            </div>

            <div className="sm:col-span-4">
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  {...register("email", { required: true })}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6">
        <button type="button" className="text-sm font-semibold leading-6 text-gray-900">
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Save
        </button>
      </div>
    </Form>
  )
}