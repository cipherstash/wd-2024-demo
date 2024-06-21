"use client";
import { useAuth0 } from "@auth0/auth0-react";
import { useForm, Form } from "react-hook-form";
import { User, createUser } from "@/app/actions/user";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { EncryptionCredentials, encryptObject } from "@/lib/crypto";



// Demo credentials (bad don't do this! Use JWT federation instead)
const creds: EncryptionCredentials = {
  accessKeyId: "AKIA2AOGV5QLTCBGKUGW",
  secretAccessKey: "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"
}

export default function CreateUserForm() {
  const { getAccessTokenSilently } = useAuth0();

  const router = useRouter();
  const {
    register,
    control,
    formState: { errors },
  } = useForm<User>();

  // TODO: Maybe make a component?
  useEffect(() => {
    (async () => {
      try {
        /*const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: "https://api.example.com/",
            scope: "read:posts",
          },
        });
        console.log(token);
        const response = await fetch('https://api.example.com/posts', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPosts(await response.json());*/
      } catch (e) {
        // Handle errors such as `login_required` and `consent_required` by re-prompting for a login
        console.error(e);
      }
    })();
  }, [getAccessTokenSilently]);

  return (
    <Form<User>
      control={control}
      onSubmit={async ({ data }) => {
        let encrypted = await encryptObject(creds, data);
        await createUser(encrypted);
        router.push("/users");
      }}
      className="w-full"
    >
      <div className="">
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base font-semibold leading-7 text-gray-900">
            Personal Information
          </h2>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label
                htmlFor="first-name"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
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
              <label
                htmlFor="last-name"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
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
              <label
                htmlFor="email"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
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
        <button
          type="button"
          className="text-sm font-semibold leading-6 text-gray-900"
        >
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
  );
}
