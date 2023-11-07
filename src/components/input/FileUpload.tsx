import { PropOf } from "../interfaces";

export function FileUpload(props: PropOf<HTMLInputElement>) {
  return (
    <input
      class={`w-full cursor-pointer rounded border
         border-gray-300 bg-gray-50 text-sm text-gray-900 focus:outline-none
         dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 
        dark:placeholder-gray-400`}
      type="file"
      {...props}
    />
  );
}
