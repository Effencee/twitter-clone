import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import LoginPage from "./pages/auth/login/LoginPage";
import SignUpPage from "./pages/auth/signup/SignUpPage";
import Sidebar from "./components/common/Sidebar";
import RightPanel from "./components/common/RightPanel";
import NotificationPage from "./pages/notification/NotificationPage";
import ProfilePage from "./pages/profile/ProfilePage";
import { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "./components/common/LoadingSpinner";
import HomeLink from "./components/common/HomeLink";
import { fetchUser } from "./services/userService";
import Follow from "./pages/profile/follow/Follow";
import SelectedPost from "./components/common/SelectedPost";

function App() {
  const { data, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: fetchUser,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex max-w-7xl mx-auto mb-16 lg:mb-0">
      <div>
        {data && <HomeLink />}
        {data && <Sidebar />}
      </div>
      <Routes>
        <Route
          path="/"
          element={data ? <HomePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/login"
          element={!data ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route
          path="/signup"
          element={!data ? <SignUpPage /> : <Navigate to="/" />}
        />
        <Route
          path="/notifications"
          element={data ? <NotificationPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile/:username"
          element={data ? <ProfilePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile/:username/followers"
          element={data ? <Follow /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile/:username/following"
          element={data ? <Follow /> : <Navigate to="/login" />}
        />
        <Route
          path="/:id"
          element={data ? <SelectedPost /> : <Navigate to="/login" />}
        />
      </Routes>
      {data && <RightPanel />}
      <Toaster />
    </div>
  );
}

export default App;
