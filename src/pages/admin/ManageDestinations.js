import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Typography,
  Popconfirm,
  Upload,
  Image,
  Card,
  Row,
  Col,
  Tag,
} from "antd"
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  MinusCircleOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons"
import "./AdminPages.css"

const { Title, Text } = Typography
const { TextArea } = Input

const ManageDestinations = () => {
  const [destinations, setDestinations] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingDestination, setEditingDestination] = useState(null)
  const [form] = Form.useForm()
  const [imageUrl, setImageUrl] = useState("")
  const [previewImage, setPreviewImage] = useState("")
  const [fileList, setFileList] = useState([])

  useEffect(() => {
    fetchDestinations()
  }, [])

  const fetchDestinations = async () => {
    try {
      const response = await axios.get("http://localhost:3001/destinations")
      setDestinations(response.data)
    } catch (error) {
      console.error("Error fetching destinations:", error)
      toast.error("Failed to load destinations")
    } finally {
      setLoading(false)
    }
  }

  const showModal = (destination = null) => {
    setEditingDestination(destination)
    if (destination) {
      form.setFieldsValue({
        name: destination.name,
        country: destination.country,
        description: destination.description,
        climate: destination.climate,
        bestTimeToVisit: destination.bestTimeToVisit,
        attractions: destination.attractions,
      })
      setImageUrl(destination.imageUrl)
      setPreviewImage(destination.imageUrl)
      setFileList(
        destination.imageUrl
          ? [
              {
                uid: "-1",
                name: "image.png",
                status: "done",
                url: destination.imageUrl,
              },
            ]
          : [],
      )
    } else {
      form.resetFields()
      setImageUrl("")
      setPreviewImage("")
      setFileList([])
    }
    setIsModalVisible(true)
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    setEditingDestination(null)
    form.resetFields()
    setFileList([])
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/destinations/${id}`)
      setDestinations((prev) => prev.filter((dest) => dest.id !== id))
      toast.success("Destination deleted successfully")
    } catch (error) {
      console.error("Error deleting destination:", error)
      toast.error("Failed to delete destination")
    }
  }

  const handleImageChange = (info) => {
    if (info.file.status === "uploading") {
      setFileList(info.fileList)
      return
    }

    if (info.file.status === "done" || info.file.status === "error") {
      setFileList(info.fileList)
    }

    if (info.file.status === "removed") {
      setPreviewImage("")
      setImageUrl("")
      setFileList([])
      return
    }

    if (info.file.originFileObj) {
      const reader = new FileReader()
      reader.addEventListener("load", () => {
        setPreviewImage(reader.result)
        setImageUrl(reader.result)
      })
      reader.readAsDataURL(info.file.originFileObj)
    }
  }

  const handleSubmit = async (values) => {
    if (!imageUrl) {
      toast.error("Please upload an image")
      return
    }

    try {
      const destinationData = {
        ...values,
        imageUrl,
      }

      if (editingDestination) {
        await axios.put(`http://localhost:3001/destinations/${editingDestination.id}`, destinationData)
        toast.success("Destination updated successfully")
      } else {
        await axios.post("http://localhost:3001/destinations", destinationData)
        toast.success("Destination added successfully")
      }

      setIsModalVisible(false)
      fetchDestinations()
    } catch (error) {
      console.error("Error saving destination:", error)
      toast.error("Failed to save destination")
    }
  }

  const columns = [
    {
      title: "Image",
      dataIndex: "imageUrl",
      key: "imageUrl",
      render: (imageUrl) => (
        <Image
          src={imageUrl || "/placeholder.svg"}
          alt="Destination"
          width={80}
          height={60}
          style={{ objectFit: "cover" }}
        />
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Country",
      dataIndex: "country",
      key: "country",
      sorter: (a, b) => a.country.localeCompare(b.country),
    },
    {
      title: "Climate",
      dataIndex: "climate",
      key: "climate",
    },
    {
      title: "Best Time to Visit",
      dataIndex: "bestTimeToVisit",
      key: "bestTimeToVisit",
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
            title="Are you sure you want to delete this destination?"
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
          <Title level={2}>Manage Destinations</Title>
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => showModal()}>
            Add Destination
          </Button>
        </Col>
      </Row>

      <Card>
        <Table
          columns={columns}
          dataSource={destinations}
          rowKey="id"
          loading={loading}
          expandable={{
            expandedRowRender: (record) => (
              <div style={{ margin: 0 }}>
                <Text strong>Description:</Text>
                <p>{record.description}</p>
                <Text strong>Attractions:</Text>
                <div>
                  {record.attractions.map((attraction, index) => (
                    <Tag color="blue" key={index}>
                      {attraction}
                    </Tag>
                  ))}
                </div>
              </div>
            ),
          }}
          responsive
        />
      </Card>

      <Modal
        title={editingDestination ? "Edit Destination" : "Add Destination"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="name"
                label="Destination Name"
                rules={[{ required: true, message: "Please enter destination name" }]}
              >
                <Input placeholder="Enter destination name" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="country" label="Country" rules={[{ required: true, message: "Please enter country" }]}>
                <Input placeholder="Enter country" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Please enter description" }]}
          >
            <TextArea rows={4} placeholder="Enter description" />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="climate" label="Climate">
                <Input placeholder="Enter climate" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="bestTimeToVisit" label="Best Time to Visit">
                <Input placeholder="Enter best time to visit" />
              </Form.Item>
            </Col>
          </Row>

          <Form.List name="attractions">
            {(fields, { add, remove }) => (
              <>
                <div
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}
                >
                  <Text strong>Attractions</Text>
                  <Button type="dashed" onClick={() => add()} icon={<PlusCircleOutlined />}>
                    Add Attraction
                  </Button>
                </div>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} style={{ display: "flex", marginBottom: 8, alignItems: "center" }}>
                    <Form.Item
                      {...restField}
                      name={[name]}
                      style={{ marginBottom: 0, flex: 1 }}
                      rules={[{ required: true, message: "Please enter attraction" }]}
                    >
                      <Input placeholder="Enter attraction" />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} style={{ marginLeft: 8, color: "#ff4d4f" }} />
                  </div>
                ))}
              </>
            )}
          </Form.List>
          <Form.Item label="Destination Image" rules={[{ required: true, message: "Please upload an image" }]}>
  <Upload
    name="image"
    listType="picture-card"
    fileList={fileList}
    onChange={handleImageChange}
    onRemove={() => {
      setPreviewImage("")
      setImageUrl("")
      setFileList([])
    }}
  >
    {fileList.length >= 1 ? null : (
      <div>
        <UploadOutlined />
        <div style={{ marginTop: 8 }}>Upload</div>
      </div>
    )}
  </Upload>
</Form.Item>


          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingDestination ? "Update Destination" : "Add Destination"}
              </Button>
              <Button onClick={handleCancel}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ManageDestinations

