"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, Users, Video, BarChart } from 'lucide-react'

interface RecentActivity {
  title: string
  description: string
  timestamp: string
}

interface TutorCourse {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  createdAt: string;
  students: number;
  videos: number;
}

interface TutorDashboardData {
  name: string
  role: 'tutor'
  totalCourses: number
  totalStudents: number
  totalVideos: number
  averageRating?: number | string
  recentActivity?: RecentActivity[]
  courses: TutorCourse[]
}

interface StudentDashboardData {
  name: string
  role: 'student'
  enrolledCourses: any[]
  videosWatched?: number
  overallProgress?: string
  recentActivity?: RecentActivity[]
}

type DashboardData = TutorDashboardData | StudentDashboardData

export default function Dashboard() {
  const [userData, setUserData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/dashboard')
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message)
        }

        setUserData(data)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        if (error instanceof Error && error.message.includes('Unauthorized')) {
          router.push('/signin')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  if (!userData) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {userData.name}!
          </h1>
          <p className="mt-2 text-gray-700">
            {userData.role === 'tutor' 
              ? 'Manage your courses and track student progress'
              : 'Track your learning progress and access your courses'}
          </p>
        </div>

        {userData.role === 'tutor' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/90 rounded-xl shadow-lg p-6 border border-amber-100">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-amber-500" />
                <div className="ml-4">
                  <h2 className="text-lg font-semibold text-gray-900">Total Courses</h2>
                  <p className="text-3xl font-bold text-gray-900">{userData.totalCourses}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/90 rounded-xl shadow-lg p-6 border border-indigo-100">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-indigo-500" />
                <div className="ml-4">
                  <h2 className="text-lg font-semibold text-gray-900">Total Students</h2>
                  <p className="text-3xl font-bold text-gray-900">{userData.totalStudents}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/90 rounded-xl shadow-lg p-6 border border-blue-100">
              <div className="flex items-center">
                <Video className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <h2 className="text-lg font-semibold text-gray-900">Total Videos</h2>
                  <p className="text-3xl font-bold text-gray-900">{userData.totalVideos}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/90 rounded-xl shadow-lg p-6 border border-purple-100">
              <div className="flex items-center">
                <BarChart className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <h2 className="text-lg font-semibold text-gray-900">Average Rating</h2>
                  <p className="text-3xl font-bold text-gray-900">{userData.averageRating || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white/90 rounded-xl shadow-lg p-6 border border-amber-100">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-amber-500" />
                <div className="ml-4">
                  <h2 className="text-lg font-semibold text-gray-900">Enrolled Courses</h2>
                  <p className="text-3xl font-bold text-gray-900">{userData.enrolledCourses?.length || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/90 rounded-xl shadow-lg p-6 border border-blue-100">
              <div className="flex items-center">
                <Video className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <h2 className="text-lg font-semibold text-gray-900">Videos Watched</h2>
                  <p className="text-3xl font-bold text-gray-900">{userData.videosWatched || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/90 rounded-xl shadow-lg p-6 border border-purple-100">
              <div className="flex items-center">
                <BarChart className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <h2 className="text-lg font-semibold text-gray-900">Overall Progress</h2>
                  <p className="text-3xl font-bold text-gray-900">{userData.overallProgress || '0%'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Course Button for Tutors */}
        {userData.role === 'tutor' && (
          <div className="mt-8 flex justify-end">
            <a
              href="/dashboard/create-course"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-semibold rounded-lg shadow-sm text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400 transition"
            >
              Create Course
            </a>
          </div>
        )}

        {/* Recent Activity Section - Only for Students */}
        {userData.role === 'student' && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Activity</h2>
            <div className="bg-white/90 rounded-xl shadow-lg overflow-hidden border border-indigo-100">
              <div className="p-6">
                {userData.recentActivity && userData.recentActivity.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {userData.recentActivity.map((activity, index) => (
                      <li key={index} className="py-4">
                        <div className="flex items-center">
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                            <p className="text-sm text-gray-500">{activity.description}</p>
                            <p className="text-xs text-gray-400">{activity.timestamp}</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-center py-4">No recent activity</p>
                )}
              </div>
            </div>
          </div>
        )}

        {userData.role === 'tutor' && (
          <>
            {/* Course List Section */}
            <div className="mt-12">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
                <h2 className="text-2xl font-bold text-gray-900">Your Courses</h2>
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-amber-400 focus:border-amber-400 w-full md:w-72"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(userData.courses.filter(course =>
                  course.title.toLowerCase().includes(search.toLowerCase()) ||
                  course.description?.toLowerCase().includes(search.toLowerCase())
                )).map(course => (
                  <div key={course.id} className="bg-white/90 rounded-xl shadow-lg border border-amber-100 flex flex-col">
                    {course.thumbnailUrl && (
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-full h-40 object-cover rounded-t-xl"
                        onError={e => (e.currentTarget.src = '/placeholder.svg?height=160&width=320')}
                      />
                    )}
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">{course.title}</h3>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">{course.description}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                        <span>👥 {course.students} students</span>
                        <span>🎬 {course.videos} videos</span>
                      </div>
                      <span className="text-xs text-gray-400 mt-auto">Created: {new Date(course.createdAt).toLocaleDateString()}</span>
                      <a
                        href={`/dashboard/course-details/${course.id}`}
                        className="mt-4 inline-block text-center px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold shadow transition"
                      >
                        View Details
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
} 