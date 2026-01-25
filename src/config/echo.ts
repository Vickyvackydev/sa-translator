// // echo.ts
// import Echo from "laravel-echo";
// import Pusher from "pusher-js";
// let echoInstance: Echo<any> | null = null;
// (window as any).pusher = Pusher;
// const getEcho = (token: string) => {
//   if (echoInstance) return echoInstance;

//   echoInstance = new Echo({
//     broadcaster: "reverb",
//     key: import.meta.env.VITE_REVERB_APP_KEY,
//     wsHost: import.meta.env.VITE_REVERB_HOST,
//     wsPort: 443,
//     wssPort: 443, // Try 443 if 8082 fails
//     forceTLS: true,
//     enabledTransports: ["ws", "wss"],
//     authEndpoint:
//       "https://lang-translator.rentangoafrica.com/broadcasting/auth",
//     auth: {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         Accept: "application/json",
//       },
//     },
//   });
//   return echoInstance;
// };

// export default getEcho;
// echo.ts
// import Echo from "laravel-echo";
// import Pusher from "pusher-js";

// let echoInstance: Echo<any> | null = null;
// (window as any).Pusher = Pusher;

// const getEcho = (token: string) => {
//   if (echoInstance) return echoInstance;

//   echoInstance = new Echo({
//     broadcaster: "reverb",
//     key: import.meta.env.VITE_REVERB_APP_KEY,
//     wsHost: import.meta.env.VITE_REVERB_HOST,
//     wsPort: import.meta.env.VITE_REVERB_PORT || 8082, // Use 8082 to match backend
//     wssPort: import.meta.env.VITE_REVERB_PORT || 8082,
//     forceTLS: false, // Keep as false since backend uses http
//     enabledTransports: ["ws", "wss"],
//     authEndpoint:
//       "https://lang-translator.rentangoafrica.com/broadcasting/auth",
//     auth: {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         Accept: "application/json",
//       },
//     },
//   });

//   return echoInstance;
// };

// export default getEcho;
import Echo from "laravel-echo";
import Pusher from "pusher-js";

let echoInstance: Echo<any> | null = null;
(window as any).Pusher = Pusher;

const getEcho = (token: string) => {
  // If instance exists AND token hasn't changed, reuse it
  if (echoInstance) {
    console.log("♻️ Reusing existing Echo instance");
    return echoInstance;
  }

  console.log("🆕 Creating new Echo instance");

  echoInstance = new Echo({
    broadcaster: "reverb",
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT || 8080, // Changed to 8080
    wssPort: import.meta.env.VITE_REVERB_PORT || 8080,
    forceTLS: false,
    enabledTransports: ["ws", "wss"],
    authEndpoint:
      "https://lang-translator.rentangoafrica.com/broadcasting/auth",
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    },
  });

  return echoInstance;
};

export default getEcho;
