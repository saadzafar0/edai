import { NextResponse } from "next/server";
import dbConnect from '../../../utils/db.js';
import User from '../../../models/userModel.js';
import Course from '../../../models/courseModel.js';
import Enrollment from '../../../models/enrollmentModel.js';
import Video from '../../../models/videoModel.js';
import jwt from 'jsonwebtoken';

export async function GET(request) {
  try {
    await dbConnect();
    const token = request.cookies.get('authToken')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized - No token provided' }, { status: 401 });
    }
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ message: 'Unauthorized - Invalid token' }, { status: 401 });
    }
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    if (user.role === 'tutor') {
      // Tutor dashboard data
      const tutorCourses = await Course.find({ tutor: user._id });
      const courseIds = tutorCourses.map(course => course._id);
      const enrollmentCounts = await Enrollment.aggregate([
        { $match: { courseId: { $in: courseIds } } },
        { $group: { _id: "$courseId", studentCount: { $sum: 1 } } }
      ]);
      const enrollmentMap = {};
      enrollmentCounts.forEach(item => {
        enrollmentMap[item._id.toString()] = item.studentCount;
      });
      // Calculate total students (unique)
      const allEnrollments = await Enrollment.find({ courseId: { $in: courseIds } });
      const uniqueStudentIds = new Set(allEnrollments.map(e => e.studentId.toString()));
      // Calculate total videos
      let totalVideos = 0;
      tutorCourses.forEach(course => {
        if (Array.isArray(course.videos)) {
          totalVideos += course.videos.length;
        }
      });
      // Calculate average rating (dummy for now)
      const averageRating = null;
      // Get recent activity (e.g., recent enrollments)
      const recentEnrollments = await Enrollment.find({ courseId: { $in: courseIds } })
        .sort({ enrolledAt: -1 })
        .limit(5)
        .populate('studentId', 'name');
      const recentActivity = recentEnrollments.map(e => ({
        title: 'New Enrollment',
        description: `${e.studentId.name} enrolled in a course`,
        timestamp: e.enrolledAt.toISOString()
      }));
      // Build detailed course list
      const courseList = tutorCourses.map(course => ({
        id: course._id,
        title: course.title,
        description: course.description,
        thumbnailUrl: course.thumbnailUrl,
        createdAt: course.createdAt,
        students: enrollmentMap[course._id.toString()] || 0,
        videos: Array.isArray(course.videos) ? course.videos.length : 0
      }));
      return NextResponse.json({
        name: user.name,
        role: 'tutor',
        totalCourses: tutorCourses.length,
        totalStudents: uniqueStudentIds.size,
        totalVideos,
        averageRating,
        recentActivity,
        courses: courseList
      });
    } else if (user.role === 'student') {
      // Student dashboard data
      // Find enrollments for this student
      const enrollments = await Enrollment.find({ studentId: user._id });
      // Find enrolled courses
      const enrolledCourseIds = enrollments.map(e => e.courseId);
      const enrolledCourses = await Course.find({ _id: { $in: enrolledCourseIds } });
      // Calculate videos watched (dummy for now)
      const videosWatched = 0;
      // Calculate overall progress (dummy for now)
      const overallProgress = '0%';
      // Get recent activity (e.g., recent enrollments)
      const recentEnrollments = await Enrollment.find({ studentId: user._id })
        .sort({ enrolledAt: -1 })
        .limit(5)
        .populate('courseId', 'title');
      const recentActivity = recentEnrollments.map(e => ({
        title: 'Course Enrollment',
        description: `Enrolled in ${e.courseId.title}`,
        timestamp: e.enrolledAt.toISOString()
      }));
      return NextResponse.json({
        name: user.name,
        role: 'student',
        enrolledCourses,
        videosWatched,
        overallProgress,
        recentActivity
      });
    } else {
      return NextResponse.json({ message: 'Invalid user role' }, { status: 400 });
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}