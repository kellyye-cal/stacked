import { useContext } from "react";
import AuthContext from "../context/AuthProvider";

const useAuth = () => {
  const { setAuth } = useContext(AuthContext);

  const clearAuthState = () => {
    // setAuth({email: null, accessToken: null, userId: null, loggedOut: true}); // Clear AuthContext state
    // sessionStorage.removeItem("accessToken"); // Remove token from localStorage
    // sessionStorage.removeItem("userId"); // Remove token from localStorage

    // document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"; // Clear auth cookie
    // window.location.href = "/login"; // Redirect to login page
  };

  return { clearAuthState };
};

export default useAuth;