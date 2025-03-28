import { useState, useEffect } from "react"
import { blogUtil, categoryUtil } from "../../util"
import {
  Table,
  Button,
  Space,
  Typography,
  Popconfirm,
  Image,
  Card,
  Row,
  Col,
  Tag,
  Select,
  Badge,
  Drawer,
  Descriptions,
  Tooltip,
} from "antd"
import { DeleteOutlined, EyeOutlined } from "@ant-design/icons"
import "./AdminPages.css"

const { Title, Text, Paragraph } = Typography
const { Option } = Select

const ManageBlogs = () => {
  const [blogs, setBlogs] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedBlog, setSelectedBlog] = useState(null)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch blogs
        const blogsData = await blogUtil.getAllBlogs("createdAt", "desc")
        setBlogs(blogsData)

        // Fetch categories
        const categoriesData = await categoryUtil.getAllCategories()
        setCategories(categoriesData)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  const showDrawer = (blog) => {
    setSelectedBlog(blog)
    setDrawerVisible(true)
  }

  const closeDrawer = () => {
    setDrawerVisible(false)
  }

  const handleDeleteBlog = async (id) => {
    try {
      const result = await blogUtil.deleteBlog(id)

      if (result.success) {
        setBlogs((prev) => prev.filter((blog) => blog.id !== id))

        if (selectedBlog && selectedBlog.id === id) {
          setDrawerVisible(false)
        }
      }
    } catch (error) {
      console.error("Error deleting blog:", error)
    }
  }

  const handleCategoryChange = async (blogId, categoryName) => {
    try {
      const result = await blogUtil.updateBlog(blogId, { category: categoryName })

      if (result.success) {
        setBlogs((prev) => prev.map((blog) => (blog.id === blogId ? { ...blog, category: categoryName } : blog)))

        if (selectedBlog && selectedBlog.id === blogId) {
          setSelectedBlog((prev) => ({ ...prev, category: categoryName }))
        }
      }
    } catch (error) {
      console.error("Error updating blog category:", error)
    }
  }

  // Filter blogs based on category and status
  const filteredBlogs = blogs.filter((blog) => {
    const matchesCategory = selectedCategory ? blog.category === selectedCategory : true
    const matchesStatus = filterStatus ? blog.status === filterStatus : true
    return matchesCategory && matchesStatus
  })

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return <Badge status="success" text="Approved" />
      case "rejected":
        return <Badge status="error" text="Rejected" />
      case "pending":
        return <Badge status="processing" text="Pending" />
      default:
        return <Badge status="default" text={status} />
    }
  }

  const getColumns = () => {
    const baseColumns = [
      {
        title: "Image",
        dataIndex: "imageUrl",
        key: "imageUrl",
        render: (imageUrl) => (
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt="Blog"
            width={80}
            height={60}
            style={{ objectFit: "cover" }}
          />
        ),
        responsive: ["md"],
      },
      {
        title: "Title",
        dataIndex: "title",
        key: "title",
        sorter: (a, b) => a.title.localeCompare(b.title),
        ellipsis: true,
      },
      {
        title: "Author",
        dataIndex: "authorName",
        key: "authorName",
        responsive: ["lg"],
      },
      {
        title: "Category",
        dataIndex: "category",
        key: "category",
        render: (category) => <Tag color="blue">{category}</Tag>,
        responsive: ["md"],
      },
      {
        title: "Date",
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
          <Space size="small" wrap>
            {windowWidth <= 576 ? (
              <>
                <Tooltip title="View">
                  <Button icon={<EyeOutlined />} onClick={() => showDrawer(record)} size="small" />
                </Tooltip>
                <Tooltip title="Delete">
                  <Popconfirm
                    title="Delete this blog?"
                    onConfirm={() => handleDeleteBlog(record.id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button type="primary" danger icon={<DeleteOutlined />} size="small" />
                  </Popconfirm>
                </Tooltip>
              </>
            ) : (
              <>
                <Button icon={<EyeOutlined />} onClick={() => showDrawer(record)}>
                  {windowWidth > 768 ? "View" : ""}
                </Button>
                <Popconfirm
                  title="Are you sure you want to delete this blog?"
                  onConfirm={() => handleDeleteBlog(record.id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button type="primary" danger icon={<DeleteOutlined />}>
                    {windowWidth > 768 ? "Delete" : ""}
                  </Button>
                </Popconfirm>
              </>
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
          <Title level={2}>Manage Blogs</Title>
        </Col>
        <Col xs={24} md={12} lg={8}>
          <Space direction={windowWidth < 768 ? "vertical" : "horizontal"} style={{ width: "100%" }}>
            <Select
              placeholder="Filter by Category"
              style={{ width: "100%" }}
              allowClear
              onChange={setSelectedCategory}
              value={selectedCategory}
            >
              {categories.map((category) => (
                <Option key={category.id} value={category.name}>
                  {category.name}
                </Option>
              ))}
            </Select>
            <Select
              placeholder="Filter by Status"
              style={{ width: "100%" }}
              allowClear
              onChange={setFilterStatus}
              value={filterStatus}
            >
              <Option value="approved">Approved</Option>
              <Option value="rejected">Rejected</Option>
            </Select>
          </Space>
        </Col>
      </Row>

      <Card>
        <Table
          columns={getColumns()}
          dataSource={filteredBlogs}
          rowKey="id"
          loading={loading}
          scroll={{ x: "max-content" }}
          pagination={{
            responsive: true,
            showSizeChanger: windowWidth > 576,
            defaultPageSize: windowWidth <= 576 ? 5 : 10,
          }}
        />
      </Card>

      <Drawer
        title="Blog Details"
        placement="right"
        onClose={closeDrawer}
        open={drawerVisible}
        width={windowWidth < 768 ? "100%" : 600}
        extra={
          <Space>
            <Popconfirm
              title="Are you sure you want to delete this blog?"
              onConfirm={() => {
                handleDeleteBlog(selectedBlog.id)
                closeDrawer()
              }}
              okText="Yes"
              cancelText="No"
            >
              <Button type="primary" danger icon={<DeleteOutlined />}>
                Delete
              </Button>
            </Popconfirm>
          </Space>
        }
      >
        {selectedBlog && (
          <>
            <div style={{ marginBottom: 16 }}>
              <Image
                src={selectedBlog.imageUrl || "/placeholder.svg"}
                alt={selectedBlog.title}
                style={{ width: "100%", maxHeight: 300, objectFit: "cover" }}
              />
            </div>

            <Descriptions
              title="Blog Information"
              bordered
              column={1}
              layout={windowWidth < 576 ? "vertical" : "horizontal"}
            >
              <Descriptions.Item label="Title">{selectedBlog.title}</Descriptions.Item>
              <Descriptions.Item label="Author">{selectedBlog.authorName}</Descriptions.Item>
              <Descriptions.Item label="Date">
                {new Date(selectedBlog.createdAt).toLocaleDateString()}
              </Descriptions.Item>
              <Descriptions.Item label="Status">{getStatusBadge(selectedBlog.status)}</Descriptions.Item>
              <Descriptions.Item label="Category">
                <Select
                  value={selectedBlog.category}
                  style={{ width: "100%" }}
                  onChange={(value) => handleCategoryChange(selectedBlog.id, value)}
                >
                  {categories.map((category) => (
                    <Option key={category.id} value={category.name}>
                      {category.name}
                    </Option>
                  ))}
                </Select>
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 24 }}>
              <Title level={4}>Content</Title>
              <Paragraph>{selectedBlog.content}</Paragraph>
            </div>
          </>
        )}
      </Drawer>
    </div>
  )
}

export default ManageBlogs

