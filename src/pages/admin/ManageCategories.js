import { useState, useEffect } from "react";
import { categoryUtil } from "../../util";
import { Table, Button, Space, Modal, Form, Input, Typography, Popconfirm, Card, Row, Col, Tag, Tooltip } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import "./AdminPages.css";

const { Title } = Typography;

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await categoryUtil.getAllCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const showModal = (category = null) => {
    setEditingCategory(category);
    form.resetFields();
    if (category) {
      form.setFieldsValue({ name: category.name });
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingCategory(null);
  };

  const handleDelete = async (id) => {
    try {
      const result = await categoryUtil.deleteCategory(id);
      if (result.success) {
        setCategories((prev) => prev.filter((cat) => cat.id !== id));
      }
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const result = editingCategory
        ? await categoryUtil.updateCategory(editingCategory.id, values.name)
        : await categoryUtil.addCategory(values.name);

      if (result.success) {
        setIsModalVisible(false);
        const categoriesData = await categoryUtil.getAllCategories();
        setCategories(categoriesData);
        setEditingCategory(null);
        form.resetFields();
      }
    } catch (error) {
      console.error("Error saving category:", error);
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      responsive: ["md"],
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
        <Space size="small">
          <Tooltip title="Edit">
            <Button type="primary" icon={<EditOutlined />} onClick={() => showModal(record)} size="small">
              {windowWidth > 576 ? "Edit" : ""}
            </Button>
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Delete this category?"
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="primary" danger icon={<DeleteOutlined />} size="small">
                {windowWidth > 576 ? "Delete" : ""}
              </Button>
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-manage-page">
      <Row justify="space-between" align="middle" className="page-header">
        <Col>
          <Title level={2}>Manage Categories</Title>
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()} size="large">
            Add Category
          </Button>
        </Col>
      </Row>

      <Card>
        <Table
          columns={columns}
          dataSource={categories}
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

      <Modal
        title={editingCategory ? "Edit Category" : "Add Category"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={windowWidth < 768 ? "95%" : 500}
        destroyOnClose={true}
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
            <Space style={{ display: "flex", justifyContent: windowWidth < 576 ? "center" : "flex-start" }}>
              <Button type="primary" htmlType="submit">
                {editingCategory ? "Update Category" : "Add Category"}
              </Button>
              <Button onClick={handleCancel}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManageCategories;