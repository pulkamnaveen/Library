import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import { UserProvider, useUser } from "./context/UserContext";
import { ResourceProvider } from "./context/ResourceContext";

import Dashboard from "./pages/Dashboard";
import BrowseResource from "./pages/BrowseResource";
import SearchPage from "./pages/SearchPage";
import RequestMaterial from "./pages/RequestMaterial";
import ViewDetails from "./pages/ViewDetails";
import AuthForm from "./pages/AuthForm";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import DiscussionForums from "./pages/DiscussionForums";
import UserProfile from "./pages/UserProfile";
import RootLayout from "./components/RootLayout";

const browserObj = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { path: "/", element: <Dashboard /> },
      { path: "/browse-resource", element: <BrowseResource /> },
      { path: "/search", element: <SearchPage /> },
      { path: "/request-material", element: <RequestMaterial /> },
      { path: "/view-details/:id", element: <ViewDetails /> },
      { path: "/discussion-forums", element: <DiscussionForums /> },
      { path: "/profile", element: <UserProfile /> },
      { path: "/auth", element: <AuthForm /> },
      { path: "/forgot-password", element: <ForgotPassword /> },
      { path: "/reset-password/:token", element: <ResetPassword /> },
    ],
  },
]);

function InnerApp() {
  const { user, loading } = useUser();

  if (loading) return <div className="text-white p-4">Loading user...</div>;

  const role = user?.role || "public";

  return (
    <ResourceProvider role={role}>
      <RouterProvider router={browserObj} />
    </ResourceProvider>
  );
}

createRoot(document.getElementById("root")).render(

    <UserProvider>
      <InnerApp />
    </UserProvider>

);
