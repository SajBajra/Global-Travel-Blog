import { Link } from "react-router"
import { Card, Row, Col, Typography, Button } from "antd"
import { EnvironmentOutlined, FileTextOutlined, UserOutlined } from "@ant-design/icons"
import "./AdminPanel.css"

const { Title, Paragraph } = Typography

const AdminPanel = () => {
  return (
    <div className="admin-panel">
      <div className="admin-header">
        <Title level={1}>Admin Dashboard</Title>
        <Paragraph>Manage your travel blog platform</Paragraph>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} sm={24} md={8}>
          <Card hoverable className="admin-card" cover={<EnvironmentOutlined className="admin-card-icon" />}>
            <Card.Meta title="Manage Destinations" description="Add, edit, or remove travel destinations" />
            <div className="admin-card-action">
              <Button type="primary" size="large">
                <Link to="/admin/destinations">Manage Destinations</Link>
              </Button>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={24} md={8}>
          <Card hoverable className="admin-card" cover={<FileTextOutlined className="admin-card-icon" />}>
            <Card.Meta title="Manage Blogs" description="Review, approve, or delete user blogs" />
            <div className="admin-card-action">
              <Button type="primary" size="large">
                <Link to="/admin/blogs">Manage Blogs</Link>
              </Button>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={24} md={8}>
          <Card hoverable className="admin-card" cover={<UserOutlined className="admin-card-icon" />}>
            <Card.Meta title="Manage Users" description="View and manage user accounts" />
            <div className="admin-card-action">
              <Button type="primary" size="large">
                <Link to="/admin/users">Manage Users</Link>
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default AdminPanel

