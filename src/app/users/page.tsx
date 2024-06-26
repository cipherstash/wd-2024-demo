"use client";
import { Suspense, useEffect, useState } from "react";
import { listUsers, User } from "@/app/actions/user";
import { EncryptionCredentials, decryptObjects } from "@/lib/crypto";
import Link from "next/link";

// Demo credentials (bad don't do this! Use JWT federation instead)
const creds: EncryptionCredentials = {
  accessKeyId: "AKIA2AOGV5QLTCBGKUGW",
  secretAccessKey: "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"
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  useEffect(() => {
      listUsers().then((users) => decryptObjects<User>(creds, users)).then(setUsers);
  }, []);

  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mt-10">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">
            Users
          </h1>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Link
            href="/"
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Add user
          </Link>
        </div>
      </div>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      First Name
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Last Name
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Email
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Role
                    </th>
                    <th
                      scope="col"
                      className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                    >
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  <Suspense
                    fallback={
                      <tr>
                        <td colSpan={4}>Loading</td>
                      </tr>
                    }
                  >
                    {users.map((user) => (
                      <tr key={user.firstName}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {user.firstName}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {user.firstName}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {user.lastName}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {user.email}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <a
                            href="#"
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Edit
                            <span className="sr-only">, {user.firstName}</span>
                          </a>
                        </td>
                      </tr>
                    ))}
                  </Suspense>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
