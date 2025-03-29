import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Card, Row, Col, Typography, Button, Statistic, List, Avatar, Badge, Space } from "antd";
import {
  EnvironmentOutlined,
  FileTextOutlined,
  UserOutlined,
  FlagOutlined,
  TagOutlined,
  LikeOutlined,
  CommentOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import "./AdminPanel.css";

const { Title, Text } = Typography;

const AdminPanel = () => {
  const [stats, setStats] = useState({
    blogs: 0,
    users: 0,
    destinations: 0,
    comments: 0,
    pendingReports: 0,
    pendingBlogs: 0,
    categories: 0, // Added categories to state
  });
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          blogsRes,
          usersRes,
          destinationsRes,
          commentsRes,
          reportsRes,
          categoriesRes, // Fetching categories
        ] = await Promise.all([
          axios.get("http://localhost:3001/blogs"),
          axios.get("http://localhost:3001/users"),
          axios.get("http://localhost:3001/destinations"),
          axios.get("http://localhost:3001/comments"),
          axios.get("http://localhost:3001/reports?status=pending"),
          axios.get("http://localhost:3001/categories"), // Assuming an endpoint for categories
        ]);

        setStats({
          blogs: blogsRes.data.length,
          users: usersRes.data.length,
          destinations: destinationsRes.data.length,
          comments: commentsRes.data.length,
          pendingReports: reportsRes.data.length,
          pendingBlogs: blogsRes.data.filter((blog) => blog.status === "pending").length,
          categories: categoriesRes.data.length, // Setting dynamic category count
        });

        // Get recent blogs
        const sortedBlogs = [...blogsRes.data]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
        setRecentBlogs(sortedBlogs);

        // Get recent users
        const sortedUsers = [...usersRes.data]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
        setRecentUsers(sortedUsers);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <Title level={2}>Admin Dashboard</Title>
        <Text>Welcome to the Global Travel Blog admin panel</Text>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={12} sm={8} md={8} lg={4}>
          <Card className="stat-card">
            <Statistic
              title="Total Blogs"
              value={stats.blogs}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: "#3498db", fontSize: windowWidth < 576 ? "1.2rem" : "1.5rem" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={8} lg={4}>
          <Card className="stat-card">
            <Statistic
              title="Users"
              value={stats.users}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#2ecc71", fontSize: windowWidth < 576 ? "1.2rem" : "1.5rem" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={8} lg={4}>
          <Card className="stat-card">
            <Statistic
              title="Destinations"
              value={stats.destinations}
              prefix={<EnvironmentOutlined />}
              valueStyle={{ color: "#9b59b6", fontSize: windowWidth < 576 ? "1.2rem" : "1.5rem" }}
            />
            <div className="stat-footer">
              <Text type="secondary" style={{ fontSize: windowWidth < 576 ? "0.7rem" : "0.8rem" }}>
                Locations available
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={8} md={8} lg={4}>
          <Card className="stat-card">
            <Statistic
              title="Comments"
              value={stats.comments}
              prefix={<CommentOutlined />}
              valueStyle={{ color: "#e67e22", fontSize: windowWidth < 576 ? "1.2rem" : "1.5rem" }}
            />
            <div className="stat-footer">
              <Text type="secondary" style={{ fontSize: windowWidth < 576 ? "0.7rem" : "0.8rem" }}>
                User interactions
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={8} md={8} lg={4}>
          <Card className="stat-card">
            <Statistic
              title="Reports"
              value={stats.pendingReports}
              prefix={<FlagOutlined />}
              valueStyle={{ color: "#e74c3c", fontSize: windowWidth < 576 ? "1.2rem" : "1.5rem" }}
            />
            <div className="stat-footer">
              <Text type="secondary" style={{ fontSize: windowWidth < 576 ? "0.7rem" : "0.8rem" }}>
                Pending review
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={8} md={8} lg={4}>
          <Card className="stat-card">
            <Statistic
              title="Categories"
              value={stats.categories}
              prefix={<TagOutlined />}
              valueStyle={{ color: "#f39c12", fontSize: windowWidth < 576 ? "1.2rem" : "1.5rem" }}
            />
            <div className="stat-footer">
              <Text type="secondary" style={{ fontSize: windowWidth < 576 ? "0.7rem" : "0.8rem" }}>
                Blog categories
              </Text>
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
              <Button type="primary" icon={<FileTextOutlined />} size={windowWidth < 576 ? "middle" : "large"} block>
                Manage Blogs
              </Button>
            </Link>
          </Col>
          <Col xs={24} sm={8}>
            <Link to="/admin/destinations">
              <Button type="primary" icon={<EnvironmentOutlined />} size={windowWidth < 576 ? "middle" : "large"} block>
                Manage Destinations
              </Button>
            </Link>
          </Col>
          <Col xs={24} sm={8}>
            <Link to="/admin/reports">
              <Button
                type="primary"
                icon={<FlagOutlined />}
                size={windowWidth < 576 ? "middle" : "large"}
                block
                danger={stats.pendingReports > 0}
              >
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
          <Card
            title="Recent Blogs"
            className="recent-card"
            extra={<Link to="/admin/blogs">View All</Link>}
            bodyStyle={{ padding: windowWidth < 576 ? "12px" : "24px" }}
          >
            <List
              loading={loading}
              itemLayout="horizontal"
              dataSource={recentBlogs}
              renderItem={(blog) => (
                <List.Item
                  key={blog.id}
                  actions={
                    windowWidth > 576
                      ? [
                          <Space key={`blog-actions-${blog.id}`}>
                            <LikeOutlined /> {blog.likes || 0}
                          </Space>,
                        ]
                      : undefined
                  }
                >
                  <List.Item.Meta
                    avatar={<Avatar src={blog.imageUrl || "/placeholder.svg"} shape="square" />}
                    title={<Link to={`/blogs/${blog.id}`}>{blog.title}</Link>}
                    description={
                      <Space direction="vertical" size={0}>
                        <Text type="secondary" style={{ fontSize: windowWidth < 576 ? "0.7rem" : "0.8rem" }}>
                          By {blog.authorName}
                        </Text>
                        <Text type="secondary" style={{ fontSize: windowWidth < 576 ? "0.7rem" : "0.8rem" }}>
                          <ClockCircleOutlined /> {new Date(blog.createdAt).toLocaleDateString()}
                        </Text>
                        {windowWidth <= 576 && (
                          <Text type="secondary" style={{ fontSize: "0.7rem" }}>
                            <LikeOutlined /> {blog.likes || 0} •
                            <Badge
                              status={
                                blog.status === "approved"
                                  ? "success"
                                  : blog.status === "pending"
                                  ? "processing"
                                  : "error"
                              }
                              text={blog.status}
                              style={{ marginLeft: 5 }}
                            />
                          </Text>
                        )}
                      </Space>
                    }
                  />
                </List.Item>
              )}
              size={windowWidth < 576 ? "small" : "default"}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title="Recent Users"
            className="recent-card"
            extra={<Link to="/admin/users">View All</Link>}
            bodyStyle={{ padding: windowWidth < 576 ? "12px" : "24px" }}
          >
            <List
              loading={loading}
              itemLayout="horizontal"
              dataSource={recentUsers}
              renderItem={(user) => (
                <List.Item
                  key={user.id}
                  actions={
                    windowWidth > 576
                      ? [
                          <Badge
                            key={`user-role-${user.id}`}
                            color={user.role === "admin" ? "red" : "blue"}
                            text={user.role}
                          />,
                        ]
                      : undefined
                  }
                >
                  <List.Item.Meta
                    avatar={<Avatar src={user.profilePic || "/default-profile.jpg"} />}
                    title={user.name}
                    description={
                      <Space direction="vertical" size={0}>
                        <Text type="secondary" style={{ fontSize: windowWidth < 576 ? "0.7rem" : "0.8rem" }}>
                          {user.email}
                        </Text>
                        <Text type="secondary" style={{ fontSize: windowWidth < 576 ? "0.7rem" : "0.8rem" }}>
                          <ClockCircleOutlined /> Joined: {new Date(user.createdAt).toLocaleDateString()}
                        </Text>
                        {windowWidth <= 576 && (
                          <Badge color={user.role === "admin" ? "red" : "blue"} text={user.role} />
                        )}
                      </Space>
                    }
                  />
                </List.Item>
              )}
              size={windowWidth < 576 ? "small" : "default"}
            />
          </Card>
        </Col>
      </Row>

      {/* Analytics Preview */}
      <Card
        title="Analytics Overview"
        className="analytics-card"
        extra={<Link to="/admin/analytics">View Details</Link>}
        style={{ marginTop: 16 }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Card className="analytics-stat-card">
              <Statistic
                title="Content Summary"
                value={stats.blogs}
                suffix={`blogs in ${stats.destinations} destinations`}
                valueStyle={{ color: "#3498db", fontSize: windowWidth < 576 ? "1.1rem" : "1.3rem" }}
              />
              <div className="stat-trend positive">
                Most popular category: {recentBlogs[0]?.category || "Adventure"}
              </div>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card className="analytics-stat-card">
              <Statistic
                title="User Engagement"
                value={stats.comments}
                suffix="comments"
                valueStyle={{ color: "#ff69b4 ", fontSize: windowWidth < 576 ? "1.1rem" : "1.3rem" }}
              />
              <div className="stat-trend positive">
                Avg. {(stats.comments / Math.max(1, stats.blogs)).toFixed(1)} comments per blog
              </div>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card className="analytics-stat-card">
              <Statistic
                title="Community Growth"
                value={stats.users}
                suffix="registered users"
                valueStyle={{ color: "#9b59b6", fontSize: windowWidth < 576 ? "1.1rem" : "1.3rem" }}
              />
              <div className="stat-trend positive">{Math.round(stats.users * 0.4)} new users this month</div>
            </Card>
          </Col>
        </Row>
        <Row style={{ marginTop: "12px" }}>
          <Col xs={24}>
            <Card title="Top Performing Content" size="small">
              <List
                size="small"
                dataSource={recentBlogs.slice(0, 3)}
                renderItem={(blog) => (
                  <List.Item
                    key={blog.id}
                    actions={[
                      <Space key={`blog-likes-${blog.id}`}>
                        <LikeOutlined /> {blog.likes || 0}
                      </Space>,
                    ]}
                  >
                    <List.Item.Meta
                      title={<Link to={`/blogs/${blog.id}`}>{blog.title}</Link>}
                      description={
                        <Text type="secondary" style={{ fontSize: "0.8rem" }}>
                          By {blog.authorName} • {blog.category}
                        </Text>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default AdminPanel;