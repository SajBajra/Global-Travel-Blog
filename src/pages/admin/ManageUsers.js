import { useState, useEffect } from "react"
import { toastUtil } from "../../util"
import { Table, Button, Space, Typography, Popconfirm, Avatar, Card, Row, Col, Input, Tag, Tooltip } from "antd"
import { DeleteOutlined, SearchOutlined } from "@ant-design/icons"
import "./AdminPages.css"

const { Title } = Typography

const ManageUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState("")
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  useEffect(() => {
    fetchUsers()

    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:3001/users")
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error("Error fetching users:", error)
      toastUtil.error("Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (id) => {
    try {
      await fetch(`http://localhost:3001/users/${id}`, {
        method: "DELETE",
      })
      setUsers((prev) => prev.filter((user) => user.id !== id))
      toastUtil.success("User deleted successfully")
    } catch (error) {
      console.error("Error deleting user:", error)
      toastUtil.error("Failed to delete user")
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase()),
  )

  const getColumns = () => {
    const baseColumns = [
      {
        title: "Avatar",
        dataIndex: "profilePic",
        key: "profilePic",
        render: (profilePic, record) => (
          <Avatar src={profilePic || "/default-profile.jpg"} size={40} alt={record.name} />
        ),
        responsive: ["md"],
      },
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
        sorter: (a, b) => a.name.localeCompare(b.name),
        ellipsis: true,
      },
      {
        title: "Email",
        dataIndex: "email",
        key: "email",
        ellipsis: true,
        responsive: ["sm"],
      },
      {
        title: "Role",
        dataIndex: "role",
        key: "role",
        render: (role) => <Tag color={role === "admin" ? "red" : "blue"}>{role.toUpperCase()}</Tag>,
      },
      {
        title: "Joined Date",
        dataIndex: "createdAt",
        key: "createdAt",
        render: (date) => new Date(date).toLocaleDateString(),
        sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        responsive: ["lg"],
      },
      {
        title: "Actions",
        key: "actions",
        render: (_, record) => (
          <Space size="small">
            {windowWidth <= 576 ? (
              <Tooltip title="Delete">
                <Popconfirm
                  title="Delete this user?"
                  onConfirm={() => handleDeleteUser(record.id)}
                  okText="Yes"
                  cancelText="No"
                  disabled={record.role === "admin"}
                >
                  <Button
                    type="primary"
                    danger
                    icon={<DeleteOutlined />}
                    disabled={record.role === "admin"}
                    size="small"
                  />
                </Popconfirm>
              </Tooltip>
            ) : (
              <Popconfirm
                title="Are you sure you want to delete this user?"
                onConfirm={() => handleDeleteUser(record.id)}
                okText="Yes"
                cancelText="No"
                disabled={record.role === "admin"}
              >
                <Button type="primary" danger icon={<DeleteOutlined />} disabled={record.role === "admin"}>
                  {windowWidth > 768 ? "Delete" : ""}
                </Button>
              </Popconfirm>
            )}
          </Space>
        ),
      },
    ]

    return baseColumns
  }

  return (
    <div className="admin-manage-page">
      <Row justify="space-between" align="middle" className="page-header">
        <Col>
          <Title level={2}>Manage Users</Title>
        </Col>
        <Col xs={24} md={8}>
          <Input
            placeholder="Search users..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: "100%" }}
            allowClear
          />
        </Col>
      </Row>

      <Card>
        <Table
          columns={getColumns()}
          dataSource={filteredUsers}
          rowKey="id"
          loading={loading}
          expandable={{
            expandedRowRender: (record) => (
              <div style={{ margin: 0 }}>
                <p>
                  <strong>Bio:</strong> {record.bio || "No bio provided"}
                </p>
                {windowWidth <= 768 && (
                  <p>
                    <strong>Email:</strong> {record.email}
                  </p>
                )}
                {windowWidth <= 992 && (
                  <p>
                    <strong>Joined:</strong> {new Date(record.createdAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            ),
          }}
          scroll={{ x: "max-content" }}
          pagination={{
            responsive: true,
            showSizeChanger: windowWidth > 576,
            defaultPageSize: windowWidth <= 576 ? 5 : 10,
          }}
        />
      </Card>
    </div>
  )
}

export default ManageUsers

