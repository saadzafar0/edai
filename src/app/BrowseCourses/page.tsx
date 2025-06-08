// app/student/browsecourses/page.tsx
"use client"
import CourseList from '@/components/CourseList';

export default function BrowseCoursesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-indigo-100">
      <h1 className="text-3xl font-bold mb-6 text-center text-amber-700 drop-shadow">Browse Courses</h1>
      <CourseList />
    </div>
  );
}
