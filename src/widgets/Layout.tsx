import { useAuth } from "@/shared/lib/auth.tsx";
import {
  DashboardOutlined,
  LogoutOutlined,
  DatabaseOutlined,
} from "@ant-design/icons";
import { Layout as AntLayout, Menu, Avatar, Dropdown } from "antd";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

const { Header, Content } = AntLayout;

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (location.pathname === "/login") {
    return <Outlet />;
  }

  const handleLogout = () => {
    logout();
    localStorage.clear(); // Clear all localStorage items
    navigate("/login");
  };

  const getMenuItems = () => {
    const menuItems = [
      {
        key: "/dashboard",
        icon: <DashboardOutlined />,
        label: (
          <Link
            to={
              user?.role === "admin" ? "/dashboard" : `/dashboard/${user?.id}`
            }>
            Dashboard
          </Link>
        ),
      },
    ];

    // Add Dataset Viewer link for admin users
    if (user?.role) {
      menuItems.push({
        key: "/dataset",
        icon: <DatabaseOutlined />,
        label: <Link to="/dataset">Dataset Viewer</Link>,
      });
    }

    return menuItems;
  };

  const userMenu = [
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: <span onClick={handleLogout}>Sign Out</span>,
    },
  ];

  return (
    <div className="w-full flex flex-col">
      <Header className="bg-white p-0 flex items-center justify-between px-4 shadow-sm w-full">
        <div className="flex items-center">
          <Link to="/" className="text-xl font-bold text-blue-600 mr-8">
            VoiceTranscribe
          </Link>
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            className="border-none"
            items={getMenuItems()}
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="mr-2">{localStorage.getItem("user-name")}</span>

          <Dropdown menu={{ items: userMenu }} placement="bottomRight">
            <div className="cursor-pointer">
              <Avatar src={localStorage.getItem("user-image")} size={40} />
            </div>
          </Dropdown>
        </div>
      </Header>

      <Content className="bg-gray-50 p-6 pt-15 w-full min-h-[calc(100vh-64px)] overflow-hidden">
        <div className="w-full max-w-full">
          <Outlet />
        </div>
      </Content>
    </div>
  );
};

export default Layout;
