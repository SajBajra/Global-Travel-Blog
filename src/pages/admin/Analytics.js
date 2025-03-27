"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Card, Row, Col, Statistic, Typography, Table, Spin, Select, Space } from "antd"
import { UserOutlined, EyeOutlined, FileTextOutlined, HeartOutlined, CommentOutlined } from "@ant-design/icons"
import { Bar, Pie } from "react-chartjs-2"
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title as ChartTitle,
    Tooltip,
    Legend,
} from "chart.js"
import "./AdminPages.css"

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    ChartTitle,
    Tooltip,
    Legend,
)

const { Title } = Typography
const { Option } = Select

const Analytics = () => {
    const [blogs, setBlogs] = useState([])
    const [users, setUsers] = useState([])
    const [comments, setComments] = useState([])
    const [likes, setLikes] = useState([])
    const [loading, setLoading] = useState(true)
    const [timeFrame, setTimeFrame] = useState("week")
    const [usersChartData, setUsersChartData] = useState({ labels: [], datasets: [] })

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const [blogsResponse, usersResponse, commentsResponse, likesResponse] =
                    await Promise.all([
                        axios.get("http://localhost:3001/blogs"),
                        axios.get("http://localhost:3001/users"),
                        axios.get("http://localhost:3001/comments"),
                        axios.get("http://localhost:3001/likes"),
                    ])

                setBlogs(blogsResponse.data)
                setUsers(usersResponse.data)
                setComments(commentsResponse.data)
                setLikes(likesResponse.data)
                setLoading(false)
            } catch (error) {
                console.error("Error fetching analytics data:", error)
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    useEffect(() => {
        if (!loading) {
            const generateUsersChartData = () => {
                const today = new Date()
                let startDate
                switch (timeFrame) {
                    case "week":
                        startDate = new Date(today)
                        startDate.setDate(today.getDate() - 6)
                        break
                    case "month":
                        startDate = new Date(today)
                        startDate.setDate(today.getDate() - 29)
                        break
                    case "year":
                        startDate = new Date(today)
                        startDate.setDate(today.getDate() - 364)
                        break
                    default:
                        startDate = new Date(today)
                        startDate.setDate(today.getDate() - 6)
                }

                const dailyNewUsers = {}
                const filteredUsers = users.filter(user => new Date(user.createdAt) >= startDate && new Date(user.createdAt) <= today)
                filteredUsers.forEach(user => {
                    const date = user.createdAt.split("T")[0]
                    dailyNewUsers[date] = (dailyNewUsers[date] || 0) + 1
                })

                const usersLabels = Object.keys(dailyNewUsers).sort()
                const newUsersData = usersLabels.map(date => dailyNewUsers[date] || 0)

                setUsersChartData({
                    labels: usersLabels,
                    datasets: [
                        {
                            label: "New Users",
                            data: newUsersData,
                            backgroundColor: "rgba(255, 99, 132, 0.5)",
                        },
                    ],
                })
            }

            generateUsersChartData()
        }
    }, [loading, users, timeFrame])

    // Category distribution data
    const categoryData = {}
    blogs.forEach((blog) => {
        if (blog.category) {
            categoryData[blog.category] = (categoryData[blog.category] || 0) + 1
        }
    })

    const categoryChartData = {
        labels: Object.keys(categoryData),
        datasets: [
            {
                data: Object.values(categoryData),
                backgroundColor: [
                    "rgba(255, 99, 132, 0.6)",
                    "rgba(54, 162, 235, 0.6)",
                    "rgba(255, 206, 86, 0.6)",
                    "rgba(75, 192, 192, 0.6)",
                    "rgba(153, 102, 255, 0.6)",
                    "rgba(255, 159, 64, 0.6)",
                ],
                borderColor: [
                    "rgba(255, 99, 132, 1)",
                    "rgba(54, 162, 235, 1)",
                    "rgba(255, 206, 86, 1)",
                    "rgba(75, 192, 192, 1)",
                    "rgba(153, 102, 255, 1)",
                    "rgba(255, 159, 64, 1)",
                ],
                borderWidth: 1,
            },
        ],
    }

    const topBlogsColumns = [
        {
            title: "Blog Title",
            dataIndex: "title",
            key: "title",
        },
        {
            title: "Likes",
            dataIndex: "likes",
            key: "likes",
            sorter: (a, b) => a.likes - b.likes,
        },
    ]

    const topBlogsData = [...blogs]
        .sort((a, b) => (b.likes || 0) - (a.likes || 0))
        .slice(0, 5)
        .map((blog) => ({
            id: blog.id,
            title: blog.title,
            likes: blog.likes || 0,
        }))

    const handleTimeFrameChange = (value) => {
        setTimeFrame(value)
    }

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
                    <Space>
                        <Select defaultValue="week" style={{ width: 120 }} onChange={handleTimeFrameChange}>
                            <Option value="week">Last Week</Option>
                            <Option value="month">Last Month</Option>
                            <Option value="year">Last Year</Option>
                        </Select>
                    </Space>
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
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
                            title="Total Comments"
                            value={comments.length}
                            prefix={<CommentOutlined />}
                            valueStyle={{ color: "#fa8c16" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Total Likes"
                            value={likes.length}
                            prefix={<HeartOutlined />}
                            valueStyle={{ color: "#eb2f96" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Total Users"
                            value={users.length}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: "#1890ff" }}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24} lg={8}>
                    <Card title="Blog Categories">
                        <Pie
                            data={categoryChartData}
                            options={{
                                responsive: true,
                                plugins: {
                                    legend: {
                                        position: "right",
                                    },
                                    title: {
                                        display: false,
                                    },
                                },
                            }}
                        />
                    </Card>
                </Col>
                <Col xs={24} lg={16}>
                    <Card title="New User Registrations">
                        <Bar
                            data={usersChartData}
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
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                    },
                                },
                            }}
                        />
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
                    <Card title="User Engagement">
                        <Statistic
                            title="Total Likes"
                            value={likes.length}
                            prefix={<HeartOutlined />}
                            valueStyle={{ color: "#eb2f96" }}
                            style={{ marginBottom: 24 }}
                        />
                        <Statistic
                            title="Average Comments Per Blog"
                            value={(comments.length / Math.max(1, blogs.length)).toFixed(2)}
                            prefix={<CommentOutlined />}
                            valueStyle={{ color: "#1890ff" }}
                            style={{ marginBottom: 24 }}
                        />
                        <Statistic
                            title="New Users Registered"
                            value={users.filter(user => {
                                const createdAt = new Date(user.createdAt);
                                const today = new Date();
                                let startDate;
                                switch (timeFrame) {
                                    case "week":
                                        startDate = new Date();
                                        startDate.setDate(today.getDate() - 6);
                                        break;
                                    case "month":
                                        startDate = new Date();
                                        startDate.setDate(today.getDate() - 29);
                                        break;
                                    case "year":
                                        startDate = new Date();
                                        startDate.setDate(today.getDate() - 364);
                                        break;
                                    default:
                                        startDate = new Date();
                                        startDate.setDate(today.getDate() - 6);
                                }
                                return createdAt >= startDate && createdAt <= today;
                            }).length}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: "#52c41a" }}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    )
}

export default Analytics