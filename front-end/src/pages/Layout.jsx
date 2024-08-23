import { Outlet } from "react-router-dom";
import MainNavbar from '../components/MainNavbar';
import NotificationToast from "../components/NotificationToast";
import { useSelector } from 'react-redux'
import Footer from "../components/Footer";

/**
 * Parent component for all views
 * 
 * @returns Main layout
 */
export default function Layout() {
  const darkMode = useSelector(state => state.user.darkMode)

  return (
    <>
      <MainNavbar />
      <Outlet />
      <Footer/>
      <NotificationToast />
    </>
  )
};
