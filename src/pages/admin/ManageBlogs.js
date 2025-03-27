import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"
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
        const blogsRes = await axios.get("http://localhost:3001/blogs?_sort=createdAt&_order=desc")
        setBlogs(blogsRes.data)

        // Fetch categories
        const categoriesRes = await axios.get("http://localhost:3001/categories")
        setCategories(categoriesRes.data)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Failed to load data")
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
      await axios.delete(`http://localhost:3001/blogs/${id}`)
      setBlogs((prev) => prev.filter((blog) => blog.id !== id))
      toast.success("Blog deleted successfully")

      if (selectedBlog && selectedBlog.id === id) {
        setDrawerVisible(false)
      }
    } catch (error) {
      console.error("Error deleting blog:", error)
      toast.error("Failed to delete blog")
    }
  }

  const handleCategoryChange = async (blogId, categoryName) => {
    try {
      await axios.patch(`http://localhost:3001/blogs/${blogId}`, { category: categoryName })
      setBlogs((prev) => prev.map((blog) => (blog.id === blogId ? { ...blog, category: categoryName } : blog)))
      toast.success("Blog category updated")

      if (selectedBlog && selectedBlog.id === blogId) {
        setSelectedBlog((prev) => ({ ...prev, category: categoryName }))
      }
    } catch (error) {
      console.error("Error updating blog category:", error)
      toast.error("Failed to update blog category")
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
  <Col xs={24} md={12} lg={8} style={{ display: "flex", justifyContent: "end" }}>
    <Space
      direction={windowWidth < 768 ? "vertical" : "horizontal"}
      style={{ width: "100%", maxWidth: "300px" }}
    >
      <Select
        placeholder="Filter by Category"
        style={{ minWidth: "200px", width: "100%" }}
        allowClear
        onChange={(value) => {
          if (value === "All") {
            setSelectedCategory(null);  // Clears the selected category if "All" is chosen
          } else {
            setSelectedCategory(value); // Otherwise set the selected category
          }
        }}
        value={selectedCategory || undefined} // 'undefined' will let the select show as if nothing is selected
      >
        <Option key="all" value="All">All Categories</Option>
        {categories.map((category) => (
          <Option key={category.id} value={category.name}>
            {category.name}
          </Option>
        ))}
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

