import { useState, useEffect } from "react"
import { destinationUtil, toastUtil } from "../../util"
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
  Tooltip,
} from "antd"
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  MinusCircleOutlined,
  PlusCircleOutlined,
  EyeOutlined,
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
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  useEffect(() => {
    fetchDestinations()

    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  const fetchDestinations = async () => {
    try {
      const destinationsData = await destinationUtil.getAllDestinations()
      setDestinations(destinationsData)
    } catch (error) {
      console.error("Error fetching destinations:", error)
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
      const result = await destinationUtil.deleteDestination(id)
      if (result.success) {
        setDestinations((prev) => prev.filter((dest) => dest.id !== id))
      }
    } catch (error) {
      console.error("Error deleting destination:", error)
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
      toastUtil.error("Please upload an image")
      return
    }

    try {
      const destinationData = {
        ...values,
        imageUrl,
      }

      let result
      if (editingDestination) {
        result = await destinationUtil.updateDestination(editingDestination.id, destinationData)
      } else {
        result = await destinationUtil.addDestination(destinationData)
      }

      if (result.success) {
        setIsModalVisible(false)
        fetchDestinations()
      }
    } catch (error) {
      console.error("Error saving destination:", error)
    }
  }

  // Responsive columns configuration
  const getColumns = () => {
    const baseColumns = [
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
        responsive: ["md"],
      },
      {
        title: "Climate",
        dataIndex: "climate",
        key: "climate",
        responsive: ["lg"],
      },
      {
        title: "Best Time to Visit",
        dataIndex: "bestTimeToVisit",
        key: "bestTimeToVisit",
        responsive: ["lg"],
      },
      {
        title: "Actions",
        key: "actions",
        render: (_, record) => (
          <Space size="small" wrap>
            {windowWidth <= 576 ? (
              <>
                <Tooltip title="View Details">
                  <Button type="primary" icon={<EyeOutlined />} onClick={() => showModal(record)} size="small" />
                </Tooltip>
                <Tooltip title="Delete">
                  <Popconfirm
                    title="Delete this destination?"
                    onConfirm={() => handleDelete(record.id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button type="primary" danger icon={<DeleteOutlined />} size="small" />
                  </Popconfirm>
                </Tooltip>
              </>
            ) : (
              <>
                <Button type="primary" icon={<EditOutlined />} onClick={() => showModal(record)}>
                  {windowWidth > 768 ? "Edit" : ""}
                </Button>
                <Popconfirm
                  title="Are you sure you want to delete this destination?"
                  onConfirm={() => handleDelete(record.id)}
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
          columns={getColumns()}
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
          scroll={{ x: "max-content" }}
          pagination={{
            responsive: true,
            showSizeChanger: windowWidth > 576,
            defaultPageSize: windowWidth <= 576 ? 5 : 10,
          }}
        />
      </Card>

      <Modal
        title={editingDestination ? "Edit Destination" : "Add Destination"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={windowWidth < 768 ? "95%" : 800}
        destroyOnClose={true}
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
              beforeUpload={() => false}
              onChange={handleImageChange}
              onRemove={() => {
                setPreviewImage("")
                setImageUrl("")
                setFileList([])
              }}
              maxCount={1}
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
            <Space style={{ display: "flex", justifyContent: windowWidth < 576 ? "center" : "flex-start" }}>
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

