"use client"

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
} from "antd"
import { CheckCircleOutlined, CloseCircleOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons"
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
  }, [])

  const showDrawer = (blog) => {
    setSelectedBlog(blog)
    setDrawerVisible(true)
  }

  const closeDrawer = () => {
    setDrawerVisible(false)
  }

  const handleApproveBlog = async (id) => {
    try {
      await axios.patch(`http://localhost:3001/blogs/${id}`, { status: "approved" })
      setBlogs((prev) => prev.map((blog) => (blog.id === id ? { ...blog, status: "approved" } : blog)))
      toast.success("Blog approved successfully")

      if (selectedBlog && selectedBlog.id === id) {
        setSelectedBlog((prev) => ({ ...prev, status: "approved" }))
      }
    } catch (error) {
      console.error("Error approving blog:", error)
      toast.error("Failed to approve blog")
    }
  }

  const handleRejectBlog = async (id) => {
    try {
      await axios.patch(`http://localhost:3001/blogs/${id}`, { status: "rejected" })
      setBlogs((prev) => prev.map((blog) => (blog.id === id ? { ...blog, status: "rejected" } : blog)))
      toast.success("Blog rejected")

      if (selectedBlog && selectedBlog.id === id) {
        setSelectedBlog((prev) => ({ ...prev, status: "rejected" }))
      }
    } catch (error) {
      console.error("Error rejecting blog:", error)
      toast.error("Failed to reject blog")
    }
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

  const columns = [
    {
      title: "Image",
      dataIndex: "imageUrl",
      key: "imageUrl",
      render: (imageUrl) => (
        <Image src={imageUrl || "/placeholder.svg"} alt="Blog" width={80} height={60} style={{ objectFit: "cover" }} />
      ),
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: "Author",
      dataIndex: "authorName",
      key: "authorName",
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (category) => <Tag color="blue">{category}</Tag>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusBadge(status),
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Button icon={<EyeOutlined />} onClick={() => showDrawer(record)}>
            View
          </Button>
          {record.status === "pending" && (
            <>
              <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => handleApproveBlog(record.id)}>
                Approve
              </Button>
              <Button danger icon={<CloseCircleOutlined />} onClick={() => handleRejectBlog(record.id)}>
                Reject
              </Button>
            </>
          )}
          <Popconfirm
            title="Are you sure you want to delete this blog?"
            onConfirm={() => handleDeleteBlog(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="primary" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div className="admin-manage-page">
      <Row justify="space-between" align="middle" className="page-header">
        <Col>
          <Title level={2}>Manage Blogs</Title>
        </Col>
        <Col>
          <Space>
            <Select
              placeholder="Filter by Category"
              style={{ width: 200 }}
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
              style={{ width: 200 }}
              allowClear
              onChange={setFilterStatus}
              value={filterStatus}
            >
              <Option value="pending">Pending</Option>
              <Option value="approved">Approved</Option>
              <Option value="rejected">Rejected</Option>
            </Select>
          </Space>
        </Col>
      </Row>

      <Card>
        <Table columns={columns} dataSource={filteredBlogs} rowKey="id" loading={loading} />
      </Card>

      <Drawer
        title="Blog Details"
        placement="right"
        onClose={closeDrawer}
        open={drawerVisible}
        width={600}
        extra={
          <Space>
            {selectedBlog && selectedBlog.status === "pending" && (
              <>
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleApproveBlog(selectedBlog.id)}
                >
                  Approve
                </Button>
                <Button danger icon={<CloseCircleOutlined />} onClick={() => handleRejectBlog(selectedBlog.id)}>
                  Reject
                </Button>
              </>
            )}
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

            <Descriptions title="Blog Information" bordered column={1}>
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

