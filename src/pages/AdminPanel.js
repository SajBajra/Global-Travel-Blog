import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import { Card, Row, Col, Typography, Button, Statistic, List, Avatar, Badge, Progress, Space } from "antd"
import {
  EnvironmentOutlined,
  FileTextOutlined,
  UserOutlined,
  FlagOutlined,
  TagOutlined,
  LineChartOutlined,
  EyeOutlined,
  LikeOutlined,
  CommentOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons"
import "./AdminPanel.css"

const { Title, Text } = Typography

const AdminPanel = () => {
  const [stats, setStats] = useState({
    blogs: 0,
    users: 0,
    destinations: 0,
    comments: 0,
    pendingReports: 0,
    pendingBlogs: 0,
  })
  const [recentBlogs, setRecentBlogs] = useState([])
  const [recentUsers, setRecentUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [blogsRes, usersRes, destinationsRes, commentsRes, reportsRes] = await Promise.all([
          axios.get("http://localhost:3001/blogs"),
          axios.get("http://localhost:3001/users"),
          axios.get("http://localhost:3001/destinations"),
          axios.get("http://localhost:3001/comments"),
          axios.get("http://localhost:3001/reports?status=pending"),
        ])

        setStats({
          blogs: blogsRes.data.length,
          users: usersRes.data.length,
          destinations: destinationsRes.data.length,
          comments: commentsRes.data.length,
          pendingReports: reportsRes.data.length,
          pendingBlogs: blogsRes.data.filter((blog) => blog.status === "pending").length,
        })

        // Get recent blogs
        const sortedBlogs = [...blogsRes.data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)
        setRecentBlogs(sortedBlogs)

        // Get recent users
        const sortedUsers = [...usersRes.data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)
        setRecentUsers(sortedUsers)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <Title level={2}>Admin Dashboard</Title>
        <Text>Welcome to the Global Travel Blog admin panel</Text>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className="stat-card">
            <Statistic
              title="Total Blogs"
              value={stats.blogs}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: "#3498db" }}
            />
            <div className="stat-footer">
              <Badge count={stats.pendingBlogs} style={{ backgroundColor: "#faad14" }} />
              <Text type="secondary">Pending approval</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className="stat-card">
            <Statistic title="Users" value={stats.users} prefix={<UserOutlined />} valueStyle={{ color: "#2ecc71" }} />
            <div className="stat-footer">
              <Progress percent={Math.round((stats.users / 100) * 100)} size="small" showInfo={false} />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className="stat-card">
            <Statistic
              title="Destinations"
              value={stats.destinations}
              prefix={<EnvironmentOutlined />}
              valueStyle={{ color: "#9b59b6" }}
            />
            <div className="stat-footer">
              <Text type="secondary">Locations available</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className="stat-card">
            <Statistic
              title="Comments"
              value={stats.comments}
              prefix={<CommentOutlined />}
              valueStyle={{ color: "#e67e22" }}
            />
            <div className="stat-footer">
              <Text type="secondary">User interactions</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className="stat-card">
            <Statistic
              title="Reports"
              value={stats.pendingReports}
              prefix={<FlagOutlined />}
              valueStyle={{ color: "#e74c3c" }}
            />
            <div className="stat-footer">
              <Text type="secondary">Pending review</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className="stat-card">
            <Statistic title="Categories" value={5} prefix={<TagOutlined />} valueStyle={{ color: "#f39c12" }} />
            <div className="stat-footer">
              <Text type="secondary">Blog categories</Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Card className="quick-actions-card">
        <Title level={4}>Quick Actions</Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Link to="/admin/blogs">
              <Button type="primary" icon={<FileTextOutlined />} size="large" block>
                Manage Blogs
              </Button>
            </Link>
          </Col>
          <Col xs={24} sm={8}>
            <Link to="/admin/destinations">
              <Button type="primary" icon={<EnvironmentOutlined />} size="large" block>
                Manage Destinations
              </Button>
            </Link>
          </Col>
          <Col xs={24} sm={8}>
            <Link to="/admin/reports">
              <Button type="primary" icon={<FlagOutlined />} size="large" block danger={stats.pendingReports > 0}>
                Review Reports{" "}
                {stats.pendingReports > 0 && <Badge count={stats.pendingReports} style={{ marginLeft: 8 }} />}
              </Button>
            </Link>
          </Col>
        </Row>
      </Card>

      {/* Recent Activity */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Recent Blogs" className="recent-card" extra={<Link to="/admin/blogs">View All</Link>}>
            <List
              loading={loading}
              itemLayout="horizontal"
              dataSource={recentBlogs}
              renderItem={(blog) => (
                <List.Item
                  key={blog.id}
                  actions={[
                    <Space>
                      <LikeOutlined /> {blog.likes || 0}
                    </Space>,
                    <Badge
                      status={
                        blog.status === "approved" ? "success" : blog.status === "pending" ? "processing" : "error"
                      }
                      text={blog.status}
                    />,
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar src={blog.imageUrl || "/placeholder.svg"} shape="square" />}
                    title={<Link to={`/blogs/${blog.id}`}>{blog.title}</Link>}
                    description={
                      <Space direction="vertical" size={0}>
                        <Text type="secondary">By {blog.authorName}</Text>
                        <Text type="secondary">
                          <ClockCircleOutlined /> {new Date(blog.createdAt).toLocaleDateString()}
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Recent Users" className="recent-card" extra={<Link to="/admin/users">View All</Link>}>
            <List
              loading={loading}
              itemLayout="horizontal"
              dataSource={recentUsers}
              renderItem={(user) => (
                <List.Item
                  key={user.id}
                  actions={[<Badge color={user.role === "admin" ? "red" : "blue"} text={user.role} />]}
                >
                  <List.Item.Meta
                    avatar={<Avatar src={user.profilePic || "/default-profile.jpg"} />}
                    title={user.name}
                    description={
                      <Space direction="vertical" size={0}>
                        <Text type="secondary">{user.email}</Text>
                        <Text type="secondary">
                          <ClockCircleOutlined /> Joined: {new Date(user.createdAt).toLocaleDateString()}
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Analytics Preview */}
      <Card
        title="Analytics Overview"
        className="analytics-card"
        extra={<Link to="/admin/analytics">View Details</Link>}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Card className="analytics-stat-card">
              <Statistic title="Page Views" value={2570} prefix={<EyeOutlined />} valueStyle={{ color: "#3498db" }} />
              <div className="stat-trend positive">+15% from last week</div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="analytics-stat-card">
              <Statistic
                title="Engagement Rate"
                value="24%"
                prefix={<LineChartOutlined />}
                valueStyle={{ color: "#2ecc71" }}
              />
              <div className="stat-trend positive">+3% from last week</div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="analytics-stat-card">
              <Statistic
                title="Avg. Time on Site"
                value="4:32"
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: "#9b59b6" }}
              />
              <div className="stat-trend negative">-1:05 from last week</div>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  )
}

export default AdminPanel

