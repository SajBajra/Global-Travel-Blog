"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { Table, Button, Space, Typography, Card, Row, Col, Tag, Badge, Drawer, Descriptions, Tabs } from "antd"
import { CheckCircleOutlined, CloseCircleOutlined, EyeOutlined } from "@ant-design/icons"
import "./AdminPages.css"

const { Title, Text } = Typography
const { TabPane } = Tabs

const ManageReports = () => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState(null)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [reportContent, setReportContent] = useState(null)
  const [activeTab, setActiveTab] = useState("pending")

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const response = await axios.get("http://localhost:3001/reports?_sort=createdAt&_order=desc")
      setReports(response.data)
    } catch (error) {
      console.error("Error fetching reports:", error)
      toast.error("Failed to load reports")
    } finally {
      setLoading(false)
    }
  }

  const showDrawer = async (report) => {
    setSelectedReport(report)
    setDrawerVisible(true)

    try {
      // Fetch the reported content (blog or comment)
      if (report.type === "blog" && report.blogId) {
        const blogResponse = await axios.get(`http://localhost:3001/blogs/${report.blogId}`)
        setReportContent(blogResponse.data)
      } else if (report.type === "comment" && report.commentId) {
        const commentResponse = await axios.get(`http://localhost:3001/comments/${report.commentId}`)
        setReportContent(commentResponse.data)

        // If it's a comment, also fetch the associated blog
        if (commentResponse.data.blogId) {
          const blogResponse = await axios.get(`http://localhost:3001/blogs/${commentResponse.data.blogId}`)
          setReportContent((prev) => ({
            ...prev,
            blogTitle: blogResponse.data.title,
          }))
        }
      }
    } catch (error) {
      console.error("Error fetching reported content:", error)
      toast.error("Failed to load reported content")
    }
  }

  const closeDrawer = () => {
    setDrawerVisible(false)
    setSelectedReport(null)
    setReportContent(null)
  }

  const handleApproveReport = async (id) => {
    try {
      // Update report status
      await axios.patch(`http://localhost:3001/reports/${id}`, { status: "resolved" })

      // Update local state
      setReports(reports.map((report) => (report.id === id ? { ...report, status: "resolved" } : report)))

      toast.success("Report marked as resolved")

      if (selectedReport && selectedReport.id === id) {
        setSelectedReport({
          ...selectedReport,
          status: "resolved",
        })
      }
    } catch (error) {
      console.error("Error approving report:", error)
      toast.error("Failed to approve report")
    }
  }

  const handleRejectReport = async (id) => {
    try {
      // Update report status
      await axios.patch(`http://localhost:3001/reports/${id}`, { status: "rejected" })

      // Update local state
      setReports(reports.map((report) => (report.id === id ? { ...report, status: "rejected" } : report)))

      toast.success("Report rejected")

      if (selectedReport && selectedReport.id === id) {
        setSelectedReport({
          ...selectedReport,
          status: "rejected",
        })
      }
    } catch (error) {
      console.error("Error rejecting report:", error)
      toast.error("Failed to reject report")
    }
  }

  const handleDeleteReportedContent = async (report) => {
    try {
      if (report.type === "blog" && report.blogId) {
        // Delete the blog
        await axios.delete(`http://localhost:3001/blogs/${report.blogId}`)
        toast.success("Blog deleted successfully")
      } else if (report.type === "comment" && report.commentId) {
        // Delete the comment
        await axios.delete(`http://localhost:3001/comments/${report.commentId}`)
        toast.success("Comment deleted successfully")
      }

      // Update report status
      await axios.patch(`http://localhost:3001/reports/${report.id}`, { status: "resolved" })

      // Update local state
      setReports(reports.map((r) => (r.id === report.id ? { ...r, status: "resolved" } : r)))

      closeDrawer()
    } catch (error) {
      console.error("Error deleting reported content:", error)
      toast.error("Failed to delete reported content")
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "resolved":
        return <Badge status="success" text="Resolved" />
      case "rejected":
        return <Badge status="error" text="Rejected" />
      case "pending":
        return <Badge status="processing" text="Pending" />
      default:
        return <Badge status="default" text={status} />
    }
  }

  const filteredReports = reports.filter((report) => report.status === activeTab)

  const columns = [
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type) => <Tag color={type === "blog" ? "blue" : "green"}>{type.toUpperCase()}</Tag>,
    },
    {
      title: "Reported By",
      key: "reportedBy",
      render: (_, record) => <span>{record.userName || "User " + record.userId}</span>,
    },
    {
      title: "Reason",
      dataIndex: "reason",
      key: "reason",
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusBadge(status),
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
              <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => handleApproveReport(record.id)}>
                Approve
              </Button>
              <Button danger icon={<CloseCircleOutlined />} onClick={() => handleRejectReport(record.id)}>
                Reject
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div className="admin-manage-page">
      <Row justify="space-between" align="middle" className="page-header">
        <Col>
          <Title level={2}>Manage Reports</Title>
        </Col>
      </Row>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab={`Pending (${reports.filter((r) => r.status === "pending").length})`} key="pending" />
          <TabPane tab={`Resolved (${reports.filter((r) => r.status === "resolved").length})`} key="resolved" />
          <TabPane tab={`Rejected (${reports.filter((r) => r.status === "rejected").length})`} key="rejected" />
        </Tabs>

        <Table columns={columns} dataSource={filteredReports} rowKey="id" loading={loading} />
      </Card>

      <Drawer
        title="Report Details"
        placement="right"
        onClose={closeDrawer}
        open={drawerVisible}
        width={600}
        extra={
          selectedReport &&
          selectedReport.status === "pending" && (
            <Space>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => handleApproveReport(selectedReport.id)}
              >
                Approve
              </Button>
              <Button danger icon={<CloseCircleOutlined />} onClick={() => handleRejectReport(selectedReport.id)}>
                Reject
              </Button>
            </Space>
          )
        }
      >
        {selectedReport && (
          <>
            <Descriptions title="Report Information" bordered column={1}>
              <Descriptions.Item label="Type">
                <Tag color={selectedReport.type === "blog" ? "blue" : "green"}>{selectedReport.type.toUpperCase()}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Reported By">User ID: {selectedReport.userId}</Descriptions.Item>
              <Descriptions.Item label="Reason">{selectedReport.reason || "No reason provided"}</Descriptions.Item>
              <Descriptions.Item label="Date">{new Date(selectedReport.createdAt).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="Status">{getStatusBadge(selectedReport.status)}</Descriptions.Item>
            </Descriptions>

            {reportContent && (
              <div style={{ marginTop: 24 }}>
                <Title level={4}>Reported Content</Title>

                {selectedReport.type === "blog" ? (
                  <>
                    <Descriptions bordered column={1}>
                      <Descriptions.Item label="Blog Title">{reportContent.title}</Descriptions.Item>
                      <Descriptions.Item label="Author">{reportContent.authorName}</Descriptions.Item>
                    </Descriptions>
                    <div style={{ marginTop: 16 }}>
                      <Text strong>Content:</Text>
                      <p>{reportContent.content}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <Descriptions bordered column={1}>
                      <Descriptions.Item label="Comment By">{reportContent.userName}</Descriptions.Item>
                      {reportContent.blogTitle && (
                        <Descriptions.Item label="On Blog">{reportContent.blogTitle}</Descriptions.Item>
                      )}
                    </Descriptions>
                    <div style={{ marginTop: 16 }}>
                      <Text strong>Comment Content:</Text>
                      <p>{reportContent.content}</p>
                    </div>
                  </>
                )}

                <div style={{ marginTop: 24 }}>
                  <Button type="primary" danger onClick={() => handleDeleteReportedContent(selectedReport)}>
                    Delete Reported Content
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Drawer>
    </div>
  )
}

export default ManageReports

