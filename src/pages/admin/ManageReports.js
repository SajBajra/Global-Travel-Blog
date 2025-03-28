import { useState, useEffect } from "react"
import { reportUtil, blogUtil, commentUtil, toastUtil } from "../../util"
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
  Tooltip,
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
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  useEffect(() => {
    fetchReports()
    fetchUsers()

    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  const fetchReports = async () => {
    try {
      const reportsData = await reportUtil.getAllReports()
      setReports(reportsData)
    } catch (error) {
      console.error("Error fetching reports:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      // We'll use a direct API call here since userUtil doesn't have a getAllUsers method
      // In a real application, you would add this method to userUtil
      const response = await fetch("http://localhost:3001/users")
      const data = await response.json()
      setUsers(data)
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
        const blogData = await blogUtil.getBlogById(report.blogId)
        setReportContent(blogData)
      } else if (report.type === "comment" && report.commentId) {
        // We'll use a direct API call here since commentUtil doesn't have a getCommentById method
        // In a real application, you would add this method to commentUtil
        const response = await fetch(`http://localhost:3001/comments/${report.commentId}`)
        const commentData = await response.json()
        setReportContent(commentData)

        // If it's a comment, also fetch the associated blog
        if (commentData.blogId) {
          const blogData = await blogUtil.getBlogById(commentData.blogId)
          setReportContent((prev) => ({
            ...prev,
            blogTitle: blogData.title,
            blogId: blogData.id,
          }))
        }
      }
    } catch (error) {
      console.error("Error fetching reported content:", error)
      if (error.response && error.response.status === 404) {
        setReportContent({ notFound: true })
        toastUtil.error("The reported content has already been deleted")
      } else {
        toastUtil.error("Failed to load reported content")
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
      const result = await reportUtil.updateReportStatus(id, "resolved")

      if (result.success) {
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

        if (selectedReport && selectedReport.id === id) {
          setSelectedReport({
            ...selectedReport,
            status: "resolved",
            resolvedAt: new Date().toISOString(),
          })
        }
      }
    } catch (error) {
      console.error("Error approving report:", error)
    }
  }

  const handleRejectReport = async (id) => {
    try {
      const result = await reportUtil.updateReportStatus(id, "rejected")

      if (result.success) {
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

        if (selectedReport && selectedReport.id === id) {
          setSelectedReport({
            ...selectedReport,
            status: "rejected",
            resolvedAt: new Date().toISOString(),
          })
        }
      }
    } catch (error) {
      console.error("Error rejecting report:", error)
    }
  }

  const handleDeleteReportedContent = async (report) => {
    try {
      if (report.type === "blog" && report.blogId) {
        // Delete the blog
        await blogUtil.deleteBlog(report.blogId)

        // Also delete all comments associated with this blog
        // We'll use a direct API call here since commentUtil doesn't have a method for this
        const commentsResponse = await fetch(`http://localhost:3001/comments?blogId=${report.blogId}`)
        const commentsData = await commentsResponse.json()

        for (const comment of commentsData) {
          await commentUtil.deleteComment(comment.id)
        }

        toastUtil.success("Blog and its comments deleted successfully")
      } else if (report.type === "comment" && report.commentId) {
        // Delete the comment
        await commentUtil.deleteComment(report.commentId)

        // Also delete all replies to this comment
        const repliesResponse = await fetch(`http://localhost:3001/comments?parentId=${report.commentId}`)
        const repliesData = await repliesResponse.json()

        for (const reply of repliesData) {
          await commentUtil.deleteComment(reply.id)
        }

        toastUtil.success("Comment and its replies deleted successfully")
      }

      // Update report status
      await fetch(`http://localhost:3001/reports/${report.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "resolved",
          resolvedAt: new Date().toISOString(),
          actionTaken: "deleted",
        }),
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
      toastUtil.error("Failed to delete reported content")
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

  const getColumns = () => {
    const baseColumns = [
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
        responsive: ["md"],
      },
      {
        title: "Reason",
        dataIndex: "reason",
        key: "reason",
        render: (reason) => reason || "No reason provided",
        ellipsis: true,
        responsive: ["lg"],
      },
      {
        title: "Date",
        dataIndex: "createdAt",
        key: "createdAt",
        render: (date) => new Date(date).toLocaleDateString(),
        responsive: ["md"],
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
          <Space size="small" wrap>
            {windowWidth <= 576 ? (
              <>
                <Tooltip title="View">
                  <Button icon={<EyeOutlined />} onClick={() => showDrawer(record)} size="small" />
                </Tooltip>
                {record.status === "pending" && (
                  <>
                    <Tooltip title="Approve">
                      <Button
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        onClick={() => handleApproveReport(record.id)}
                        size="small"
                      />
                    </Tooltip>
                    <Tooltip title="Reject">
                      <Button
                        danger
                        icon={<CloseCircleOutlined />}
                        onClick={() => handleRejectReport(record.id)}
                        size="small"
                      />
                    </Tooltip>
                  </>
                )}
              </>
            ) : (
              <>
                <Button icon={<EyeOutlined />} onClick={() => showDrawer(record)}>
                  {windowWidth > 768 ? "View" : ""}
                </Button>
                {record.status === "pending" && (
                  <>
                    <Button
                      type="primary"
                      icon={<CheckCircleOutlined />}
                      onClick={() => handleApproveReport(record.id)}
                    >
                      {windowWidth > 768 ? "Approve" : ""}
                    </Button>
                    <Button danger icon={<CloseCircleOutlined />} onClick={() => handleRejectReport(record.id)}>
                      {windowWidth > 768 ? "Reject" : ""}
                    </Button>
                  </>
                )}
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
          <Title level={2}>Manage Reports</Title>
        </Col>
      </Row>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab={`Pending (${reports.filter((r) => r.status === "pending").length})`} key="pending" />
          <TabPane tab={`Resolved (${reports.filter((r) => r.status === "resolved").length})`} key="resolved" />
          <TabPane tab={`Rejected (${reports.filter((r) => r.status === "rejected").length})`} key="rejected" />
        </Tabs>

        <Table
          columns={getColumns()}
          dataSource={filteredReports}
          rowKey="id"
          loading={loading}
          scroll={{ x: "max-content" }}
          pagination={{
            responsive: true,
            showSizeChanger: windowWidth > 576,
            defaultPageSize: windowWidth <= 576 ? 5 : 10,
          }}
          expandable={{
            expandedRowRender: (record) => (
              <div style={{ margin: 0 }}>
                {windowWidth <= 768 && (
                  <>
                    <p>
                      <strong>Reported By:</strong> {getUserName(record.userId)}
                    </p>
                    <p>
                      <strong>Date:</strong> {new Date(record.createdAt).toLocaleDateString()}
                    </p>
                  </>
                )}
                {windowWidth <= 992 && (
                  <p>
                    <strong>Reason:</strong> {record.reason || "No reason provided"}
                  </p>
                )}
              </div>
            ),
          }}
        />
      </Card>

      <Drawer
        title="Report Details"
        placement="right"
        onClose={closeDrawer}
        open={drawerVisible}
        width={windowWidth < 768 ? "100%" : 600}
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
            <Descriptions
              title="Report Information"
              bordered
              column={1}
              layout={windowWidth < 576 ? "vertical" : "horizontal"}
            >
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
                        <Descriptions bordered column={1} layout={windowWidth < 576 ? "vertical" : "horizontal"}>
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
                        <Descriptions bordered column={1} layout={windowWidth < 576 ? "vertical" : "horizontal"}>
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

