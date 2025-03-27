import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { Table, Button, Space, Modal, Form, Input, Typography, Popconfirm, Card, Row, Col, Tag } from "antd"
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons"
import "./AdminPages.css"

const { Title } = Typography

const ManageCategories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:3001/categories")
      setCategories(response.data)
    } catch (error) {
      console.error("Error fetching categories:", error)
      toast.error("Failed to load categories")
    } finally {
      setLoading(false)
    }
  }

  const showModal = (category = null) => {
    setEditingCategory(category)
    if (category) {
      form.setFieldsValue({
        name: category.name,
      })
    } else {
      form.resetFields()
    }
    setIsModalVisible(true)
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    setEditingCategory(null)
    form.resetFields()
  }

  const handleDelete = async (id) => {
    try {
      // Check if category is in use
      const blogsResponse = await axios.get(
        `http://localhost:3001/blogs?category=${categories.find((c) => c.id === id).name}`,
      )

      if (blogsResponse.data.length > 0) {
        toast.error("Cannot delete category that is in use by blogs")
        return
      }

      await axios.delete(`http://localhost:3001/categories/${id}`)
      setCategories((prev) => prev.filter((cat) => cat.id !== id))
      toast.success("Category deleted successfully")
    } catch (error) {
      console.error("Error deleting category:", error)
      toast.error("Failed to delete category")
    }
  }

  const handleSubmit = async (values) => {
    try {
      if (editingCategory) {
        await axios.put(`http://localhost:3001/categories/${editingCategory.id}`, values)
        toast.success("Category updated successfully")
      } else {
        await axios.post("http://localhost:3001/categories", values)
        toast.success("Category added successfully")
      }

      setIsModalVisible(false)
      fetchCategories()
    } catch (error) {
      console.error("Error saving category:", error)
      toast.error("Failed to save category")
    }
  }

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name) => <Tag color="blue">{name}</Tag>,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" icon={<EditOutlined />} onClick={() => showModal(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this category?"
            onConfirm={() => handleDelete(record.id)}
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
          <Title level={2}>Manage Categories</Title>
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => showModal()}>
            Add Category
          </Button>
        </Col>
      </Row>

      <Card>
        <Table columns={columns} dataSource={categories} rowKey="id" loading={loading} />
      </Card>

      <Modal
        title={editingCategory ? "Edit Category" : "Add Category"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Category Name"
            rules={[{ required: true, message: "Please enter category name" }]}
          >
            <Input placeholder="Enter category name" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingCategory ? "Update Category" : "Add Category"}
              </Button>
              <Button onClick={handleCancel}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ManageCategories

