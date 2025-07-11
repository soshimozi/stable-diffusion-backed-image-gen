import React, { useState, useEffect } from 'react';

// --- TYPE DEFINITIONS ---
// This defines the structure of the object returned by our hook.
// It's generic, so it can handle any type of data.
interface UseAsyncDataReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

// --- THE CUSTOM HOOK ---

/**
 * A custom React hook to fetch data asynchronously.
 * It manages loading and error states for you.
 *
 * @param asyncFunction - The asynchronous function to execute for data fetching.
 * This function should return a Promise that resolves with the data.
 * @param immediate - Optional. If true, the async function is called immediately on mount. Defaults to true.
 * @returns An object containing the fetched data, a loading state boolean, and an error object.
 */
export default function useAsyncData<T>(
  asyncFunction: () => Promise<T>,
  immediate: boolean = true
): UseAsyncDataReturn<T> {
  // State to track if we are currently fetching data
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // State to hold the data once it's fetched
  const [data, setData] = useState<T | null>(null);
  // State to hold any potential error during the fetch
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // We define an async function inside the effect to call our passed-in function
    const execute = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await asyncFunction();
        setData(result);
      } catch (err) {
        if (err instanceof Error) {
          setError(err);
        } else {
          setError(new Error('An unknown error occurred.'));
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Only execute immediately if the `immediate` flag is true
    if (immediate) {
      execute();
    } else {
      // If not immediate, we start in a non-loading state.
      // You would typically add a function returned from the hook to trigger the fetch manually.
      setIsLoading(false);
    }

    // The dependency array includes the async function to re-run the effect
    // if the function reference changes.
  }, [asyncFunction, immediate]);

  return { data, isLoading, error };
}


// // --- USAGE EXAMPLE ---

// // 1. Define a type for the data you expect to fetch.
// interface UserProfile {
//   id: number;
//   name: string;
//   email: string;
// }

// // 2. Create a mock async function that simulates a network request.
// //    In a real app, this would be an API call using fetch() or axios.
// const fetchUserProfile = (): Promise<UserProfile> => {
//   console.log('Fetching user data...');
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       // Simulate a successful response
//       const mockData: UserProfile = {
//         id: 1,
//         name: 'Jane Doe',
//         email: 'jane.doe@example.com',
//       };
//       resolve(mockData);

//       // To test the error state, uncomment the following line:
//       // reject(new Error('Failed to fetch data from the server.'));
//     }, 2000); // Simulate a 2-second network delay
//   });
// };


// // 3. Create a component that uses the hook.
// const UserProfileComponent: React.FC = () => {
//   // Use the hook by passing the async function you want to call.
//   // The hook's return value is destructured for easy access.
//   const { data: user, isLoading, error } = useAsyncData(fetchUserProfile);

//   // Render a loading state while the data is being fetched.
//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center p-8 text-lg font-semibold">
//         <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//         </svg>
//         Loading Profile...
//       </div>
//     );
//   }

//   // Render an error message if the fetch failed.
//   if (error) {
//     return (
//       <div className="p-8 text-red-600 bg-red-100 border border-red-400 rounded-md">
//         <strong>Error:</strong> {error.message}
//       </div>
//     );
//   }

//   // Render the data once it's successfully fetched.
//   return (
//     <div className="p-6 bg-white shadow-md rounded-lg">
//       <h2 className="text-2xl font-bold mb-4 text-gray-800">User Profile</h2>
//       {user && (
//         <div className="space-y-2">
//           <p><strong className="text-gray-600">ID:</strong> {user.id}</p>
//           <p><strong className="text-gray-600">Name:</strong> {user.name}</p>
//           <p><strong className="text-gray-600">Email:</strong> {user.email}</p>
//         </div>
//       )}
//     </div>
//   );
// };

// // Main App component to render our example
// export default function App() {
//   return (
//     <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4 font-sans">
//       <div className="w-full max-w-md">
//         <UserProfileComponent />
//       </div>
//     </div>
//   );
// }
