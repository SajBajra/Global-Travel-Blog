"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Card, Row, Col, Statistic, Typography, Table, DatePicker, Spin, Empty } from "antd"
import { UserOutlined, EyeOutlined, FileTextOutlined, GlobalOutlined } from "@ant-design/icons"
import { Line, Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
} from "chart.js"
import "./AdminPages.css"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ChartTitle, Tooltip, Legend)

const { Title } = Typography
const { RangePicker } = DatePicker

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState([])
  const [blogs, setBlogs] = useState([])
  const [destinations, setDestinations] = useState([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState([null, null])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch analytics data
        const analyticsResponse = await axios.get("http://localhost:3001/analytics")
        setAnalyticsData(analyticsResponse.data)

        // Fetch blogs
        const blogsResponse = await axios.get("http://localhost:3001/blogs")
        setBlogs(blogsResponse.data)

        // Fetch destinations
        const destinationsResponse = await axios.get("http://localhost:3001/destinations")
        setDestinations(destinationsResponse.data)
      } catch (error) {
        console.error("Error fetching analytics data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Calculate total stats
  const totalPageViews = analyticsData.reduce((sum, day) => sum + day.pageViews, 0)
  const totalUniqueVisitors = analyticsData.reduce((sum, day) => sum + day.uniqueVisitors, 0)
  const totalNewUsers = analyticsData.reduce((sum, day) => sum + day.newUsers, 0)

  // Prepare chart data
  const chartLabels = analyticsData.map((day) => day.date)

  const pageViewsData = {
    labels: chartLabels,
    datasets: [
      {
        label: "Page Views",
        data: analyticsData.map((day) => day.pageViews),
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
      {
        label: "Unique Visitors",
        data: analyticsData.map((day) => day.uniqueVisitors),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
      },
    ],
  }

  const newUsersData = {
    labels: chartLabels,
    datasets: [
      {
        label: "New Users",
        data: analyticsData.map((day) => day.newUsers),
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  }

  // Calculate top blogs
  const blogCounts = {}
  analyticsData.forEach((day) => {
    day.topBlogs.forEach((blogId) => {
      blogCounts[blogId] = (blogCounts[blogId] || 0) + 1
    })
  })

  const topBlogsData = Object.entries(blogCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([blogId, count]) => {
      const blog = blogs.find((b) => b.id === Number.parseInt(blogId))
      return {
        id: blogId,
        title: blog ? blog.title : `Blog ${blogId}`,
        views: count,
      }
    })

  // Calculate top destinations
  const destinationCounts = {}
  analyticsData.forEach((day) => {
    day.topDestinations.forEach((destId) => {
      destinationCounts[destId] = (destinationCounts[destId] || 0) + 1
    })
  })

  const topDestinationsData = Object.entries(destinationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([destId, count]) => {
      const destination = destinations.find((d) => d.id === Number.parseInt(destId))
      return {
        id: destId,
        name: destination ? destination.name : `Destination ${destId}`,
        views: count,
      }
    })

  const topBlogsColumns = [
    {
      title: "Blog Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Views",
      dataIndex: "views",
      key: "views",
      sorter: (a, b) => a.views - b.views,
    },
  ]

  const topDestinationsColumns = [
    {
      title: "Destination",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Views",
      dataIndex: "views",
      key: "views",
      sorter: (a, b) => a.views - b.views,
    },
  ]

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className="admin-analytics-page">
      <Row justify="space-between" align="middle" className="page-header">
        <Col>
          <Title level={2}>Analytics Dashboard</Title>
        </Col>
        <Col>
          <RangePicker onChange={setDateRange} />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Page Views"
              value={totalPageViews}
              prefix={<EyeOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Unique Visitors"
              value={totalUniqueVisitors}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Blogs"
              value={blogs.length}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Destinations"
              value={destinations.length}
              prefix={<GlobalOutlined />}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Page Views & Visitors">
            {analyticsData.length > 0 ? (
              <Line
                data={pageViewsData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: "top",
                    },
                    title: {
                      display: false,
                    },
                  },
                }}
              />
            ) : (
              <Empty description="No data available" />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="New Users">
            {analyticsData.length > 0 ? (
              <Bar
                data={newUsersData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: "top",
                    },
                    title: {
                      display: false,
                    },
                  },
                }}
              />
            ) : (
              <Empty description="No data available" />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Top Blogs">
            <Table columns={topBlogsColumns} dataSource={topBlogsData} rowKey="id" pagination={false} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Top Destinations">
            <Table columns={topDestinationsColumns} dataSource={topDestinationsData} rowKey="id" pagination={false} />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Analytics

