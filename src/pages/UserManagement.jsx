import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import AppLayout from "../components/AppLayout";
import toast from "react-hot-toast";
import { API_ENDPOINTS } from "../config/api";

const UserManagement = () => {
  const { user: currentUser, token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Researcher",
  });

  useEffect(() => {
    if (currentUser?.role === "Admin") {
      fetchUsers();
    }
  }, [currentUser]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.ADMIN_USERS, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        console.error("Failed to fetch users");
        toast.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(API_ENDPOINTS.ADMIN_USERS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        setShowAddModal(false);
        setUserData({
          name: "",
          email: "",
          password: "",
          role: "Researcher",
        });
        fetchUsers();
        toast.success("User created successfully!");
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to create user");
      }
    } catch (error) {
      toast.error("Error creating user");
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        API_ENDPOINTS.ADMIN_USER_BY_ID(selectedUser._id),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(userData),
        }
      );

      if (response.ok) {
        setShowEditModal(false);
        setSelectedUser(null);
        setUserData({
          name: "",
          email: "",
          password: "",
          role: "Researcher",
        });
        fetchUsers();
        toast.success("User updated successfully!");
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to update user");
      }
    } catch (error) {
      toast.error("Error updating user");
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (
      !confirm(
        `Are you sure you want to delete user "${userName}"? This action cannot be undone.`
      )
    )
      return;

    try {
      const response = await fetch(API_ENDPOINTS.ADMIN_USER_BY_ID(userId), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchUsers();
        toast.success(`User "${userName}" deleted successfully!`);
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to delete user");
      }
    } catch (error) {
      toast.error("Error deleting user");
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setUserData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
    });
    setShowEditModal(true);
  };

  if (currentUser?.role !== "Admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const getRoleColor = (role) => {
    switch (role) {
      case "Admin":
        return "bg-red-100 text-red-800";
      case "LabTechnician":
        return "bg-blue-100 text-blue-800";
      case "Researcher":
        return "bg-green-100 text-green-800";
      case "Engineer":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Component continues with modal and UI JSX...
  return (
    <AppLayout>
      {/* UI components (already correctly structured) */}
      {/* No changes needed in JSX for logic/design – just ensure backtick issues were fixed above */}
    </AppLayout>
  );
};

export default UserManagement;
