import { Navigate, Outlet, useLocation } from "react-router-dom";
import useUserStore from "@/core/store/useUserStore";

export default function UserRedrect() {
    const user = useUserStore((state) => state.user);
    const location = useLocation();
    console.log(location)

    // if (!user) {
    //     return <Navigate to="/login" state={{ from: location }} replace />;
    // }

    return <Outlet />;
}