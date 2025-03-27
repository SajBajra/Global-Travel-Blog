"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import {
  Table,
  Button,
  Space,
  Typography,
  Card,
  Row,
  Col,
  Tag,
  Badge,
  Drawer,
  Descriptions,
  Tabs,
  Divider,
  Alert,
} from "antd"
import { CheckCircleOutlined, CloseCircleOutlined, EyeOutlined, DeleteOutlined, LinkOutlined } from "@ant-design/icons"
import { Link } from "react-router-dom"
import "./AdminPages.css"

const { Title, Text, Paragraph } = Typography
const { TabPane } = Tabs

const ManageReports = () => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState(null)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [reportContent, setReportContent] = useState(null)
  const [activeTab, setActiveTab] = useState("pending")
  const [users, setUsers] = useState([])

  useEffect(() => {
    fetchReports()
    fetchUsers()
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

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:3001/users")
      setUsers(response.data)
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const getUserName = (userId) => {
    const user = users.find((u) => u.id === userId)
    return user ? user.name : `User ${userId}`
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
            blogId: blogResponse.data.id,
          }))
        }
      }
    } catch (error) {
      console.error("Error fetching reported content:", error)
      if (error.response && error.response.status === 404) {
        setReportContent({ notFound: true })
        toast.error("The reported content has already been deleted")
      } else {
        toast.error("Failed to load reported content")
      }
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
      await axios.patch(`http://localhost:3001/reports/${id}`, {
        status: "resolved",
        resolvedAt: new Date().toISOString(),
      })

      // Update local state
      setReports(
        reports.map((report) =>
          report.id === id
            ? {
                ...report,
                status: "resolved",
                resolvedAt: new Date().toISOString(),
              }
            : report,
        ),
      )

      toast.success("Report marked as resolved")

      if (selectedReport && selectedReport.id === id) {
        setSelectedReport({
          ...selectedReport,
          status: "resolved",
          resolvedAt: new Date().toISOString(),
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
      await axios.patch(`http://localhost:3001/reports/${id}`, {
        status: "rejected",
        resolvedAt: new Date().toISOString(),
      })

      // Update local state
      setReports(
        reports.map((report) =>
          report.id === id
            ? {
                ...report,
                status: "rejected",
                resolvedAt: new Date().toISOString(),
              }
            : report,
        ),
      )

      toast.success("Report rejected")

      if (selectedReport && selectedReport.id === id) {
        setSelectedReport({
          ...selectedReport,
          status: "rejected",
          resolvedAt: new Date().toISOString(),
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

        // Also delete all comments associated with this blog
        const commentsResponse = await axios.get(`http://localhost:3001/comments?blogId=${report.blogId}`)
        for (const comment of commentsResponse.data) {
          await axios.delete(`http://localhost:3001/comments/${comment.id}`)
        }

        toast.success("Blog and its comments deleted successfully")
      } else if (report.type === "comment" && report.commentId) {
        // Delete the comment
        await axios.delete(`http://localhost:3001/comments/${report.commentId}`)

        // Also delete all replies to this comment
        const repliesResponse = await axios.get(`http://localhost:3001/comments?parentId=${report.commentId}`)
        for (const reply of repliesResponse.data) {
          await axios.delete(`http://localhost:3001/comments/${reply.id}`)
        }

        toast.success("Comment and its replies deleted successfully")
      }

      // Update report status
      await axios.patch(`http://localhost:3001/reports/${report.id}`, {
        status: "resolved",
        resolvedAt: new Date().toISOString(),
        actionTaken: "deleted",
      })

      // Update local state
      setReports(
        reports.map((r) =>
          r.id === report.id
            ? {
                ...r,
                status: "resolved",
                resolvedAt: new Date().toISOString(),
                actionTaken: "deleted",
              }
            : r,
        ),
      )

      setReportContent({ deleted: true })

      setTimeout(() => {
        closeDrawer()
      }, 2000)
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
      render: (_, record) => <span>{getUserName(record.userId)}</span>,
    },
    {
      title: "Reason",
      dataIndex: "reason",
      key: "reason",
      render: (reason) => reason || "No reason provided",
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
              <Descriptions.Item label="Reported By">{getUserName(selectedReport.userId)}</Descriptions.Item>
              <Descriptions.Item label="Reason">{selectedReport.reason || "No reason provided"}</Descriptions.Item>
              <Descriptions.Item label="Date">{new Date(selectedReport.createdAt).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="Status">{getStatusBadge(selectedReport.status)}</Descriptions.Item>
              {selectedReport.resolvedAt && (
                <Descriptions.Item label="Resolved At">
                  {new Date(selectedReport.resolvedAt).toLocaleString()}
                </Descriptions.Item>
              )}
              {selectedReport.actionTaken && (
                <Descriptions.Item label="Action Taken">
                  <Tag color="red">Content {selectedReport.actionTaken}</Tag>
                </Descriptions.Item>
              )}
            </Descriptions>

            <Divider />

            {reportContent && (
              <div>
                <Title level={4}>Reported Content</Title>

                {reportContent.deleted && (
                  <Alert
                    message="Content Deleted"
                    description="This content has been deleted successfully."
                    type="success"
                    showIcon
                  />
                )}

                {reportContent.notFound && (
                  <Alert
                    message="Content Not Found"
                    description="The reported content has already been deleted."
                    type="info"
                    showIcon
                  />
                )}

                {!reportContent.notFound && !reportContent.deleted && (
                  <>
                    {selectedReport.type === "blog" ? (
                      <>
                        <Descriptions bordered column={1}>
                          <Descriptions.Item label="Blog Title">{reportContent.title}</Descriptions.Item>
                          <Descriptions.Item label="Author">{reportContent.authorName}</Descriptions.Item>
                          <Descriptions.Item label="View Blog">
                            <Link to={`/blogs/${reportContent.id}`} target="_blank">
                              <LinkOutlined /> Open Blog in New Tab
                            </Link>
                          </Descriptions.Item>
                        </Descriptions>
                        <div style={{ marginTop: 16 }}>
                          <Text strong>Content:</Text>
                          <Paragraph ellipsis={{ rows: 5, expandable: true }}>{reportContent.content}</Paragraph>
                        </div>
                      </>
                    ) : (
                      <>
                        <Descriptions bordered column={1}>
                          <Descriptions.Item label="Comment By">{reportContent.userName}</Descriptions.Item>
                          {reportContent.blogTitle && (
                            <>
                              <Descriptions.Item label="On Blog">{reportContent.blogTitle}</Descriptions.Item>
                              <Descriptions.Item label="View Blog">
                                <Link to={`/blogs/${reportContent.blogId}`} target="_blank">
                                  <LinkOutlined /> Open Blog in New Tab
                                </Link>
                              </Descriptions.Item>
                            </>
                          )}
                          <Descriptions.Item label="Comment Date">
                            {new Date(reportContent.createdAt).toLocaleString()}
                          </Descriptions.Item>
                        </Descriptions>
                        <div style={{ marginTop: 16 }}>
                          <Text strong>Comment Content:</Text>
                          <Paragraph>{reportContent.content}</Paragraph>
                        </div>
                      </>
                    )}

                    <div style={{ marginTop: 24 }}>
                      <Button
                        type="primary"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteReportedContent(selectedReport)}
                      >
                        Delete Reported Content
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </Drawer>
    </div>
  )
}

export default ManageReports

